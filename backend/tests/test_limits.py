from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

import pytest

from app.limits import LimitDecision, UsageLimiter

UTC = timezone.utc


class Clock:
    def __init__(self, now: datetime):
        self.now = now

    def __call__(self) -> datetime:
        return self.now


@pytest.fixture
def db(tmp_path):
    return str(tmp_path / "limits.sqlite3")


def _limiter(db, clock=None, per_id=40, per_ip=1000, budget=3.0):
    kwargs = {"clock": clock} if clock else {}
    return UsageLimiter(db, per_id_daily=per_id, per_ip_daily=per_ip, daily_budget_usd=budget, **kwargs)


def test_per_id_limit_blocks_41st_message(db):
    lim = _limiter(db)
    results = [lim.check_and_reserve("anon-1", "1.1.1.1") for _ in range(41)]
    assert results[:40] == [LimitDecision.ALLOWED] * 40
    assert results[40] == LimitDecision.RATE_LIMITED


def test_other_ids_are_independent(db):
    lim = _limiter(db, per_id=2)
    assert [lim.check_and_reserve("a", "ip") for _ in range(3)][-1] == LimitDecision.RATE_LIMITED
    assert lim.check_and_reserve("b", "ip") == LimitDecision.ALLOWED


def test_per_ip_limit_blocks_after_cap_across_ids(db):
    lim = _limiter(db, per_id=100, per_ip=5)
    results = [lim.check_and_reserve(f"anon-{i}", "9.9.9.9") for i in range(6)]
    assert results[:5] == [LimitDecision.ALLOWED] * 5
    assert results[5] == LimitDecision.RATE_LIMITED


def test_rollover_at_utc_midnight_resets_counts(db):
    clock = Clock(datetime(2026, 11, 5, 23, 59, 59, tzinfo=UTC))
    lim = _limiter(db, clock, per_id=1)
    assert lim.check_and_reserve("a", "ip") == LimitDecision.ALLOWED
    assert lim.check_and_reserve("a", "ip") == LimitDecision.RATE_LIMITED
    clock.now = datetime(2026, 11, 6, 0, 0, 1, tzinfo=UTC)
    assert lim.check_and_reserve("a", "ip") == LimitDecision.ALLOWED


def test_budget_exhausted_blocks_next_request(db):
    lim = _limiter(db, budget=3.0)
    lim.record_cost(3.0)
    assert lim.check_and_reserve("a", "ip") == LimitDecision.BUDGET_EXHAUSTED


def test_budget_boundary_allows_current_blocks_next(db):
    lim = _limiter(db, budget=3.0)
    lim.record_cost(2.99)
    assert lim.check_and_reserve("a", "ip") == LimitDecision.ALLOWED  # 仍在预算内,当前请求放行
    lim.record_cost(0.02)  # 这次调用把总额推到 3.01
    assert lim.check_and_reserve("a", "ip") == LimitDecision.BUDGET_EXHAUSTED


def test_budget_resets_on_new_utc_day(db):
    clock = Clock(datetime(2026, 11, 5, 12, tzinfo=UTC))
    lim = _limiter(db, clock, budget=1.0)
    lim.record_cost(5.0)
    assert lim.check_and_reserve("a", "ip") == LimitDecision.BUDGET_EXHAUSTED
    clock.now = datetime(2026, 11, 6, 0, 0, 1, tzinfo=UTC)
    assert lim.check_and_reserve("a", "ip") == LimitDecision.ALLOWED


def test_budget_block_does_not_consume_message_quota(db):
    lim = _limiter(db, per_id=1, budget=1.0)
    lim.record_cost(2.0)
    assert lim.check_and_reserve("a", "ip") == LimitDecision.BUDGET_EXHAUSTED
    # 熔断期间的请求不应占用每人额度:把预算调大后(同一数据库),这个 id 的 1 条额度仍然可用
    raised = _limiter(db, per_id=1, budget=10.0)
    assert raised.check_and_reserve("a", "ip") == LimitDecision.ALLOWED


def test_concurrent_reservations_do_not_exceed_cap(db):
    lim = _limiter(db, per_id=40, per_ip=1000)
    with ThreadPoolExecutor(max_workers=16) as pool:
        results = list(pool.map(lambda _: lim.check_and_reserve("same", "ip"), range(100)))
    assert results.count(LimitDecision.ALLOWED) == 40
    assert results.count(LimitDecision.RATE_LIMITED) == 60


def test_state_survives_new_instance(db):
    first = _limiter(db, per_id=3)
    for _ in range(3):
        assert first.check_and_reserve("a", "ip") == LimitDecision.ALLOWED
    first.record_cost(1.5)
    second = _limiter(db, per_id=3, budget=1.0)
    assert second.check_and_reserve("a", "ip") == LimitDecision.BUDGET_EXHAUSTED
    third = _limiter(db, per_id=3, budget=10.0)
    assert third.check_and_reserve("a", "ip") == LimitDecision.RATE_LIMITED
