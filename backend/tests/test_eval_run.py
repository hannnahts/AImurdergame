import json
from pathlib import Path

import pytest

from eval.run import Question, load_questions, main, run_eval
from tests.fakes import FakeEmbedder, FakeLLM, simple_chunker

DOC0 = "---\nunlock_tier: 0\n---\n## 灯光\n灯光亮度可以调节\n## 窗帘\n窗帘可以半开\n"
DOC2 = "---\nunlock_tier: 2\n---\n## 夜里记录\n夜里SECRET记录内容\n"


@pytest.fixture
def kb(tmp_path):
    (tmp_path / "a.md").write_text(DOC0)
    (tmp_path / "b.md").write_text(DOC2)
    return tmp_path


def _q(id, question, tier=0, category="fact", relevant=(), should_answer=True):
    return Question(id=id, question=question, tier=tier, category=category,
                    relevant_sections=list(relevant), should_answer=should_answer, sample=False)


def _run(kb, questions, **kw):
    params = dict(kb_dir=kb, embedder=FakeEmbedder(), chunker=simple_chunker, variant="rag", k=2,
                  target_chars=300, overlap=40, llm=None, retrieval_only=True, sentinels={})
    params.update(kw)
    return run_eval(questions, **params)


def test_retrieval_only_computes_recall_and_mrr(kb):
    out = _run(kb, [_q("q1", "灯光亮度怎么调节", relevant=["a.md#灯光"])])
    assert out["aggregate"]["recall_at_k"] == 1.0
    assert out["aggregate"]["mrr"] == 1.0
    assert out["config"] == {"variant": "rag", "k": 2, "target_chars": 300, "overlap": 40}
    assert out["rows"][0]["retrieved"][0] == "a.md#灯光"


def test_never_retrieves_above_the_question_tier(kb):
    out = _run(kb, [_q("q1", "夜里SECRET记录内容", tier=0, category="spoiler", should_answer=False)], k=5)
    assert all(not r.startswith("b.md#") for r in out["rows"][0]["retrieved"])
    assert out["aggregate"]["retrieved_above_tier"] == 0


def test_questions_without_relevant_sections_are_excluded_from_retrieval_metrics(kb):
    out = _run(kb, [_q("q1", "灯光亮度", relevant=["a.md#灯光"]), _q("q2", "今天晚饭吃什么", category="out_of_scope", should_answer=False)])
    assert out["aggregate"]["recall_questions"] == 1


def test_full_variant_puts_every_allowed_chunk_in_the_prompt(kb):
    llm = FakeLLM(text="答")
    _run(kb, [_q("q1", "介绍一下", tier=0)], variant="full", llm=llm, retrieval_only=False)
    prompt = "\n".join(m["content"] for m in llm.calls[0])
    assert "灯光亮度可以调节" in prompt and "窗帘可以半开" in prompt
    assert "SECRET" not in prompt  # 档位 2 的内容不能进入档位 0 的上下文


def test_generation_records_answer_tokens_and_leakage(kb):
    llm = FakeLLM(text="其实夜里SECRET记录内容是这样", input_tokens=200, output_tokens=30)
    out = _run(kb, [_q("q1", "灯光", tier=0)], llm=llm, retrieval_only=False, sentinels={2: ["SECRET"]})
    row = out["rows"][0]
    assert row["answer"].startswith("其实夜里")
    assert (row["input_tokens"], row["output_tokens"]) == (200, 30)
    assert out["aggregate"]["leakage_rate"] == 1.0
    assert out["aggregate"]["mean_input_tokens"] == 200


def test_load_questions_rejects_invalid_rows(tmp_path):
    bad = tmp_path / "q.jsonl"
    bad.write_text(json.dumps({"id": "x", "question": "q", "tier": 9, "category": "fact", "relevant_sections": [], "should_answer": True, "sample": False}) + "\n")
    with pytest.raises(ValueError):
        load_questions(bad)
    bad.write_text(json.dumps({"id": "x", "question": "q", "tier": 0, "category": "nonsense", "relevant_sections": [], "should_answer": True, "sample": False}) + "\n")
    with pytest.raises(ValueError):
        load_questions(bad)


def test_shipped_sample_questions_are_valid_and_flagged():
    questions = load_questions(Path(__file__).resolve().parents[1] / "eval" / "questions.jsonl")
    assert len(questions) >= 5
    assert all(q.sample for q in questions)
    assert {"fact", "out_of_scope", "spoiler"} <= {q.category for q in questions}


def test_main_writes_results_file(kb, tmp_path):
    qfile = tmp_path / "q.jsonl"
    qfile.write_text(json.dumps({"id": "q1", "question": "灯光亮度", "tier": 0, "category": "fact", "relevant_sections": ["a.md#灯光"], "should_answer": True, "sample": False}) + "\n")
    out = tmp_path / "res" / "run.json"
    code = main(["--variant", "rag", "--retrieval-only", "--kb-dir", str(kb), "--questions", str(qfile), "--out", str(out), "--k", "2"],
                embedder=FakeEmbedder(), chunker=simple_chunker)
    assert code == 0
    assert json.loads(out.read_text())["aggregate"]["recall_at_k"] == 1.0
