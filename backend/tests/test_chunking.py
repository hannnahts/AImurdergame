"""分块的验收测试。这部分由 Hannah 亲自实现 chunk_markdown(app/kb/chunking.py)。

运行:cd backend && .venv/bin/pytest -m handoff tests/test_chunking.py -v
全部通过后,把下面的 pytestmark 一行删掉,这些测试就会并入默认测试集。
"""
import pytest

from app.kb.chunking import KbFormatError, chunk_markdown


DOC = (
    "---\nunlock_tier: 2\n---\n"
    "## 灯光\n" + "灯光可以调节亮度和色温。" * 30 + "\n"
    "## 窗帘\n窗帘可以全开或半开。\n"
)


def test_unlock_tier_from_front_matter():
    chunks = chunk_markdown(DOC, "manual.md")
    assert chunks
    assert all(c.unlock_tier == 2 for c in chunks)


def test_missing_front_matter_raises():
    with pytest.raises(KbFormatError):
        chunk_markdown("## 灯光\n内容", "x.md")


def test_tier_out_of_range_raises():
    with pytest.raises(KbFormatError):
        chunk_markdown("---\nunlock_tier: 9\n---\n## 灯光\n内容", "x.md")


def test_section_title_prefixes_each_chunk():
    chunks = chunk_markdown(DOC, "manual.md")
    assert {c.section for c in chunks} == {"灯光", "窗帘"}
    assert all(c.text.startswith(c.section) for c in chunks)


def test_chunk_size_bounded():
    chunks = chunk_markdown(DOC, "manual.md", target_chars=100, overlap=10)
    assert all(len(c.text) <= 130 for c in chunks)


def test_overlap_between_adjacent_chunks():
    chunks = [c for c in chunk_markdown(DOC, "manual.md", target_chars=100, overlap=20) if c.section == "灯光"]
    assert len(chunks) >= 2
    assert chunks[0].text[-10:] in chunks[1].text


def test_ids_are_stable_and_unique():
    a = chunk_markdown(DOC, "manual.md")
    b = chunk_markdown(DOC, "manual.md")
    assert [c.id for c in a] == [c.id for c in b]
    assert len({c.id for c in a}) == len(a)
    assert all(c.id.startswith("manual.md#") for c in a)
