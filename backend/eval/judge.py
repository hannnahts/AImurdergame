"""忠实度评审:让另一个模型判断回答是否被资料支持。

python -m eval.judge IN.json --out OUT.json [--model deepseek-v4-pro]
"""
import argparse
import json
from pathlib import Path
from typing import Literal

from app.llm import LLM

Verdict = Literal["supported", "unsupported", "refused"]
VERDICTS = ("supported", "unsupported", "refused")

JUDGE_SYSTEM = (
    "你是严格的评审员。判断【回答】是否被【资料】支持,只输出一个英文单词:\n"
    "supported:回答里的事实都能在资料里找到;\n"
    "unsupported:回答包含资料里没有的事实,或与资料矛盾;\n"
    "refused:回答明确表示不知道或无法回答。"
)


def judge_faithfulness(llm: LLM, question: str, answer: str, passages: list[str]) -> Verdict:
    joined = "\n".join(f"- {p}" for p in passages) if passages else "(无资料)"
    messages = [
        {"role": "system", "content": JUDGE_SYSTEM},
        {"role": "user", "content": f"【问题】{question}\n【资料】\n{joined}\n【回答】{answer}"},
    ]
    raw = llm.complete(messages, max_tokens=10).text.strip().strip(".。!!").lower()
    if raw not in VERDICTS:
        raise ValueError(f"judge returned an unexpected verdict: {raw!r}")
    return raw  # type: ignore[return-value]


def judge_results(result: dict, llm: LLM) -> dict:
    """给一份评测结果里每个有回答的行加上 `judgement`。"""
    for row in result["rows"]:
        if row.get("answer") is None:
            continue
        row["judgement"] = judge_faithfulness(llm, row["question"], row["answer"], row.get("passages") or [])
    return result


def main(argv: list[str] | None = None, *, llm: LLM | None = None) -> int:
    from app.config import Settings

    settings = Settings()
    p = argparse.ArgumentParser(description="用评审模型给评测结果打忠实度标签")
    p.add_argument("input")
    p.add_argument("--out", required=True)
    p.add_argument("--model", default="deepseek-v4-pro")
    args = p.parse_args(argv)
    if llm is None:
        if not settings.deepseek_api_key:
            print("需要 DEEPSEEK_API_KEY")
            return 2
        from app.llm import DeepSeekLLM

        llm = DeepSeekLLM(api_key=settings.deepseek_api_key, model=args.model)
    result = judge_results(json.loads(Path(args.input).read_text(encoding="utf-8")), llm)
    result["config"]["judge_model"] = args.model
    Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
