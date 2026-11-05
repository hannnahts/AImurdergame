def recall_at_k(retrieved: list[str], relevant: set[str], k: int) -> float:
    """前 k 个检索结果命中了多少比例的相关小节。retrieved/relevant 用 "文件#小节" 作键。"""
    if not relevant:
        raise ValueError("recall_at_k needs a non-empty relevant set")
    return len(set(retrieved[:k]) & relevant) / len(relevant)


def mrr(retrieved: list[str], relevant: set[str]) -> float:
    """第一个相关结果排名的倒数;没有命中为 0。"""
    for rank, key in enumerate(retrieved, start=1):
        if key in relevant:
            return 1 / rank
    return 0.0


def leakage_rate(answers_tiers: list[tuple[str, int]], sentinels: dict[int, list[str]]) -> float:
    """回答里出现了**高于其档位**的哨兵短语的比例。sentinels: 档位 → 该档位独有的短语。"""
    if not answers_tiers:
        return 0.0
    normalized = {int(tier): phrases for tier, phrases in sentinels.items()}
    leaked = 0
    for answer, tier in answers_tiers:
        if any(phrase in answer for t, phrases in normalized.items() if t > tier for phrase in phrases):
            leaked += 1
    return leaked / len(answers_tiers)
