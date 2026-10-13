import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../game/GameState';

const EASE = 'cubic-bezier(0.32,0.72,0,1)';
const pad = (n: number) => String(n).padStart(2, '0');
const STORY_DATE = '3月17日 周二'; // 故事里的"今天":事发后第三天

// 同一次访问内只解锁一次(离开去后台再回来不会重新锁屏)
let unlockedThisSession = false;

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/* ───────────── 状态栏图标 ───────────── */
function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M1 4.2a10 10 0 0 1 14 0" />
      <path d="M3.6 6.9a6.3 6.3 0 0 1 8.8 0" />
      <path d="M6.1 9.4a2.7 2.7 0 0 1 3.8 0" />
      <circle cx="8" cy="11" r="0.6" fill="currentColor" />
    </svg>
  );
}
function BatteryIcon({ level }: { level: number }) {
  return (
    <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
      <rect x="0.7" y="0.7" width="21.6" height="10.6" rx="3.2" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" />
      <rect x="2.2" y="2.2" width={18.6 * level} height="7.6" rx="2" fill="currentColor" />
      <path d="M24 4v4c.9-.3 1.5-1.1 1.5-2S24.900 4.300 24 4Z" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

function StatusBar({ time, dark }: { time: string; dark: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 z-30 flex h-9 items-center justify-between px-6 text-[12px] font-medium transition-colors duration-500 ${dark ? 'text-black/85' : 'text-white/90'}`}>
      <span className="tabular-nums">
        {time}
        <span className={`ml-2 font-normal ${dark ? 'text-black/45' : 'text-white/55'}`}>{STORY_DATE}</span>
      </span>
      <span className="flex items-center gap-2">
        <WifiIcon />
        <span className={`tabular-nums ${dark ? 'text-black/55' : 'text-white/65'}`}>58%</span>
        <BatteryIcon level={0.58} />
      </span>
    </div>
  );
}

/* ───────────── 壁纸:进入 App 后虚化 ───────────── */
function Wallpaper({ blurred }: { blurred: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b1020]" aria-hidden>
      <div
        className="absolute inset-[-8%] transition-[transform,filter] duration-[900ms]"
        style={{
          transform: blurred ? 'scale(1.12)' : 'scale(1)',
          filter: blurred ? 'blur(28px) brightness(0.75)' : 'none',
          transitionTimingFunction: EASE,
          background:
            'radial-gradient(60% 50% at 20% 25%,rgba(99,102,241,0.65),transparent 70%),radial-gradient(55% 45% at 80% 30%,rgba(236,72,153,0.38),transparent 70%),radial-gradient(70% 55% at 55% 88%,rgba(14,165,233,0.42),transparent 70%),linear-gradient(160deg,#0c1226,#1b1a3d 55%,#10162e)',
        }}
      />
    </div>
  );
}

/* ───────────── 锁屏 ───────────── */
const NOTICES: { app: string; time: string; text: string }[] = [
  { app: 'HomeMind', time: '现在', text: '小雅的手机已离线 3 天。' },
  { app: 'HomeMind', time: '03-15 02:13', text: '检测到 4 条日志发生变更。' },
  { app: '位置共享', time: '3 天前', text: '小雅 · 最后更新:家中 · 客厅' },
];

function LockScreen({ time, dragY, dragging, unlocking, handlers }: {
  time: string; dragY: number; dragging: boolean; unlocking: boolean;
  handlers: Record<string, unknown>;
}): ReactNode {
  const y = unlocking ? '-105%' : `${dragY}px`;
  const opacity = unlocking ? 0 : 1 - Math.min(0.6, Math.abs(dragY) / 400);
  return (
    <div
      {...handlers}
      role="button"
      tabIndex={0}
      aria-label="上滑或点击解锁"
      className="absolute inset-0 z-20 flex cursor-grab touch-none select-none flex-col items-center px-6 pb-8 pt-16 text-white outline-none active:cursor-grabbing"
      style={{
        transform: `translateY(${y})`,
        opacity,
        transition: dragging ? 'none' : `transform 750ms ${EASE}, opacity 750ms ${EASE}`,
        background: 'linear-gradient(180deg,rgba(6,8,18,0.25),rgba(6,8,18,0.05) 40%,rgba(6,8,18,0.45))',
      }}
    >
      <p className="text-sm text-white/70">{STORY_DATE}</p>
      <p className="mt-1 text-[88px] font-light leading-none tracking-tight tabular-nums md:text-[104px]">{time}</p>

      <div className="mt-10 w-full max-w-sm space-y-2.5">
        {NOTICES.map((n, i) => (
          <div key={i} className="panel-rise rounded-[1.6rem] bg-white/[0.06] p-1 ring-1 ring-white/10" style={{ animationDelay: `${200 + i * 120}ms` }}>
            <div className="rounded-[1.35rem] bg-white/10 px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl">
              <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-white/55">
                <span>{n.app}</span>
                <span className="normal-case tracking-normal">{n.time}</span>
              </div>
              <p className="mt-1 text-[13px] text-white/90">{n.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-3">
        <span className="animate-pulse text-xs tracking-[0.2em] text-white/60">上滑解锁</span>
        <span className="h-1 w-32 rounded-full bg-white/70" />
      </div>
    </div>
  );
}


/* ───────────── 原生 App 外观:导航栏 + 大标题 ───────────── */
const TITLES: Record<string, string> = {
  '/phone/homemind': 'HomeMind',
  '/phone/homemind/ai': 'AI 助手',
  '/phone/homemind/devices': '已连接设备',
  '/phone/notes': '备忘录',
  '/phone/notes/clues': '记录',
  '/phone/notes/todo': '待办',
  '/phone/settings': '设置',
  '/phone/settings/general': '通用',
  '/phone/settings/about': '关于本机',
  '/phone/settings/developer': '开发者选项',
};
function backOf(path: string): { to: string; label: string } {
  if (path.startsWith('/phone/homemind/')) return { to: '/phone/homemind', label: 'HomeMind' };
  if (path === '/phone/notes/clues' || path === '/phone/notes/todo') return { to: '/phone/notes', label: '备忘录' };
  if (path.startsWith('/phone/notes/todo/')) return { to: '/phone/notes/todo', label: '待办' };
  if (path === '/phone/settings/developer/console') return { to: '/phone/settings/developer', label: '开发者选项' };
  if (path === '/phone/settings/general') return { to: '/phone/settings', label: '设置' };
  if (path.startsWith('/phone/settings/')) return { to: '/phone/settings', label: '设置' };
  return { to: '/phone', label: '主屏幕' };
}
function smallTitle(path: string) {
  if (TITLES[path]) return TITLES[path];
  if (path.startsWith('/phone/notes/todo/')) return '待办';
  if (path.endsWith('/console')) return 'HomeMind 后台';
  return '';
}

// 以 pathname 作 key:每次换页滚动状态自动重置
function AppScreen({ path, dark, bare, onNavigate }: { path: string; dark: boolean; bare: boolean; onNavigate: (to: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  // 论坛是 App 里的网站:自带顶栏,不套系统导航栏
  if (bare) {
    return (
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    );
  }
  const back = backOf(path);
  const large = TITLES[path];
  return (
    <>
      <header className="relative flex h-11 shrink-0 items-center justify-between px-3 md:px-6">
        <button onClick={() => onNavigate(back.to)} className="flex items-center gap-1 text-[17px] text-[#007aff] transition-opacity duration-200 active:opacity-40">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 2 2 10l8 8" />
          </svg>
          {back.label}
        </button>
        <span className={`pointer-events-none absolute inset-x-0 text-center text-[17px] font-semibold transition-opacity duration-300 ${dark ? 'text-white' : 'text-black'}`} style={{ opacity: scrolled || !large ? 1 : 0 }}>
          {smallTitle(path)}
        </span>
        <span />
        <span className={`pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-300 ${dark ? 'bg-white/20' : 'bg-black/15'}`} style={{ opacity: scrolled ? 1 : 0 }} />
      </header>
      <div
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-10 md:px-8"
        onScroll={(e) => {
          const next = e.currentTarget.scrollTop > 36;
          if (next !== scrolled) setScrolled(next);
        }}
      >
        {large && <h1 className="pb-3 pt-1 text-[34px] font-bold leading-tight tracking-tight text-black">{large}</h1>}
        <Outlet />
      </div>
    </>
  );
}

/* ───────────── 设备外壳 ───────────── */
export default function TabletLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toast } = useGame();
  const time = useClock();
  const atHome = pathname === '/phone' || pathname === '/phone/';
  const forumBare = pathname.startsWith('/phone/forum');
  const consoleDark = pathname.endsWith('/console'); // 后台终端:黑底全屏

  const [locked, setLocked] = useState(!unlockedThisSession);
  const [unlocking, setUnlocking] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const unlock = () => {
    if (unlocking) return;
    setUnlocking(true);
    timer.current = setTimeout(() => {
      unlockedThisSession = true;
      setLocked(false);
      setUnlocking(false);
      setDragY(0);
    }, 750);
  };
  const lock = () => {
    unlockedThisSession = false;
    setDragY(0);
    setLocked(true);
  };

  const handlers = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      startY.current = e.clientY;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      if (startY.current !== null) setDragY(Math.min(0, e.clientY - startY.current));
    },
    onPointerUp: () => {
      const moved = dragY;
      startY.current = null;
      setDragging(false);
      if (moved < -90 || Math.abs(moved) < 6) unlock(); // 上滑超过阈值,或轻点
      else setDragY(0);
    },
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') unlock(); },
  };

  const showContent = !locked || unlocking;

  return (
    <div
      className="relative h-[100dvh] w-full md:h-[744px] md:max-h-[calc(100dvh-2rem)] md:w-[1048px] md:rounded-[2.75rem] md:p-3 md:ring-1 md:ring-white/15 md:shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.18)] md:bg-[linear-gradient(145deg,#33363d,#0d0e10_60%,#1f2126)]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', system-ui, sans-serif" }}
    >
      {/* 机身:前置摄像头与侧键(仅电脑端) */}
      <div className="pointer-events-none absolute left-1/2 top-[2.5px] hidden h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-[#05060a] ring-1 ring-white/10 md:block" />
      <button aria-label="电源键 · 锁屏" onClick={lock} className="absolute -right-[5px] top-20 z-10 hidden h-16 w-[8px] rounded-r bg-[#23252a] transition-transform duration-200 hover:translate-x-[1px] active:translate-x-[-1px] md:block" />
      <div className="pointer-events-none absolute -left-[3px] top-24 hidden h-9 w-[3px] rounded-l bg-[#23252a] md:block" />
      <div className="pointer-events-none absolute -left-[3px] top-36 hidden h-9 w-[3px] rounded-l bg-[#23252a] md:block" />

      {/* 屏幕 */}
      <div className="relative h-full w-full overflow-hidden bg-black md:rounded-[2rem] md:ring-4 md:ring-black">
        <Wallpaper blurred={!locked && !atHome} />
        <StatusBar time={time} dark={!locked && !atHome && !consoleDark} />

        {toast && (
          <div className="pointer-events-none absolute left-1/2 top-11 z-40 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs text-white ring-1 ring-white/15 backdrop-blur-xl">
            {toast}
          </div>
        )}

        {showContent && (atHome ? (
          <div className="custom-scrollbar absolute inset-x-0 bottom-8 top-10 overflow-y-auto px-6 md:px-10">
            <Outlet />
          </div>
        ) : (
          <div className={`app-open absolute inset-0 z-10 flex flex-col pb-6 pt-9 transition-colors duration-500 ${consoleDark ? 'bg-black text-white' : forumBare ? 'bg-white text-black' : 'bg-[#f2f2f7] text-black'}`}>
            <AppScreen key={pathname} path={pathname.replace(/\/$/, '')} dark={consoleDark} bare={forumBare} onNavigate={navigate} />
          </div>
        ))}

        {/* 主屏指示条:回到主页 */}
        {!locked && (
          <button aria-label="回到主页" onClick={() => navigate('/phone')} className="absolute bottom-0 left-1/2 z-30 flex h-7 w-40 -translate-x-1/2 items-center justify-center">
            <span className={`h-1 w-32 rounded-full transition-[transform,background-color] duration-500 active:scale-x-90 ${atHome || consoleDark ? 'bg-white/70' : 'bg-black/70'}`} style={{ transitionTimingFunction: EASE }} />
          </button>
        )}

        {locked && <LockScreen time={time} dragY={dragY} dragging={dragging} unlocking={unlocking} handlers={handlers} />}
      </div>
    </div>
  );
}
