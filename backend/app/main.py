import logging
import time

import chromadb
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import Settings
from .kb.store import ChromaStore
from .limits import LimitDecision, UsageLimiter
from .llm import DeepSeekLLM, LLMError, estimate_cost_usd
from .prompt import build_messages
from .rag.retrieve import retrieve
from .schemas import ChatRequest, ChatResponse

log = logging.getLogger("xiaoa.chat")


def create_app(settings: Settings, *, store=None, embedder=None, llm=None, limiter=None) -> FastAPI:
    app = FastAPI(title="xiaoa-rag")
    app.state.settings = settings
    app.state.store = store
    app.state.embedder = embedder
    app.state.llm = llm
    app.state.limiter = limiter

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origin_list,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["content-type"],
    )

    # ---- 惰性构造:导入或创建应用时不连接任何外部服务、不加载模型 ----
    def get_store():
        if app.state.store is None:
            try:
                client = chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)
                app.state.store = ChromaStore(client)
            except Exception:
                return None
        return app.state.store

    def get_embedder():
        if app.state.embedder is None:
            from .kb.embeddings import SentenceTransformerEmbedder

            app.state.embedder = SentenceTransformerEmbedder(settings.embed_model)
        return app.state.embedder

    def get_llm():
        if app.state.llm is None:
            if not settings.deepseek_api_key:
                raise LLMError("DEEPSEEK_API_KEY is not configured")
            app.state.llm = DeepSeekLLM(api_key=settings.deepseek_api_key, model=settings.deepseek_model)
        return app.state.llm

    def get_limiter():
        if app.state.limiter is None:
            app.state.limiter = UsageLimiter(
                settings.limits_db_path,
                per_id_daily=settings.per_id_daily,
                per_ip_daily=settings.per_ip_daily,
                daily_budget_usd=settings.daily_budget_usd,
            )
        return app.state.limiter

    app.state.get_store = get_store

    @app.get("/health")
    def health() -> dict[str, str]:
        current = get_store()
        chroma = "ok" if current is not None and current.ping() else "down"
        return {"status": "ok", "chroma": chroma}

    def _fail(status: int, code: str, started: float, tier: int) -> JSONResponse:
        # 日志只记元数据,绝不记玩家消息正文
        log.info("chat tier=%s status=%s code=%s ms=%d", tier, status, code, (time.perf_counter() - started) * 1000)
        return JSONResponse(status_code=status, content={"code": code})

    @app.post("/chat", response_model=ChatResponse)
    def chat(req: ChatRequest, request: Request):
        started = time.perf_counter()
        ip = request.client.host if request.client else "unknown"

        decision = get_limiter().check_and_reserve(req.anon_id, ip)
        if decision is LimitDecision.RATE_LIMITED:
            return _fail(429, "rate_limited", started, req.tier)
        if decision is LimitDecision.BUDGET_EXHAUSTED:
            return _fail(429, "budget_exhausted", started, req.tier)

        try:
            current = get_store()
            if current is None or current.count() == 0:
                return _fail(503, "retrieval_unavailable", started, req.tier)
            hits = retrieve(req.message, req.tier, settings.top_k, get_embedder(), current)
        except Exception:
            return _fail(503, "retrieval_unavailable", started, req.tier)

        try:
            completion = get_llm().complete(build_messages(req.message, req.history, hits))
        except LLMError:
            return _fail(503, "llm_error", started, req.tier)

        cost = estimate_cost_usd(completion, settings.price_in_per_m, settings.price_out_per_m)
        get_limiter().record_cost(cost)
        log.info(
            "chat tier=%s status=200 hits=%s in=%d out=%d ms=%d",
            req.tier, [h.id for h in hits], completion.input_tokens, completion.output_tokens,
            (time.perf_counter() - started) * 1000,
        )
        return ChatResponse(
            answer=completion.text,
            sources=[h.id for h in hits],
            input_tokens=completion.input_tokens,
            output_tokens=completion.output_tokens,
        )

    return app


# 供 uvicorn 使用;导入时不连接任何外部服务
app = create_app(Settings())
