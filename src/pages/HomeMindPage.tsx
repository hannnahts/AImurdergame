import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeviceShell from "../components/DeviceShell";
import { clsx } from "./forum/components/ui-helpers";

// 线索推导密码：纪念日 20291105 + 宠物首字母 BD + 幸运数字 9 + 特殊符号 $
const SECRET_PWD = "20291105BD9$";

export default function HomeMindPage() {
  const nav = useNavigate();
  const unlockedInitial =
    typeof window !== "undefined" && localStorage.getItem("hm_unlocked") === "1";
  const [step, setStep] = useState<1 | 2 | 3>(unlockedInitial ? 3 : 1);
  const [password, setPassword] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(unlockedInitial);
  const [unlockAnim, setUnlockAnim] = useState(false);

  const [assistantInput, setAssistantInput] = useState("");
  const [assistantReply, setAssistantReply] = useState(
    "Hi，我是小A，需要什么帮助？（试试：忘记密码 / 浴室）"
  );
  const [assistantCollapsed, setAssistantCollapsed] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("客厅");
  const [roomStatus] = useState<Record<string, "安全" | "异常">>({
    客厅: "安全",
    卧室: "安全",
    浴室: "异常",
  });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "早上好！阳光明媚";
    if (hour < 18) return "下午好！";
    return "晚上好！";
  }, []);

  const handleSubmit = () => {
    if (unlocked) return;
    if (!password) {
      setError("请输入管理员密码");
      return;
    }
    if (password === SECRET_PWD) {
      setUnlocked(true);
      setError("");
      setUnlockAnim(true);
      setStep(2);
      localStorage.setItem("hm_unlocked", "1");
      // 轻触震动（若设备支持）
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(80);
      }
      setTimeout(() => setUnlockAnim(false), 1200);
      return;
    }
    const next = attemptsLeft - 1;
    setAttemptsLeft(next);
    setError(next > 0 ? `密码错误，您还有 ${next} 次尝试机会` : "已锁定，请稍后再试");
  };

  const handleAssistant = () => {
    const text = assistantInput.trim();
    if (!text) {
      setAssistantReply("小A听不懂主人的话，可以再说一遍吗？");
      return;
    }
    const lowered = text.toLowerCase();
    if (lowered.includes("忘记密码")) {
      setAssistantReply(
        "如果主人忘记了密码，可以通过手机发送验证信息修改密码哦~ 若手机不在身边，可以看看与 app 绑定的论坛内容，或许能勾起回忆 ><"
      );
      return;
    }
    if (["浴室", "卫生间", "浴缸"].some((k) => text.includes(k))) {
      setAssistantReply(
        "目前浴室系统连接异常，可以检查接地情况、致电客服，或在论坛发技术帖子求助哦~"
      );
      return;
    }
    setAssistantReply("小A听不懂主人的话，可以再说一遍吗？");
  };

  return (
    <DeviceShell title="HomeMind" variant="tablet" onHomePress={() => nav(-1)}>
      <style>
        {`
          @keyframes hm-fade {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes hm-shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-4px); }
            40%, 80% { transform: translateX(4px); }
          }
        `}
      </style>
      <div className="relative h-full bg-gradient-to-b from-slate-100 via-white to-slate-100 overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
          {step === 1 && (
            <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl p-6 space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">智能日志</div>
                    <div className="text-lg font-semibold text-slate-900">管理员密码验证</div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">加密通道</span>
                </div>

                <div className="space-y-3">
                  <input
                    type="password"
                    maxLength={24}
                    value={password}
                    disabled={unlocked || attemptsLeft <= 0}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="请输入管理员密码（12 位，字母数字符号混合）"
                    className={clsx(
                      "w-full rounded-2xl border px-4 py-3 text-slate-900 placeholder:text-slate-400 bg-white shadow-inner",
                      error ? "border-rose-300 animate-[hm-shake_0.25s]" : "border-slate-200"
                    )}
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="underline-offset-2 hover:underline cursor-pointer">忘记密码？</span>
                    {!unlocked ? (
                      <span>剩余尝试：{attemptsLeft}</span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <span className={clsx("text-lg", unlockAnim && "animate-pulse")}>🔓</span>
                        已解锁
                      </span>
                    )}
                  </div>

                  {error ? (
                    <div className="text-sm text-rose-600">{error}</div>
                  ) : (
                    <div className="text-xs text-slate-500">提示：密码错误会触发震动提醒。</div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmit}
                      disabled={unlocked || attemptsLeft <= 0}
                      className={clsx(
                        "flex-1 rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold shadow-md",
                        "transition active:translate-y-[1px]",
                        (unlocked || attemptsLeft <= 0) && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      {unlocked ? "已解锁" : "验证密码"}
                    </button>
                    {!unlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPassword("");
                          setError("");
                        }}
                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 bg-white hover:bg-slate-50"
                      >
                        清空
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 shadow-xl p-6 space-y-3 relative overflow-hidden">
                <div className="absolute right-6 top-6 text-2xl drop-shadow-sm">🔓</div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Welcome Back
                </div>
                <div className="text-2xl font-semibold text-emerald-900">
                  欢迎回来，小雅。
                </div>
                <div className="text-sm text-emerald-800">
                  今天是 2030 年 2 月 21 日，您已 2 天未登录系统。
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm shadow-sm active:translate-y-[1px]"
                >
                  进入 HomeMind
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white p-6 shadow-2xl">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-200">全屋智能中枢系统 v3.2.1</div>
                <div className="mt-2 text-2xl font-semibold">让家更懂你</div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">小雅的家</div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">{greeting}</div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">您有 5 个设备正在运行</div>
                </div>
              </div>

              <div
                className="grid gap-4 transition-all"
                style={{ gridTemplateColumns: assistantCollapsed ? "72px 1fr" : "1.1fr 0.9fr" }}
              >
                {/* AI 智能管家（可折叠） */}
                <div
                  className={clsx(
                    "relative rounded-3xl border border-slate-200 bg-white/90 shadow-xl transition-all cursor-pointer",
                    assistantCollapsed ? "p-2 flex items-center justify-center" : "p-6 space-y-4"
                  )}
                  onClick={() => assistantCollapsed && setAssistantCollapsed(false)}
                >
                  {assistantCollapsed ? (
                    <div className="-rotate-90 text-xs font-semibold text-slate-600 select-none whitespace-nowrap">
                      AI 智能管家
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssistantCollapsed(true);
                        }}
                        className="absolute right-2 top-2 rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-[10px] text-slate-500 shadow-sm hover:bg-slate-100 active:translate-y-[1px]"
                        aria-label="折叠智能管家"
                      >
                        收起
                      </button>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            AI 智能管家
                          </div>
                          <div className="text-lg font-semibold text-slate-900">小A 为您服务</div>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-600 border border-emerald-100">
                          在线
                        </span>
                      </div>

                      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 min-h-[110px]">
                        {assistantReply}
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={assistantInput}
                          onChange={(e) => setAssistantInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAssistant()}
                          placeholder="对小A说点什么…（如：忘记密码 / 浴室）"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-inner"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>关键词：忘记密码 / 浴室 / 卫生间 / 浴缸</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssistant();
                            }}
                            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-xs shadow-sm active:translate-y-[1px]"
                          >
                            发送
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 房屋状态 + 平面图互动 */}
                <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        房屋状态总览
                      </div>
                      <div className="text-sm text-slate-600">点击房间查看状态</div>
                    </div>
                    <div className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 bg-white/70">
                      {selectedRoom} · {roomStatus[selectedRoom]}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 relative overflow-hidden p-4 min-h-[220px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(15,23,42,0.04),transparent_45%),radial-gradient(circle_at_80%_50%,rgba(15,23,42,0.05),transparent_40%)]" />
                    <div className="relative grid grid-cols-3 grid-rows-2 gap-3">
                      {["客厅", "卧室", "浴室"].map((room) => {
                        const danger = roomStatus[room] === "异常";
                        return (
                          <button
                            key={room}
                            onClick={() => setSelectedRoom(room)}
                            className={clsx(
                              "rounded-xl border px-4 py-3 text-left shadow-sm transition",
                              danger
                                ? "border-rose-200 bg-rose-50/70 text-rose-700"
                                : "border-emerald-100 bg-white text-emerald-700",
                              selectedRoom === room && "ring-2 ring-slate-300"
                            )}
                          >
                            <div className="text-sm font-semibold">{room}</div>
                            <div className={clsx("text-xs mt-1", danger ? "text-rose-600" : "text-emerald-600")}>
                              {roomStatus[room]}
                            </div>
                          </button>
                        );
                      })}
                      {/* 占位让布局更均匀 */}
                      <div className="col-span-3 rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-3 text-xs text-slate-500">
                        平面图（快速版）：点击房间卡片切换状态。需要真实 3D 模型时，可接入 three.js。
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    {Object.entries(roomStatus).map(([name, status]) => (
                      <div
                        key={name}
                        className={clsx(
                          "rounded-2xl border px-4 py-3 shadow-sm bg-white flex flex-col gap-1 cursor-pointer transition",
                          status === "异常" ? "border-rose-100" : "border-emerald-100",
                          selectedRoom === name && "ring-2 ring-slate-300"
                        )}
                        onClick={() => setSelectedRoom(name)}
                      >
                        <div className="text-slate-700 font-semibold">{name}</div>
                        <div
                          className={clsx(
                            "text-xs font-semibold",
                            status === "异常" ? "text-rose-600" : "text-emerald-600"
                          )}
                        >
                          {status}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                    {selectedRoom === "浴室"
                      ? "浴室异常：检测到连接不稳定。建议检查接地/致电客服/在论坛技术板块求助。"
                      : `${selectedRoom}状态正常，未检测到异常。`}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DeviceShell>
  );
}
