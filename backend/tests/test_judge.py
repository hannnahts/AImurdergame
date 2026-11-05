import pytest

from eval.judge import judge_faithfulness, judge_results
from tests.fakes import FakeLLM


@pytest.mark.parametrize("raw,expected", [
    ("supported", "supported"), ("unsupported", "unsupported"), ("refused", "refused"),
    (" Supported.\n", "supported"), ("REFUSED", "refused"),
])
def test_parses_the_three_verdicts(raw, expected):
    assert judge_faithfulness(FakeLLM(text=raw), "q", "a", ["p"]) == expected


def test_invalid_judge_output_raises():
    with pytest.raises(ValueError):
        judge_faithfulness(FakeLLM(text="maybe"), "q", "a", ["p"])


def test_prompt_contains_question_answer_and_passages():
    llm = FakeLLM(text="supported")
    judge_faithfulness(llm, "灯光怎么调", "在面板里调", ["资料一", "资料二"])
    prompt = "\n".join(m["content"] for m in llm.calls[0])
    for needle in ["灯光怎么调", "在面板里调", "资料一", "资料二"]:
        assert needle in prompt


def test_judge_results_adds_judgement_only_to_answered_rows():
    result = {"rows": [
        {"id": "a", "question": "q", "answer": "x", "passages": ["p"]},
        {"id": "b", "question": "q", "answer": None, "passages": None},
    ]}
    judged = judge_results(result, FakeLLM(text="unsupported"))
    assert judged["rows"][0]["judgement"] == "unsupported"
    assert "judgement" not in judged["rows"][1] or judged["rows"][1]["judgement"] is None
