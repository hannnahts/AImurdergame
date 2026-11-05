import math
import sys

import pytest

from tests.fakes import FakeEmbedder


def _cos(a, b):
    return sum(x * y for x, y in zip(a, b))


def test_fake_embedder_is_deterministic():
    e = FakeEmbedder()
    assert e.embed_query("灯光亮度") == e.embed_query("灯光亮度")


def test_fake_embedder_similar_texts_closer():
    e = FakeEmbedder()
    q = e.embed_query("灯光亮度怎么调")
    near = e.embed_passages(["灯光亮度可以调节"])[0]
    far = e.embed_passages(["浴室热水器接地"])[0]
    assert _cos(q, near) > _cos(q, far)


def test_fake_embedder_shape_and_normalization():
    vecs = FakeEmbedder().embed_passages(["a", "b"])
    assert len(vecs) == 2 and len(vecs[0]) == len(vecs[1]) == 16
    assert abs(math.sqrt(sum(x * x for x in vecs[0])) - 1.0) < 1e-6


def test_fake_embedder_satisfies_protocol():
    from app.kb.embeddings import Embedder

    assert isinstance(FakeEmbedder(), Embedder)


def test_importing_module_does_not_import_sentence_transformers():
    import app.kb.embeddings  # noqa: F401

    assert "sentence_transformers" not in sys.modules


def test_prefix_rules():
    from app.kb.embeddings import prefixes_for

    assert prefixes_for("intfloat/multilingual-e5-small") == ("query: ", "passage: ")
    assert prefixes_for("BAAI/bge-small-zh-v1.5") == ("", "")


@pytest.mark.slow
def test_real_model_ranks_related_passage_higher():
    pytest.importorskip("sentence_transformers")
    from app.kb.embeddings import SentenceTransformerEmbedder

    e = SentenceTransformerEmbedder("BAAI/bge-small-zh-v1.5")
    q = e.embed_query("怎么调节灯光亮度?")
    near, far = e.embed_passages(["灯光亮度可以在面板里调节。", "浴室的热水器需要定期检修。"])
    assert _cos(q, near) > _cos(q, far)
