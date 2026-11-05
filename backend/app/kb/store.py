from dataclasses import dataclass

from .chunking import Chunk


@dataclass(frozen=True)
class Hit:
    id: str
    text: str
    source: str
    section: str
    unlock_tier: int
    distance: float


class ChromaStore:
    """Chroma 向量库的薄封装。嵌入由调用方计算并显式传入,不使用 Chroma 的默认嵌入。"""

    def __init__(self, client, collection_name: str = "worldview"):
        self._client = client
        self._name = collection_name
        self._collection = None

    def _col(self):
        if self._collection is None:
            self._collection = self._client.get_or_create_collection(
                name=self._name, metadata={"hnsw:space": "cosine"}
            )
        return self._collection

    def ping(self) -> bool:
        try:
            self._client.heartbeat()
            return True
        except Exception:
            return False

    def reset(self) -> None:
        try:
            self._client.delete_collection(self._name)
        except Exception:
            pass  # 集合不存在时无需处理
        self._collection = None

    def upsert(self, chunks: list[Chunk], embeddings: list[list[float]]) -> None:
        if not chunks:
            return
        self._col().upsert(
            ids=[c.id for c in chunks],
            embeddings=embeddings,
            documents=[c.text for c in chunks],
            metadatas=[
                {"source": c.source, "section": c.section, "unlock_tier": c.unlock_tier} for c in chunks
            ],
        )

    def delete_missing(self, keep_ids: set[str], source: str) -> int:
        """删除某个来源文档里不在 keep_ids 中的旧片段,返回删除数量。"""
        existing = self._col().get(where={"source": source}, include=[])["ids"]
        stale = [i for i in existing if i not in keep_ids]
        if stale:
            self._col().delete(ids=stale)
        return len(stale)

    def sources(self) -> set[str]:
        metadatas = self._col().get(include=["metadatas"])["metadatas"] or []
        return {m["source"] for m in metadatas}

    def count(self) -> int:
        return self._col().count()

    def query(self, embedding: list[float], k: int, max_tier: int) -> list[Hit]:
        total = self.count()
        if total == 0:
            return []
        result = self._col().query(
            query_embeddings=[embedding],
            n_results=min(k, total),
            where={"unlock_tier": {"$lte": max_tier}},
            include=["documents", "metadatas", "distances"],
        )
        hits = []
        for id_, doc, meta, dist in zip(
            result["ids"][0], result["documents"][0], result["metadatas"][0], result["distances"][0]
        ):
            hits.append(Hit(id=id_, text=doc, source=meta["source"], section=meta["section"],
                            unlock_tier=int(meta["unlock_tier"]), distance=float(dist)))
        return hits
