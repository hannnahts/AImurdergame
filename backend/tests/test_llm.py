import json

import httpx
import pytest

from app.llm import Completion, DeepSeekLLM, LLMError, estimate_cost_usd

MESSAGES = [{"role": "system", "content": "你是小A"}, {"role": "user", "content": "你好"}]


def _ok_body(text="你好", prompt_tokens=12, completion_tokens=5):
    return {
        "id": "x", "object": "chat.completion", "created": 0, "model": "deepseek-flash",
        "choices": [{"index": 0, "message": {"role": "assistant", "content": text}, "finish_reason": "stop"}],
        "usage": {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens, "total_tokens": prompt_tokens + completion_tokens},
    }


def _llm(handler) -> DeepSeekLLM:
    client = httpx.Client(transport=httpx.MockTransport(handler))
    return DeepSeekLLM(api_key="k-test", model="deepseek-flash", http_client=client)


def test_request_body_has_model_messages_max_tokens_and_thinking_off():
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["url"] = str(request.url)
        seen["auth"] = request.headers["authorization"]
        seen["body"] = json.loads(request.content)
        return httpx.Response(200, json=_ok_body())

    _llm(handler).complete(MESSAGES)
    assert seen["url"] == "https://api.deepseek.com/chat/completions"
    assert seen["auth"] == "Bearer k-test"
    assert seen["body"]["model"] == "deepseek-flash"
    assert seen["body"]["messages"] == MESSAGES
    assert seen["body"]["max_tokens"] == 400
    assert seen["body"]["thinking"] == {"type": "disabled"}


def test_parses_text_and_usage():
    out = _llm(lambda r: httpx.Response(200, json=_ok_body("你好呀", 12, 5))).complete(MESSAGES)
    assert out == Completion("你好呀", 12, 5)


def test_5xx_retried_once_then_llm_error():
    calls = []

    def handler(request):
        calls.append(1)
        return httpx.Response(500, json={"error": {"message": "boom"}})

    with pytest.raises(LLMError):
        _llm(handler).complete(MESSAGES)
    assert len(calls) == 2


def test_5xx_then_success_returns_completion():
    calls = []

    def handler(request):
        calls.append(1)
        return httpx.Response(503, json={"error": {"message": "busy"}}) if len(calls) == 1 else httpx.Response(200, json=_ok_body("好"))

    assert _llm(handler).complete(MESSAGES).text == "好"
    assert len(calls) == 2


def test_4xx_raises_llm_error_without_retry():
    calls = []

    def handler(request):
        calls.append(1)
        return httpx.Response(401, json={"error": {"message": "bad key"}})

    with pytest.raises(LLMError):
        _llm(handler).complete(MESSAGES)
    assert len(calls) == 1


def test_timeout_raises_llm_error():
    def handler(request):
        raise httpx.ReadTimeout("slow", request=request)

    with pytest.raises(LLMError):
        _llm(handler).complete(MESSAGES)


def test_empty_choices_raises_llm_error():
    body = _ok_body()
    body["choices"] = []
    with pytest.raises(LLMError):
        _llm(lambda r: httpx.Response(200, json=body)).complete(MESSAGES)


def test_estimate_cost_usd():
    c = Completion(text="", input_tokens=1_000_000, output_tokens=1_000_000)
    assert estimate_cost_usd(c, in_price_per_m=0.30, out_price_per_m=1.20) == pytest.approx(1.5)
