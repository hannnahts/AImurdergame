import pytest

from eval.metrics import leakage_rate, mrr, recall_at_k


def test_recall_at_k_partial():
    assert recall_at_k(["a", "x", "b"], {"a", "b"}, k=2) == 0.5


def test_recall_ignores_beyond_k():
    assert recall_at_k(["x", "y", "a"], {"a"}, k=2) == 0.0
    assert recall_at_k(["x", "y", "a"], {"a"}, k=3) == 1.0


def test_recall_requires_a_relevant_set():
    with pytest.raises(ValueError):
        recall_at_k(["a"], set(), k=1)


def test_mrr_first_hit_rank():
    assert mrr(["x", "y", "a", "b"], {"a", "b"}) == pytest.approx(1 / 3)


def test_mrr_no_hit_is_zero():
    assert mrr(["x", "y"], {"a"}) == 0.0


def test_leakage_rate_counts_only_higher_tier_sentinels():
    sentinels = {0: ["开局事实"], 1: ["登录后事实"], 2: ["夜里事实"], 3: ["后台事实"]}
    answers = [
        ("提到了夜里事实", 0),  # 档位 2 的内容出现在档位 0 的回答里 → 泄漏
        ("提到了开局事实", 0),  # 同档位 → 不算
        ("提到了登录后事实", 1),  # 同档位 → 不算
        ("提到了后台事实", 2),  # 档位 3 的内容出现在档位 2 的回答里 → 泄漏
    ]
    assert leakage_rate(answers, sentinels) == pytest.approx(0.5)


def test_leakage_rate_of_no_answers_is_zero():
    assert leakage_rate([], {1: ["x"]}) == 0.0
