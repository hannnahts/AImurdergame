import re
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


_FRONT_MATTER = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
_TIER_LINE = re.compile(r"^unlock_tier:\s*(\d+)\s*$", re.MULTILINE)
# 一个句子 = 若干非标点字符 + 句末标点;末尾没有标点的残余也算一个句子
_SENTENCE = re.compile(r"[^。!?!?;;]*[。!?!?;;]|[^。!?!?;;]+")


def _parse_front_matter(text: str) -> tuple[int, str]:
    match = _FRONT_MATTER.match(text)
    if not match:
        raise KbFormatError("缺少头信息(文件开头需要 ---/unlock_tier: N/---)")
    tier_line = _TIER_LINE.search(match.group(1))
    if not tier_line:
        raise KbFormatError("头信息里没有 unlock_tier")
    tier = int(tier_line.group(1))
    if not 0 <= tier <= 3:
        raise KbFormatError(f"unlock_tier 必须在 0..3,收到 {tier}")
    return tier, text[match.end():]


def _split_sections(body: str) -> list[tuple[str, str]]:
    """按 `## 标题` 切成 (标题, 正文);第一个 `##` 之前的内容丢弃。"""
    sections: list[tuple[str, list[str]]] = []
    for line in body.splitlines():
        if line.startswith("## "):
            sections.append((line[3:].strip(), []))
        elif sections:
            sections[-1][1].append(line)
    return [(title, "\n".join(lines).strip()) for title, lines in sections]


def _pieces(body: str, limit: int) -> list[str]:
    """把正文切成不超过 limit 的最小单元:先按行,再按句子,仍然太长的硬切。"""
    pieces: list[str] = []
    for line in body.splitlines():
        for sentence in _SENTENCE.findall(line.strip()):
            for start in range(0, len(sentence), limit):
                pieces.append(sentence[start:start + limit])
    return pieces


def chunk_markdown(text: str, source: str, target_chars: int = 300, overlap: int = 40) -> list[Chunk]:
    tier, body = _parse_front_matter(text)
    chunks: list[Chunk] = []
    for title, content in _split_sections(body):
        # 每块最终长度 = 标题 + 换行 + 重叠 + 正文,所以正文预算要先扣掉前三项
        limit = max(target_chars - len(title) - 1 - overlap, 1)
        bodies: list[str] = []
        current = ""
        for piece in _pieces(content, limit):
            if current and len(current) + len(piece) > limit:
                bodies.append(current)
                current = piece
            else:
                current += piece
        if current:
            bodies.append(current)

        for i, piece_text in enumerate(bodies):
            tail = bodies[i - 1][-overlap:] if i > 0 and overlap else ""
            chunks.append(Chunk(
                id=f"{source}#{len(chunks)}",
                text=f"{title}\n{tail}{piece_text}",
                source=source,
                section=title,
                unlock_tier=tier,
            ))
    return chunks
