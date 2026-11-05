from tests.fakes import make_chunk


def _put(store, embedder, chunks):
    store.upsert(chunks, embedder.embed_passages([c.text for c in chunks]))


def test_query_filters_by_tier(store, embedder):
    chunks = [make_chunk(i, "灯光亮度调节说明", tier=i) for i in range(4)]
    _put(store, embedder, chunks)
    q = embedder.embed_query("灯光亮度")
    assert {h.unlock_tier for h in store.query(q, k=10, max_tier=3)} == {0, 1, 2, 3}
    assert {h.unlock_tier for h in store.query(q, k=10, max_tier=1)} == {0, 1}
    assert {h.unlock_tier for h in store.query(q, k=10, max_tier=0)} == {0}


def test_query_orders_by_similarity_and_respects_k(store, embedder):
    _put(store, embedder, [
        make_chunk(0, "浴室热水器接地保护检修"),
        make_chunk(1, "灯光亮度可以调节"),
        make_chunk(2, "灯光亮度色温调节"),
    ])
    hits = store.query(embedder.embed_query("灯光亮度色温"), k=2, max_tier=3)
    assert len(hits) == 2
    assert hits[0].id == "a.md#2" and hits[1].id == "a.md#1"
    assert hits[0].distance <= hits[1].distance


def test_upsert_is_idempotent(store, embedder):
    chunks = [make_chunk(i, f"片段{i}") for i in range(4)]
    _put(store, embedder, chunks)
    _put(store, embedder, chunks)
    assert store.count() == 4


def test_hit_carries_metadata(store, embedder):
    _put(store, embedder, [make_chunk(0, "灯光", tier=2, source="m.md", section="灯光")])
    hit = store.query(embedder.embed_query("灯光"), k=1, max_tier=3)[0]
    assert (hit.id, hit.text, hit.source, hit.section, hit.unlock_tier) == ("m.md#0", "灯光", "m.md", "灯光", 2)


def test_query_on_empty_store_returns_empty(store, embedder):
    assert store.query(embedder.embed_query("灯光"), k=4, max_tier=3) == []


def test_delete_missing_removes_only_stale_chunks_of_that_source(store, embedder):
    _put(store, embedder, [
        make_chunk(0, "a零", source="a.md"), make_chunk(1, "a一", source="a.md"),
        make_chunk(0, "b零", source="b.md"),
    ])
    removed = store.delete_missing({"a.md#0"}, "a.md")
    assert removed == 1
    assert store.count() == 2
    assert store.sources() == {"a.md", "b.md"}


def test_reset_empties_the_collection(store, embedder):
    _put(store, embedder, [make_chunk(0, "灯光")])
    store.reset()
    assert store.count() == 0
