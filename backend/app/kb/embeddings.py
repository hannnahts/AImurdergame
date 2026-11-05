from typing import Protocol, runtime_checkable


@runtime_checkable
class Embedder(Protocol):
    def embed_passages(self, texts: list[str]) -> list[list[float]]: ...

    def embed_query(self, text: str) -> list[float]: ...


def prefixes_for(model_name: str) -> tuple[str, str]:
    """返回 (查询前缀, 文档前缀)。e5 系列要求显式前缀,其它模型不需要。"""
    if "e5" in model_name.lower():
        return "query: ", "passage: "
    return "", ""


class SentenceTransformerEmbedder:
    """本地多语言嵌入。sentence-transformers(依赖 torch)在构造时才导入,
    这样只跑单元测试的环境不需要安装它。"""

    def __init__(self, model_name: str):
        from sentence_transformers import SentenceTransformer

        self._model = SentenceTransformer(model_name)
        self._query_prefix, self._passage_prefix = prefixes_for(model_name)

    def _encode(self, texts: list[str]) -> list[list[float]]:
        vectors = self._model.encode(texts, normalize_embeddings=True)
        return [[float(x) for x in v] for v in vectors]

    def embed_passages(self, texts: list[str]) -> list[list[float]]:
        return self._encode([self._passage_prefix + t for t in texts])

    def embed_query(self, text: str) -> list[float]:
        return self._encode([self._query_prefix + text])[0]
