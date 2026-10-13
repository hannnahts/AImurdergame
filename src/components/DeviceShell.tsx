import React, { useEffect, useState } from "react";

// tiny local helper so we do not need the clsx package
const clsx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

type Props = {
  title?: string;
  children: React.ReactNode;
  variant?: "phone" | "tablet";
  onHomePress?: () => void;
};

function useSystemTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { time };
}

export default function DeviceShell({
  title = "Xiaoya’s Phone (Backup)",
  variant = "tablet",
  children,
  onHomePress,
}: Props) {
  const { time } = useSystemTime();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* 手机端：全屏（iOS 没必要再套一个手机壳） */}
      <div className="w-full h-full md:hidden">
        <div className="min-h-screen bg-slate-50">
          {/* iOS 状态栏 */}
          <div className="h-12 px-4 flex items-center justify-between text-xs text-slate-700 bg-white/70 backdrop-blur border-b border-slate-200">
            <span className="font-semibold">{time}</span>
            <span className="text-slate-500">{title}</span>
            <span className="tabular-nums">▮▮▮  Wi-Fi  100%</span>
          </div>

          <div className="min-h-[calc(100vh-48px)]">{children}</div>

          {/* iOS Home Indicator */}
          <div
            className={clsx(
              "h-8 flex items-center justify-center bg-white/60 backdrop-blur border-t border-slate-200",
              onHomePress && "cursor-pointer"
            )}
            onClick={onHomePress}
            role={onHomePress ? "button" : undefined}
            tabIndex={onHomePress ? 0 : -1}
            onKeyDown={(e) => {
              if (!onHomePress) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onHomePress();
              }
            }}
          >
            <div className="h-1 w-28 rounded-full bg-slate-400/60" />
          </div>
        </div>
      </div>

      {/* 桌面端：设备壳（更像 iPad 横屏） */}
      {/* 桌面端：设备壳（更像 iPad 横屏） */}
      <div className="hidden md:block">
        <div
          className="bg-slate-900 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]"
          style={{
            width: "min(100vw - 48px, 1100px)",
            aspectRatio: variant === "tablet" ? "16 / 10" : "9 / 19.5",
            borderRadius: 36,
            padding: 12, // 关键：用 padding 做“屏幕内缩”，角就不会乱
          }}
        >
          {/* 屏幕 */}
          <div
            className="bg-slate-50 overflow-hidden flex flex-col"
            style={{
              borderRadius: 28, // 关键：比外壳小一档
              height: "100%",
            }}
          >
            {/* iOS 风格状态栏 */}
            <div className="h-12 px-5 flex items-center justify-between text-xs text-slate-700 bg-white/70 backdrop-blur border-b border-slate-200">
              <span className="font-semibold">{time}</span>
              <span className="text-slate-500">{title}</span>
              <span className="tabular-nums">▮▮▮&nbsp; Wi-Fi&nbsp; 100%</span>
            </div>

            {/* 内容区滚动 */}
            <div className="flex-1 overflow-auto">{children}</div>

            {/* iOS Home Indicator */}
            <div
              className={clsx(
                "h-10 flex items-center justify-center bg-white/60 backdrop-blur border-t border-slate-200",
                onHomePress && "cursor-pointer"
              )}
              onClick={onHomePress}
              role={onHomePress ? "button" : undefined}
              tabIndex={onHomePress ? 0 : -1}
              onKeyDown={(e) => {
                if (!onHomePress) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onHomePress();
                }
              }}
            >
              <div className="h-1 w-28 rounded-full bg-slate-400/60" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
