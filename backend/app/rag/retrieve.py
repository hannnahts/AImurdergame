from ..kb.embeddings import Embedder
from ..kb.store import ChromaStore, Hit


def retrieve(question: str, max_tier: int, k: int, embedder: Embedder, store: ChromaStore) -> list[Hit]:
    """只检索解锁档位 <= max_tier 的片段(防剧透靠这里的元数据过滤,而不是提示词)。"""
    return store.query(embedder.embed_query(question), k=k, max_tier=max_tier)
