from app.rag.retrieve import retrieve
from tests.fakes import make_chunk


def test_retrieve_respects_tier_and_k(store, embedder):
    chunks = [make_chunk(i, "灯光亮度调节", tier=i) for i in range(4)]
    store.upsert(chunks, embedder.embed_passages([c.text for c in chunks]))
    hits = retrieve("灯光亮度", max_tier=1, k=1, embedder=embedder, store=store)
    assert len(hits) == 1
    assert hits[0].unlock_tier <= 1
