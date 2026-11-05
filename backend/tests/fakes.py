"""测试替身:无网络、无模型下载、结果确定。"""
import math
import zlib

DIM = 16


class FakeEmbedder:
    """按字符哈希到 16 个桶并归一化:共享字符越多,余弦相似度越高。"""

    def _vec(self, text: str) -> list[float]:
        v = [0.0] * DIM
        for ch in text:
            v[zlib.crc32(ch.encode()) % DIM] += 1.0
        norm = math.sqrt(sum(x * x for x in v)) or 1.0
        return [x / norm for x in v]

    def embed_passages(self, texts: list[str]) -> list[list[float]]:
        return [self._vec(t) for t in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._vec(text)
