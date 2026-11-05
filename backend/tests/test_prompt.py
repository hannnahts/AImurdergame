from app.kb.store import Hit
from app.prompt import MAX_HISTORY_TURNS, MAX_TURN_CHARS, Turn, build_messages


def _hit(i: int, text: str = "片段") -> Hit:
    return Hit(id=f"a.md#{i}", text=text, source="a.md", section="节", unlock_tier=0, distance=0.1)


def test_system_message_lists_passages_with_ids():
    msgs = build_messages("灯光怎么调?", [], [_hit(0, "灯光可以调亮度"), _hit(1, "窗帘可以半开")])
    assert msgs[0]["role"] == "system"
    assert "[a.md#0] 灯光可以调亮度" in msgs[0]["content"]
    assert "[a.md#1] 窗帘可以半开" in msgs[0]["content"]


def test_history_trimmed_to_last_six():
    history = [Turn("user" if i % 2 == 0 else "assistant", f"第{i}轮") for i in range(10)]
    middle = build_messages("问题", history, [])[1:-1]
    assert len(middle) == MAX_HISTORY_TURNS
    assert [m["content"] for m in middle] == [f"第{i}轮" for i in range(4, 10)]


def test_each_history_turn_truncated_to_500_chars():
    msgs = build_messages("问题", [Turn("user", "长" * 900)], [])
    assert len(msgs[1]["content"]) == MAX_TURN_CHARS == 500


def test_no_hits_instructs_to_say_unknown():
    system = build_messages("凶手是谁?", [], [])[0]["content"]
    assert "我不知道" in system
    assert "没有找到相关资料" in system
    assert "[" not in system.rsplit("【资料】", 1)[1]


def test_question_is_last_user_message():
    msgs = build_messages("灯光怎么调?", [Turn("user", "你好"), Turn("assistant", "你好")], [])
    assert msgs[-1] == {"role": "user", "content": "灯光怎么调?"}


def test_builder_only_uses_given_hits():
    system = build_messages("q", [], [_hit(0, "只有这一条")])[0]["content"]
    body = system.rsplit("【资料】", 1)[1]
    assert "只有这一条" in body
    assert body.count("[a.md#") == 1
