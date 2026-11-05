"""手动冒烟:用真实的 DeepSeek key 调一次,确认能通且思考已关闭。
用法:cd backend && DEEPSEEK_API_KEY=sk-... .venv/bin/python scripts/smoke_llm.py
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import Settings  # noqa: E402
from app.llm import DeepSeekLLM, estimate_cost_usd  # noqa: E402


def main() -> int:
    key = os.environ.get("DEEPSEEK_API_KEY", "")
    if not key:
        print("请先设置环境变量 DEEPSEEK_API_KEY")
        return 2
    settings = Settings()
    llm = DeepSeekLLM(api_key=key, model=settings.deepseek_model)
    c = llm.complete(
        [
            {"role": "system", "content": "你是小A,回答简短。"},
            {"role": "user", "content": "用一句话说说 HomeMind 能做什么?"},
        ],
        max_tokens=200,
    )
    cost = estimate_cost_usd(c, settings.price_in_per_m, settings.price_out_per_m)
    print(f"回复:{c.text}")
    print(f"输入 token={c.input_tokens} 输出 token={c.output_tokens} 估算成本=${cost:.6f}")
    if c.output_tokens > 120:
        print("警告:一句话的回答输出 token 偏多,思考可能没有关闭,请检查请求参数")
        return 1
    print("通过:回复正常,输出 token 在预期范围内")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
