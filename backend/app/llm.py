"""DeepSeek 客户端(OpenAI 兼容接口)。

关闭思考:官方文档(https://api-docs.deepseek.com/guides/thinking_mode,2026-11 核对)规定请求体里带
`thinking: {"type": "disabled"}`;用 OpenAI SDK 时它不是具名参数,要放进 `extra_body`。
思考默认开启,聊天场景不需要,开着会让输出 token 成倍增加。
"""
from dataclasses import dataclass
from typing import Protocol

import httpx
import openai
from openai import OpenAI


class LLMError(RuntimeError):
    """模型调用失败(网络、超时、服务端或客户端错误)。调用方据此降级。"""


@dataclass(frozen=True)
class Completion:
    text: str
    input_tokens: int
    output_tokens: int


class LLM(Protocol):
    def complete(self, messages: list[dict[str, str]], max_tokens: int = 400) -> Completion: ...


class DeepSeekLLM:
    def __init__(
        self,
        api_key: str,
        model: str,
        base_url: str = "https://api.deepseek.com",
        http_client: httpx.Client | None = None,
        timeout_s: float = 20.0,
    ):
        # max_retries=0:重试由下面的 complete 自己控制(只对 5xx 重试一次),行为才可预测
        self._client = OpenAI(api_key=api_key, base_url=base_url, http_client=http_client, timeout=timeout_s, max_retries=0)
        self._model = model

    def complete(self, messages: list[dict[str, str]], max_tokens: int = 400) -> Completion:
        response = None
        for attempt in range(2):
            try:
                response = self._client.chat.completions.create(
                    model=self._model,
                    messages=messages,
                    max_tokens=max_tokens,
                    extra_body={"thinking": {"type": "disabled"}},
                )
                break
            except openai.APIStatusError as e:  # 4xx/5xx
                if e.status_code >= 500 and attempt == 0:
                    continue
                raise LLMError(f"deepseek returned status {e.status_code}") from e
            except openai.APITimeoutError as e:  # 必须先于 APIConnectionError
                raise LLMError("deepseek request timed out") from e
            except openai.APIConnectionError as e:
                raise LLMError("deepseek connection failed") from e

        if response is None or not response.choices:
            raise LLMError("deepseek returned no choices")
        usage = response.usage
        return Completion(
            text=response.choices[0].message.content or "",
            input_tokens=usage.prompt_tokens if usage else 0,
            output_tokens=usage.completion_tokens if usage else 0,
        )


def estimate_cost_usd(c: Completion, in_price_per_m: float, out_price_per_m: float) -> float:
    return c.input_tokens / 1_000_000 * in_price_per_m + c.output_tokens / 1_000_000 * out_price_per_m
