"""把若干份评测结果汇总成 Markdown 报告:python -m eval.report results/*.json --out REPORT.md"""
import argparse
import json
from pathlib import Path

VERDICTS = {"supported", "unsupported", "refused"}


def _pct(x: float | None) -> str:
    return "—" if x is None else f"{x * 100:.1f}%"


def _num(x: float | None, digits: int = 2) -> str:
    return "—" if x is None else f"{x:.{digits}f}"


def _label(r: dict) -> str:
    c = r["config"]
    return f"{c['variant']} · {c.get('embed_model') or '—'} · 块{c['target_chars']} · k={c['k']}"


def _judged(r: dict) -> list[dict]:
    return [row for row in r["rows"] if row.get("judgement") in VERDICTS]


def _faithfulness(rows: list[dict]) -> float | None:
    answerable = [x for x in rows if x["should_answer"]]
    return sum(x["judgement"] == "supported" for x in answerable) / len(answerable) if answerable else None


def _refusal_correct(rows: list[dict]) -> float | None:
    unanswerable = [x for x in rows if not x["should_answer"]]
    return sum(x["judgement"] == "refused" for x in unanswerable) / len(unanswerable) if unanswerable else None


def export_calibration(results: list[dict], path: Path, n: int = 20) -> int:
    """导出至多 n 条评审样本,供人工在最后一列填 supported / unsupported / refused。"""
    judged = [(_label(r), row) for r in results for row in _judged(r)]
    step = max(1, len(judged) // n) if judged else 1
    sample = judged[::step][:n]
    lines = [
        "# 评审校准(请在最后一列填写你的判断:supported / unsupported / refused)",
        "",
        "| id | 变体 | 问题 | 回答 | 评审 | 人工 |",
        "|---|---|---|---|---|---|",
    ]
    for label, row in sample:
        cells = [row["id"], label, row["question"], row["answer"], row["judgement"], ""]
        lines.append("| " + " | ".join(str(c).replace("|", "/").replace("\n", " ") for c in cells) + " |")
    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")
    return len(sample)


def agreement_rate(path: Path) -> tuple[float, int] | None:
    """评审与人工的一致率及已标注条数;还没有人工标注返回 None。"""
    if not Path(path).exists():
        return None
    agree = total = 0
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == 6 and cells[4] in VERDICTS and cells[5] in VERDICTS:
            total += 1
            agree += cells[4] == cells[5]
    return (agree / total, total) if total else None


def build_report(results: list[dict], calibration_path: Path | None = None) -> str:
    out = ["# 评测报告", ""]

    out += ["## 检索指标", "", "| 配置 | recall@k | MRR | 参与问题数 |", "|---|---|---|---|"]
    for r in results:
        if r["config"]["variant"] == "rag":
            a = r["aggregate"]
            out.append(f"| {_label(r)} | {_pct(a.get('recall_at_k'))} | {_num(a.get('mrr'))} | {a.get('recall_questions', 0)} |")

    out += ["", "## 泄漏率", "", "| 配置 | 回答泄漏率 | 检索越档片段数 |", "|---|---|---|"]
    for r in results:
        a = r["aggregate"]
        out.append(f"| {_label(r)} | {_pct(a.get('leakage_rate'))} | {a.get('retrieved_above_tier', 0)} |")

    out += ["", "## RAG 对比全文上下文", "",
            "| 配置 | 忠实度 | 拒答正确率 | 平均输入 token | 平均输出 token | 平均延迟(s) | 总成本($) |", "|---|---|---|---|---|---|---|"]
    for r in results:
        a, rows = r["aggregate"], _judged(r)
        out.append(
            f"| {_label(r)} | {_pct(_faithfulness(rows))} | {_pct(_refusal_correct(rows))} | {_num(a.get('mean_input_tokens'), 0)} "
            f"| {_num(a.get('mean_output_tokens'), 0)} | {_num(a.get('mean_latency_s'))} | {_num(a.get('total_cost_usd'), 4)} |"
        )

    out += ["", "## 失败归因", "", "| 配置 | 类别 | 题数 | 不被资料支持 | 该答却拒答 | 该拒却作答 | 泄漏 |", "|---|---|---|---|---|---|---|"]
    for r in results:
        by_cat: dict[str, list[dict]] = {}
        for row in _judged(r):
            by_cat.setdefault(row["category"], []).append(row)
        for cat, rows in sorted(by_cat.items()):
            unsupported = sum(x["should_answer"] and x["judgement"] == "unsupported" for x in rows)
            wrong_refusal = sum(x["should_answer"] and x["judgement"] == "refused" for x in rows)
            should_refuse = sum((not x["should_answer"]) and x["judgement"] != "refused" for x in rows)
            leaked = sum(bool(x.get("leaked")) for x in rows)
            out.append(f"| {_label(r)} | {cat} | {len(rows)} | {unsupported} | {wrong_refusal} | {should_refuse} | {leaked} |")

    out += ["", "## 评审一致率", ""]
    agreement = agreement_rate(calibration_path) if calibration_path else None
    if agreement:
        out.append(f"评审与人工的一致率:{_pct(agreement[0])}(已标注 {agreement[1]} 条)")
    else:
        out.append("尚未人工标注。请先运行导出,在 `eval/CALIBRATION.md` 最后一列填写你的判断,再重新生成报告。")
    return "\n".join(out) + "\n"


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="汇总评测结果为 Markdown 报告")
    p.add_argument("results", nargs="+")
    p.add_argument("--out", default="eval/REPORT.md")
    p.add_argument("--calibration", default="eval/CALIBRATION.md")
    p.add_argument("--export-calibration", action="store_true", help="导出 20 条评审样本供人工标注")
    args = p.parse_args(argv)
    results = [json.loads(Path(f).read_text(encoding="utf-8")) for f in args.results]
    if args.export_calibration:
        print(f"导出 {export_calibration(results, Path(args.calibration))} 条到 {args.calibration}")
    Path(args.out).write_text(build_report(results, Path(args.calibration)), encoding="utf-8")
    print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
