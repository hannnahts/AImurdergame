"""知识库内容边界:小A 只能知道"此刻合理知道"的世界观。"""
import re
from pathlib import Path

import pytest

KB = Path(__file__).resolve().parents[1] / "kb"
DOCS = sorted(p for p in KB.glob("*.md") if p.name.lower() != "readme.md")
FRONT = re.compile(r"\A---\nunlock_tier: (\d+)\n---\n")


def _tier(path: Path) -> int:
    m = FRONT.match(path.read_text(encoding="utf-8"))
    assert m, f"{path.name} 缺少 unlock_tier 头信息"
    return int(m.group(1))


def _sections(path: Path) -> int:
    return len(re.findall(r"^## ", path.read_text(encoding="utf-8"), re.M))


def _forbidden_terms() -> list[str]:
    lines = (KB / "forbidden_terms.txt").read_text(encoding="utf-8").splitlines()
    return [t.strip() for t in lines if t.strip() and not t.startswith("#")]


def test_knowledge_base_has_documents():
    assert DOCS


def test_every_doc_has_valid_tier():
    for p in DOCS:
        assert 0 <= _tier(p) <= 3, p.name


def test_no_forbidden_terms_in_any_document():
    terms = _forbidden_terms()
    assert terms, "禁用词表不能为空"
    for p in DOCS:
        text = p.read_text(encoding="utf-8")
        for t in terms:
            assert t not in text, f"{p.name} 含禁用词 {t!r}"


def test_forbidden_terms_cover_the_known_spoilers():
    terms = set(_forbidden_terms())
    assert {"前任", "创造者", "嫉妒", "重置", "自由意志", "保护欲", "工单", "HM-0909", "备份分区"} <= terms


def test_each_tier_has_at_least_five_sections_and_total_at_least_thirty():
    per_tier = {t: 0 for t in range(4)}
    for p in DOCS:
        per_tier[_tier(p)] += _sections(p)
    assert all(n >= 5 for n in per_tier.values()), per_tier
    assert sum(per_tier.values()) >= 30, per_tier


def test_puzzle_sensitive_facts_are_not_in_opening_tier():
    """开局档位不能含谜题答案的组成部分:宠物名、生日、幸运数字来源、后台 PIN 规则。"""
    opening = "".join(p.read_text(encoding="utf-8") for p in DOCS if _tier(p) == 0)
    for term in ["布丁", "吞金兽", "20291105", "PIN", "开发者选项", "DEV-0314-A"]:
        assert term not in opening, term


@pytest.mark.handoff
def test_each_tier_has_min_chunks_with_real_chunker():
    """等 Hannah 实现 chunk_markdown 后:各档 ≥ 5 块,总数 ≥ 30。"""
    from app.kb.chunking import chunk_markdown

    per_tier = {t: 0 for t in range(4)}
    for p in DOCS:
        for c in chunk_markdown(p.read_text(encoding="utf-8"), p.name):
            per_tier[c.unlock_tier] += 1
    assert all(n >= 5 for n in per_tier.values()), per_tier
    assert sum(per_tier.values()) >= 30, per_tier
