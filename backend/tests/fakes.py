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


def make_chunk(i: int, text: str, tier: int = 0, source: str = "a.md", section: str = "节"):
    from app.kb.chunking import Chunk

    return Chunk(id=f"{source}#{i}", text=text, source=source, section=section, unlock_tier=tier)


class FakeLLM:
    """记录收到的 messages,返回预设回复;可注入错误。"""

    def __init__(self, text: str = "好的", input_tokens: int = 100, output_tokens: int = 20, error: Exception | None = None):
        self.text, self.input_tokens, self.output_tokens, self.error = text, input_tokens, output_tokens, error
        self.calls: list[list[dict[str, str]]] = []

    def complete(self, messages, max_tokens: int = 400):
        from app.llm import Completion

        self.calls.append(messages)
        if self.error:
            raise self.error
        return Completion(self.text, self.input_tokens, self.output_tokens)


import re  # noqa: E402


def simple_chunker(text: str, source: str, target_chars: int = 300, overlap: int = 40):
    """测试内自带的简单分块器(每个 `##` 小节一块),不依赖 Hannah 的实现。"""
    from app.kb.chunking import Chunk, KbFormatError

    m = re.match(r"---\nunlock_tier: (\d+)\n---\n", text)
    if not m:
        raise KbFormatError("missing front matter")
    tier = int(m.group(1))
    body = text[m.end():]
    parts = [p for p in re.split(r"^## ", body, flags=re.M) if p.strip()]
    chunks = []
    for i, p in enumerate(parts):
        title, _, rest = p.partition("\n")
        chunks.append(Chunk(id=f"{source}#{i}", text=f"{title}\n{rest}".strip(), source=source, section=title.strip(), unlock_tier=tier))
    return chunks
