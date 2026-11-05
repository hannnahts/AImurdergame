from app.kb.store import ChromaStore


class _OkClient:
    def heartbeat(self):
        return 1


class _DownClient:
    def heartbeat(self):
        raise ConnectionError("unreachable")


def test_ping_true_when_heartbeat_succeeds():
    assert ChromaStore(_OkClient()).ping() is True


def test_ping_false_when_heartbeat_raises():
    assert ChromaStore(_DownClient()).ping() is False
