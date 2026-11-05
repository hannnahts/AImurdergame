"""用真实的 uvicorn 验证:加 --proxy-headers 之后,限额器看到的是 X-Forwarded-For 里的客户端 IP。
(生产里所有请求都来自 Caddy,不处理的话每个 IP 的限额会变成全站共用。)"""
import socket
import threading
import time

import httpx
import uvicorn

from app.config import Settings
from app.limits import LimitDecision
from app.main import create_app
from tests.fakes import FakeEmbedder, FakeLLM, make_chunk


class SpyLimiter:
    def __init__(self):
        self.ips: list[str] = []

    def check_and_reserve(self, anon_id, ip):
        self.ips.append(ip)
        return LimitDecision.RATE_LIMITED  # 只关心 IP,不必走完整个流程

    def record_cost(self, usd):
        pass


def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def test_limiter_sees_the_forwarded_client_ip(store):
    limiter = SpyLimiter()
    app = create_app(Settings(), store=store, embedder=FakeEmbedder(), llm=FakeLLM(), limiter=limiter)
    port = _free_port()
    server = uvicorn.Server(uvicorn.Config(app, host="127.0.0.1", port=port, proxy_headers=True, forwarded_allow_ips="*", log_level="error"))
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    try:
        for _ in range(100):
            if server.started:
                break
            time.sleep(0.05)
        assert server.started
        body = {"anon_id": "anon-test-1", "tier": 0, "message": "灯光", "history": []}
        r = httpx.post(f"http://127.0.0.1:{port}/chat", json=body, headers={"X-Forwarded-For": "203.0.113.9"})
        assert r.status_code == 429
        assert limiter.ips == ["203.0.113.9"]
    finally:
        server.should_exit = True
        thread.join(timeout=5)
