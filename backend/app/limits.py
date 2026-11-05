import sqlite3
from collections.abc import Callable
from datetime import datetime, timezone
from enum import Enum


class LimitDecision(Enum):
    ALLOWED = "allowed"
    RATE_LIMITED = "rate_limited"
    BUDGET_EXHAUSTED = "budget_exhausted"


def default_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UsageLimiter:
    """每个匿名 id / 每个 IP 的每日条数上限,加全局每日预算熔断。

    状态存在 SQLite 文件里(跨进程重启保留)。检查与计数在**同一个写事务**中完成,
    所以并发请求不会超出上限。日期按 UTC 自然日。
    """

    def __init__(
        self,
        db_path: str,
        per_id_daily: int,
        per_ip_daily: int,
        daily_budget_usd: float,
        clock: Callable[[], datetime] = default_utc_now,
    ):
        self._db_path = db_path
        self._per_id = per_id_daily
        self._per_ip = per_ip_daily
        self._budget = daily_budget_usd
        self._clock = clock
        with self._connect() as conn:
            conn.execute(
                "CREATE TABLE IF NOT EXISTS counts ("
                "day TEXT NOT NULL, kind TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL, "
                "PRIMARY KEY (day, kind, key))"
            )
            conn.execute("CREATE TABLE IF NOT EXISTS spend (day TEXT PRIMARY KEY, usd REAL NOT NULL)")

    def _connect(self) -> sqlite3.Connection:
        # isolation_level=None:手动控制事务;timeout 让并发写入排队而不是报错
        conn = sqlite3.connect(self._db_path, timeout=30, isolation_level=None)
        conn.execute("PRAGMA journal_mode=WAL")
        return conn

    def _today(self) -> str:
        now = self._clock()
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)
        return now.astimezone(timezone.utc).date().isoformat()

    def check_and_reserve(self, anon_id: str, ip: str) -> LimitDecision:
        day = self._today()
        conn = self._connect()
        try:
            conn.execute("BEGIN IMMEDIATE")
            spent_row = conn.execute("SELECT usd FROM spend WHERE day = ?", (day,)).fetchone()
            if spent_row is not None and spent_row[0] >= self._budget:
                conn.execute("ROLLBACK")
                return LimitDecision.BUDGET_EXHAUSTED  # 熔断期间的请求不占用每人额度

            def current(kind: str, key: str) -> int:
                row = conn.execute("SELECT n FROM counts WHERE day=? AND kind=? AND key=?", (day, kind, key)).fetchone()
                return row[0] if row else 0

            if current("id", anon_id) >= self._per_id or current("ip", ip) >= self._per_ip:
                conn.execute("ROLLBACK")
                return LimitDecision.RATE_LIMITED
            for kind, key in (("id", anon_id), ("ip", ip)):
                conn.execute(
                    "INSERT INTO counts(day, kind, key, n) VALUES (?, ?, ?, 1) "
                    "ON CONFLICT(day, kind, key) DO UPDATE SET n = n + 1",
                    (day, kind, key),
                )
            conn.execute("COMMIT")
            return LimitDecision.ALLOWED
        except Exception:
            conn.execute("ROLLBACK") if conn.in_transaction else None
            raise
        finally:
            conn.close()

    def record_cost(self, usd: float) -> None:
        day = self._today()
        conn = self._connect()
        try:
            conn.execute(
                "INSERT INTO spend(day, usd) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET usd = usd + excluded.usd",
                (day, usd),
            )
        finally:
            conn.close()
