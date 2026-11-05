from fastapi import FastAPI

from .config import Settings


def create_app(settings: Settings, *, store=None, embedder=None, llm=None, limiter=None) -> FastAPI:
    app = FastAPI(title="xiaoa-rag")
    app.state.settings = settings
    app.state.store = store
    app.state.embedder = embedder
    app.state.llm = llm
    app.state.limiter = limiter

    @app.get("/health")
    def health() -> dict[str, str]:
        current = app.state.store
        chroma = "ok" if current is not None and current.ping() else "down"
        return {"status": "ok", "chroma": chroma}

    return app


# 供 uvicorn 使用;导入时不连接任何外部服务
app = create_app(Settings())
