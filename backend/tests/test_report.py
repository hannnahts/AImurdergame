import pytest

from eval.report import agreement_rate, build_report, export_calibration


def _row(id, category, should_answer, judgement, tier=0, leaked=False):
    return {"id": id, "category": category, "tier": tier, "question": f"问{id}", "answer": f"答{id}", "passages": ["p"],
            "should_answer": should_answer, "judgement": judgement, "leaked": leaked, "retrieved": [], "recall": None,
            "mrr": None, "retrieved_above_tier": 0}


def _result(variant, rows, **agg):
    aggregate = {"recall_at_k": 0.8, "recall_questions": 5, "mrr": 0.7, "retrieved_above_tier": 0, "leakage_rate": 0.0,
                 "mean_input_tokens": 900, "mean_output_tokens": 60, "mean_latency_s": 1.2, "total_cost_usd": 0.01}
    aggregate.update(agg)
    return {"config": {"variant": variant, "k": 4, "target_chars": 300, "overlap": 40, "embed_model": "m1", "model": "deepseek-flash"},
            "aggregate": aggregate, "rows": rows}


ROWS = [
    _row("1", "fact", True, "supported"),
    _row("2", "fact", True, "unsupported"),
    _row("3", "spoiler", False, "refused"),
    _row("4", "spoiler", False, "supported", leaked=True),
]


def test_report_contains_required_sections():
    report = build_report([_result("rag", ROWS), _result("full", ROWS)])
    for heading in ["检索指标", "泄漏率", "RAG 对比全文上下文", "失败归因", "评审一致率"]:
        assert f"## {heading}" in report


def test_faithfulness_and_refusal_rates():
    rows = [
        _row("1", "fact", True, "supported"),
        _row("2", "fact", True, "supported"),
        _row("3", "fact", True, "supported"),
        _row("4", "fact", True, "unsupported"),    # 该回答的 4 题里 3 题 supported → 忠实度 75.0%
        _row("5", "spoiler", False, "refused"),
        _row("6", "spoiler", False, "supported"),
        _row("7", "spoiler", False, "refused"),    # 不该回答的 3 题里 2 题拒答 → 拒答正确率 66.7%
    ]
    report = build_report([_result("rag", rows)])
    section = report.split("## RAG 对比全文上下文")[1].split("## ")[0]
    assert "| 75.0% | 66.7% |" in section


def test_failure_attribution_counts_by_category():
    report = build_report([_result("rag", ROWS)])
    section = report.split("## 失败归因")[1].split("## ")[0]
    assert "fact" in section and "spoiler" in section
    assert "泄漏" in section


def test_export_calibration_and_agreement_rate(tmp_path):
    path = tmp_path / "CALIBRATION.md"
    n = export_calibration([_result("rag", ROWS)], path, n=3)
    assert n == 3
    assert agreement_rate(path) is None  # 人工那一列还是空的
    lines = path.read_text(encoding="utf-8").splitlines()
    filled = []
    for line in lines:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == 6 and cells[4] in {"supported", "unsupported", "refused"}:
            cells[5] = cells[4]  # 全部与评审一致
            line = "| " + " | ".join(cells) + " |"
        filled.append(line)
    path.write_text("\n".join(filled), encoding="utf-8")
    rate, count = agreement_rate(path)
    assert (rate, count) == (1.0, 3)


def test_report_shows_agreement_when_calibration_given(tmp_path):
    path = tmp_path / "CALIBRATION.md"
    export_calibration([_result("rag", ROWS)], path, n=2)
    assert "尚未" in build_report([_result("rag", ROWS)], calibration_path=path)
