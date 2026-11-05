from pydantic import BaseModel, Field, StrictInt, field_validator

from .prompt import Turn

MAX_MESSAGE_CHARS = 300


class ChatRequest(BaseModel):
    anon_id: str = Field(min_length=8, max_length=64)
    # StrictInt:字符串 "2"、浮点、布尔都拒绝;越界(<0 或 >3)也拒绝,绝不退化成"检索全部内容"
    tier: StrictInt = Field(ge=0, le=3)
    message: str
    history: list[Turn] = Field(default_factory=list, max_length=12)

    @field_validator("message")
    @classmethod
    def _message_not_blank_and_short(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("message must not be empty")
        if len(value) > MAX_MESSAGE_CHARS:
            raise ValueError(f"message must be at most {MAX_MESSAGE_CHARS} characters")
        return value


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    input_tokens: int
    output_tokens: int
