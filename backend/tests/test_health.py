from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


class _Store:
    def __init__(self, ok: bool):
        self._ok = ok

    def ping(self) -> bool:
        return self._ok


def test_health_ok_when_store_pings():
    client = TestClient(create_app(Settings(), store=_Store(True)))
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "chroma": "ok"}


def test_health_reports_chroma_down():
    client = TestClient(create_app(Settings(), store=_Store(False)))
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["chroma"] == "down"


def test_settings_env_override(monkeypatch):
    monkeypatch.setenv("PER_ID_DAILY", "7")
    s = Settings()
    assert s.per_id_daily == 7
    assert s.daily_budget_usd == 3.0
    assert s.deepseek_model == "deepseek-flash"


def test_allowed_origins_comma_separated(monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://a.example, https://b.example")
    assert Settings().origin_list == ["https://a.example", "https://b.example"]
