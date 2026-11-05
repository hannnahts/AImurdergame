class ChromaStore:
    """Chroma 向量库的薄封装。检索与写入方法在 Task 5 补全。"""

    def __init__(self, client, collection_name: str = "worldview"):
        self._client = client
        self._name = collection_name

    def ping(self) -> bool:
        try:
            self._client.heartbeat()
            return True
        except Exception:
            return False
