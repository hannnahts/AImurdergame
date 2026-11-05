from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-flash"
    chroma_host: str = "chroma"
    chroma_port: int = 8000
    # 默认嵌入模型:最终由评测(Task 13)决定,可通过环境变量替换
    embed_model: str = "BAAI/bge-small-zh-v1.5"
    allowed_origins: str = "https://hannnahts.github.io,http://localhost:5173"
    per_id_daily: int = 40
    per_ip_daily: int = 120
    daily_budget_usd: float = 3.0
    # 价格取忙时价、偏保守(美元/百万 token);币种以 DeepSeek 官方价格页为准
    price_in_per_m: float = 0.30
    price_out_per_m: float = 1.20
    top_k: int = 4
    chunk_target_chars: int = 300
    chunk_overlap: int = 40
    limits_db_path: str = "/data/limits.sqlite3"

    @property
    def origin_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]
