import uuid

import chromadb
import pytest

from app.kb.store import ChromaStore
from tests.fakes import FakeEmbedder


@pytest.fixture
def embedder():
    return FakeEmbedder()


@pytest.fixture
def store():
    # 每个测试一个独立集合,避免内存客户端之间互相污染
    return ChromaStore(chromadb.EphemeralClient(), collection_name="t" + uuid.uuid4().hex)
