import chromadb
from fastapi import FastAPI

from .config import Settings
from .kb.store import ChromaStore


def create_app(settings: Settings, *, store=None, embedder=None, llm=None, limiter=None) -> FastAPI:
    app = FastAPI(title="xiaoa-rag")
    app.state.settings = settings
    app.state.store = store
    app.state.embedder = embedder
    app.state.llm = llm
    app.state.limiter = limiter

    def get_store():
        """惰性连接 Chroma:导入或创建应用时不连接;首次需要时才连,失败返回 None 且不缓存。"""
        if app.state.store is None:
            try:
                client = chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)
                app.state.store = ChromaStore(client)
            except Exception:
                return None
        return app.state.store

    app.state.get_store = get_store

    @app.get("/health")
    def health() -> dict[str, str]:
        current = get_store()
        chroma = "ok" if current is not None and current.ping() else "down"
        return {"status": "ok", "chroma": chroma}

    return app


# 供 uvicorn 使用;导入时不连接任何外部服务
app = create_app(Settings())
