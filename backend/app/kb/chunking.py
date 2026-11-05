from dataclasses import dataclass


@dataclass(frozen=True)
class Chunk:
    id: str  # 形如 "{source}#{序号}",同一输入多次运行必须一致
    text: str  # 以所属小节标题开头
    source: str
    section: str
    unlock_tier: int  # 0..3,来自文档头信息


class KbFormatError(ValueError):
    """知识库文档格式不合法(缺少头信息、档位越界等)。"""


def chunk_markdown(text: str, source: str, target_chars: int = 300, overlap: int = 40) -> list[Chunk]:
    # TODO(Hannah): 这个函数由你来实现。测试在 tests/test_chunking.py,用 `pytest -m handoff` 运行。
    # 提示:先按 `##` 切小节,再在小节内按句号/换行贪心装块,相邻块保留 overlap 个字符的重叠。
    raise NotImplementedError("chunk_markdown 由 Hannah 实现,见 tests/test_chunking.py")
