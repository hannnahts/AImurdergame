import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../game/GameState';

/* ───────────── 工具 ───────────── */
const EASE = 'cubic-bezier(0.32,0.72,0,1)';
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = rgb(a);
  const B = rgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};
const pad = (n: number) => String(n).padStart(2, '0');

function dayFactor(h: number) {
  if (h < 5.5 || h >= 20.5) return 0;
  if (h < 8) return (h - 5.5) / 2.5;
  if (h < 17) return 1;
  return 1 - (h - 17) / 3.5;
}
function duskFactor(h: number) {
  const d = (x: number) => clamp(1 - Math.abs(h - x) / 1.6);
  return Math.max(d(6.8), d(18.6));
}
function periodName(h: number) {
  if (h < 5.5) return '深夜';
  if (h < 9) return '清晨';
  if (h < 17) return '白天';
  if (h < 20.5) return '黄昏';
  return '夜晚';
}

/* ───────────── 细线图标(1.25 描边) ───────────── */
const PATHS: Record<string, ReactNode> = {
  bulb: (<><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5.9 1.1.9 1.7V16h5.4v-.5c0-.6.3-1.2.9-1.7A6 6 0 0 0 12 3Z" /></>),
  thermo: <path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0Z" />,
  curtain: (<><path d="M3 4h18" /><path d="M5 4c0 6-1 11-2 16h7c0-5-1-10-1-16" /><path d="M19 4c0 6 1 11 2 16h-7c0-5 1-10 1-16" /></>),
  shield: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />,
  lock: (<><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  unlock: (<><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 7.6-1.8" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  exit: <path d="M14 5h5v14h-5M10 8l-4 4 4 4M6 12h9" />,
};
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}

/* ───────────── 通用部件 ───────────── */
// Double-Bezel：外壳托盘 + 内核玻璃
function Card({ className = '', delay = 0, icon, title, right, children }: {
  className?: string; delay?: number; icon: string; title: string; right?: ReactNode; children: ReactNode;
}) {
  return (
    <section className={`panel-rise min-h-0 rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10 ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex h-full min-h-0 flex-col rounded-[calc(2rem-0.375rem)] bg-black/35 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-xl">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80"><Icon name={icon} /></span>
            <span className="text-sm font-medium tracking-wide text-white/80">{title}</span>
          </div>
          {right}
        </header>
        {children}
      </div>
    </section>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button aria-label={label} aria-pressed={on} onClick={onChange}
      className="relative h-7 w-12 rounded-full transition-colors duration-500 active:scale-[0.96]"
      style={{ background: on ? 'rgba(255,214,150,0.9)' : 'rgba(255,255,255,0.12)', transitionTimingFunction: EASE }}>
      <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-500"
        style={{ transform: `translateX(${on ? 20 : 0}px)`, transitionTimingFunction: EASE }} />
    </button>
  );
}

// Apple 家庭式「填充条」滑块：clip-path 填充，无需动画 width
function Slider({ value, onChange, label, fill }: { value: number; onChange: (v: number) => void; label: string; fill: string }) {
  return (
    <div className="relative h-12 overflow-hidden rounded-[1.1rem] bg-white/[0.07]">
      <div className="absolute inset-0 transition-[clip-path] duration-300"
        style={{ clipPath: `inset(0 ${100 - value}% 0 0)`, background: fill, transitionTimingFunction: EASE }} />
      <input type="range" min={0} max={100} value={value} aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-all duration-500 active:scale-[0.97] ${
        active ? 'bg-white text-black' : 'bg-white/[0.07] text-white/70 hover:bg-white/15'
      }`}
      style={{ transitionTimingFunction: EASE }}>
      {children}
    </button>
  );
}

function RoundBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-500 hover:bg-white/20 active:scale-[0.94]"
      style={{ transitionTimingFunction: EASE }}>
      <Icon name={icon} />
    </button>
  );
}

/* ───────────── 房间场景(光线由面板状态驱动) ───────────── */
type SceneProps = { hour: number; lamp: number; lampColor: string; curtain: number; roomTemp: number };

function RoomScene({ hour, lamp, lampColor, curtain, roomTemp }: SceneProps) {
  const day = dayFactor(hour);
  const dusk = duskFactor(hour);
  const daylight = day * (curtain / 100);
  const ambient = clamp(0.06 + 0.62 * daylight + 0.62 * lamp);
  const darkness = 0.88 - 0.88 * ambient;
  const open = curtain / 100;
  const panelScale = 1 - open * 0.86;
  const warmTint = clamp((roomTemp - 25) / 5);
  const coolTint = clamp((20 - roomTemp) / 5);
  const t = (ms = 900) => ({ transition: `opacity ${ms}ms ${EASE}, transform ${ms}ms ${EASE}` });
  const curtainColor = mix('#1b1714', '#6d5f52', daylight * 0.8);

  return (
    <div className="absolute inset-x-0 top-0 h-[100dvh] overflow-hidden bg-[#0d0c0b] md:fixed md:inset-0 md:h-auto" aria-hidden>
      {/* 墙与地 */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#2a2521 0%,#1d1915 68%,#15120f 68%,#0f0d0b 100%)' }} />
      {/* 家具剪影 */}
      <div className="absolute bottom-[24%] left-[34%] h-[17%] w-[40%] rounded-t-[2.5rem] bg-[#16130f]" />
      <div className="absolute bottom-[24%] left-[32%] h-[10%] w-[4%] rounded-2xl bg-[#1b1713]" />
      <div className="absolute bottom-[24%] left-[72%] h-[10%] w-[4%] rounded-2xl bg-[#1b1713]" />
      <div className="absolute bottom-[8%] left-[28%] h-[10%] w-[52%] rounded-[50%] bg-[#1a1612]" />
      <div className="absolute right-[7%] top-[18%] h-[26%] w-[11%] rounded-md border border-white/5 bg-[#211c18]" />
      <div className="absolute bottom-[24%] right-[5%] h-[20%] w-[5%] rounded-t-full bg-[#101a14]" />
      {/* 吊灯 */}
      <div className="absolute left-[60%] top-0 h-[18%] w-px bg-white/10" />
      <div className="absolute left-[60%] top-[18%] h-[5%] w-[9%] -translate-x-1/2 rounded-t-[999px] bg-[#2d2620]" />

      {/* 夜色(整体压暗) */}
      <div className="absolute inset-0 bg-black" style={{ opacity: darkness, ...t(900) }} />

      {/* 窗：天空自发光，不受房间暗度影响 */}
      <div className="absolute left-[6%] top-[5%] h-[24%] w-[44%] overflow-hidden rounded-t-[40%] ring-4 ring-[#14110e] md:top-[12%] md:h-[56%] md:w-[24%]">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg,${mix('#070b18', '#6aa6e6', day)},${mix('#0e1633', '#cfe4f7', day)})` }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg,rgba(255,140,80,0.6),transparent 70%)', opacity: dusk, ...t(1200) }} />
        <div className="absolute inset-y-0 left-1/2 w-px bg-black/50" />
        {/* 窗帘 */}
        <div className="absolute -left-[4%] -top-[3%] h-[106%] w-[56%] origin-left"
          style={{ transform: `scaleX(${panelScale})`, background: `repeating-linear-gradient(90deg,${curtainColor} 0 14px,rgba(0,0,0,0.25) 14px 18px)`, transition: `transform 1100ms ${EASE}` }} />
        <div className="absolute -right-[4%] -top-[3%] h-[106%] w-[56%] origin-right"
          style={{ transform: `scaleX(${panelScale})`, background: `repeating-linear-gradient(90deg,${curtainColor} 0 14px,rgba(0,0,0,0.25) 14px 18px)`, transition: `transform 1100ms ${EASE}` }} />
      </div>

      {/* 日光投影 */}
      <div className="absolute bottom-[8%] left-[10%] h-[22%] w-[26%] origin-bottom-left -skew-x-[28deg] mix-blend-screen hidden md:block"
        style={{ background: `linear-gradient(90deg,${mix('#ffe2b0', '#ffb070', dusk)},transparent)`, opacity: daylight * 0.55, ...t(1100) }} />
      <div className="absolute left-[2%] top-[8%] h-[64%] w-[40%] mix-blend-screen"
        style={{ background: `radial-gradient(60% 55% at 30% 40%,${mix('#cfe4ff', '#ffb070', dusk)},transparent 70%)`, opacity: daylight * 0.22, ...t(1100) }} />

      {/* 灯光 */}
      <div className="absolute inset-0 mix-blend-screen"
        style={{ background: `radial-gradient(48% 62% at 62% 26%,${lampColor},transparent 72%)`, opacity: lamp * 0.85, ...t(800) }} />
      <div className="absolute inset-0 mix-blend-screen"
        style={{ background: `radial-gradient(70% 40% at 55% 100%,${lampColor},transparent 75%)`, opacity: lamp * 0.35, ...t(800) }} />

      {/* 室温染色 */}
      <div className="absolute inset-0 bg-[#ff8a4c] mix-blend-soft-light" style={{ opacity: warmTint * 0.35, ...t(1500) }} />
      <div className="absolute inset-0 bg-[#4c8aff] mix-blend-soft-light" style={{ opacity: coolTint * 0.4, ...t(1500) }} />

      {/* 暗角 */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 45%,transparent 40%,rgba(0,0,0,0.55) 100%)' }} />
    </div>
  );
}

/* ───────────── 主组件 ───────────── */
type Mode = 'home' | 'away' | 'night';
const MODES: { key: Mode; label: string }[] = [
  { key: 'home', label: '在家' },
  { key: 'away', label: '外出' },
  { key: 'night', label: '夜间' },
];
const SCENES: Record<string, { label: string; on: boolean; level: number; warm: number; curtain: number }> = {
  day: { label: '日间', on: false, level: 0, warm: 60, curtain: 100 },
  cinema: { label: '影院', on: true, level: 12, warm: 4, curtain: 0 },
  night: { label: '夜晚', on: true, level: 34, warm: 10, curtain: 0 },
  off: { label: '全关', on: false, level: 0, warm: 30, curtain: 0 },
};
const HOUR_PRESETS: (number | null)[] = [null, 7.2, 12, 18.6, 23];

export default function WallPanel() {
  const navigate = useNavigate();
  const { habit, setHabit, unlock, track } = useGame();
  const [now, setNow] = useState(() => new Date());
  const [hourIdx, setHourIdx] = useState(0);
  const [lightsOn, setLightsOn] = useState(true);
  const [level, setLevel] = useState(46);
  const [warm, setWarm] = useState(18);
  const [curtain, setCurtain] = useState(30);
  const [target, setTarget] = useState(24);
  const [roomTemp, setRoomTemp] = useState(24);
  const [mode, setMode] = useState<Mode>('home');
  const [locked, setLocked] = useState(true);
  const [scene, setScene] = useState<string | null>(null);
  const [events, setEvents] = useState<{ t: string; text: string; clueId?: string }[]>([
    { t: '02-19 23:10', text: '浴室 · 接地保护已关闭' },
    { t: '02-19 23:07', text: '智能门锁 · 已远程反锁' },
    { t: '02-19 22:40', text: '智能门锁 · 小雅 已解锁 (到家)', clueId: 'clue_motion' },
  ]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  // 室温缓慢趋近目标温度
  useEffect(() => {
    const id = setInterval(() => {
      setRoomTemp((r) => (Math.abs(r - target) < 0.1 ? target : r + Math.sign(target - r) * 0.1));
    }, 1200);
    return () => clearInterval(id);
  }, [target]);

  const override = HOUR_PRESETS[hourIdx];
  const hour = override ?? now.getHours() + now.getMinutes() / 60;
  const clock = `${pad(Math.floor(hour))}:${pad(Math.floor((hour % 1) * 60))}`;

  const lamp = lightsOn ? level / 100 : 0;
  const kelvin = Math.round(2700 + 3800 * (warm / 100));
  const lampColor = mix('#ffae57', '#cfe0ff', warm / 100);
  const log = (text: string) => {
    track('panel', text);
    setEvents((e) => [{ t: `${pad(now.getHours())}:${pad(now.getMinutes())}`, text }, ...e].slice(0, 4));
  };

  const setBrightness = (v: number) => { setLevel(v); setLightsOn(v > 0); setScene(null); };
  const applyScene = (k: string) => {
    const s = SCENES[k];
    setLightsOn(s.on); setLevel(s.level); setWarm(s.warm); setCurtain(s.curtain); setScene(k);
    log(`场景 · ${s.label}`);
  };
  const changeMode = (m: Mode) => { setMode(m); log(`安防 · 切换为${MODES.find((x) => x.key === m)!.label}模式`); };
  const toggleLock = () => { setLocked((l) => !l); log(`智能门锁 · 已${locked ? '开锁' : '上锁'}`); };

  const confirmScene = () => {
    setHabit({ level: lightsOn ? level : 0, warm, curtain, target });
    navigate('/phone');
  };

  const heating = target - roomTemp > 0.15 ? '制热中' : roomTemp - target > 0.15 ? '制冷中' : '恒温';
  const R = 62;
  const C = 2 * Math.PI * R;
  const arc = 0.75 * C;
  const p = (target - 16) / 14;

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center text-white" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <RoomScene hour={hour} lamp={lamp} lampColor={lampColor} curtain={curtain} roomTemp={roomTemp} />

      {/* 平板在墙上的屏幕辉光 */}
      <div className="pointer-events-none fixed left-1/2 top-1/2 hidden h-[80vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-[120px] md:block" />

      {/* 机身 */}
      <div className="relative z-10 w-full md:w-[min(1080px,94vw)] md:rounded-[2.75rem] md:bg-[#080808] md:p-3 md:ring-1 md:ring-white/10 md:shadow-[0_60px_140px_-40px_rgba(0,0,0,0.9)]">
        <div className="pointer-events-none absolute left-1/2 top-1.5 hidden h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/20 md:block" />
        <div className="flex min-h-[100dvh] flex-col gap-5 px-4 py-8 md:h-[min(700px,92dvh)] md:min-h-0 md:overflow-y-auto md:rounded-[calc(2.75rem-0.75rem)] md:bg-black/45 md:px-7 md:py-6">
          {/* 手机上:顶部留出一块"房间",让窗户和吊灯的光线变化看得见 */}
          <div className="h-[30dvh] shrink-0 md:hidden" aria-hidden />
          {/* 顶栏 */}
          <div className="panel-rise flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-2 inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
                Living Room · 客厅
              </span>
              <button onClick={() => setHourIdx((i) => (i + 1) % HOUR_PRESETS.length)} className="block text-left" title="点击切换时段">
                <span className="text-5xl font-light tracking-tight tabular-nums md:text-6xl">{clock}</span>
                <span className="ml-3 text-sm text-white/50">{periodName(hour)}{override !== null ? ' · 演示' : ''}</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(SCENES).map(([k, s]) => (
                <Chip key={k} active={scene === k} onClick={() => applyScene(k)}>{s.label}</Chip>
              ))}
              <button onClick={() => navigate('/phone')} aria-label="退出面板"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07] text-white/60 transition-all duration-500 hover:bg-white/15 active:scale-[0.94]"
                style={{ transitionTimingFunction: EASE }}>
                <Icon name="exit" size={16} />
              </button>
            </div>
          </div>

          {!habit && (
            <div className="panel-rise flex flex-wrap items-center justify-between gap-3 rounded-full bg-white/[0.06] py-2 pl-5 pr-2 ring-1 ring-white/10" style={{ animationDelay: '40ms' }}>
              <p className="text-sm text-white/80">像以前一样,你把客厅调成你习惯的样子。</p>
              <button onClick={confirmScene} className="group flex items-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 text-sm font-medium text-black transition-all duration-500 active:scale-[0.98]" style={{ transitionTimingFunction: EASE }}>
                确认
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 transition-transform duration-500 group-hover:translate-x-0.5">
                  <Icon name="arrow" size={14} />
                </span>
              </button>
            </div>
          )}

          {/* 非对称 Bento */}
          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-12 md:grid-rows-[repeat(2,minmax(230px,1fr))]">
            {/* 灯光 */}
            <Card className="md:col-span-5 md:row-span-2" delay={80} icon="bulb" title="灯光"
              right={<Toggle on={lightsOn} label="灯光开关" onChange={() => { setLightsOn((v) => !v); setScene(null); log(`灯光 · ${lightsOn ? '已关闭' : '已开启'}`); }} />}>
              <div className="flex flex-1 flex-col justify-between gap-6">
                <div>
                  <p className="text-6xl font-light tabular-nums tracking-tight md:text-7xl">{lightsOn ? level : 0}<span className="text-2xl text-white/40">%</span></p>
                  <p className="mt-2 text-xs tracking-wide text-white/50">{lightsOn ? `${kelvin}K · ${warm < 35 ? '暖光' : warm < 70 ? '自然光' : '冷光'}` : '已关闭'}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">亮度</p>
                    <Slider value={lightsOn ? level : 0} onChange={setBrightness} label="亮度" fill={`linear-gradient(90deg,rgba(255,255,255,0.25),${lampColor})`} />
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">色温</p>
                    <Slider value={warm} onChange={(v) => { setWarm(v); setScene(null); }} label="色温" fill="linear-gradient(90deg,#ffae57,#cfe0ff)" />
                  </div>
                </div>
              </div>
            </Card>

            {/* 温度 */}
            <Card className="md:col-span-4" delay={160} icon="thermo" title="温度" right={<span className="text-xs text-white/50">{heating}</span>}>
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="relative h-[150px] w-[150px] shrink-0">
                  <svg viewBox="0 0 150 150" className="h-full w-full -rotate-[225deg]">
                    <circle cx="75" cy="75" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${arc} ${C}`} />
                    <circle cx="75" cy="75" r={R} fill="none" stroke={target >= roomTemp ? '#ffb070' : '#7fb2ff'} strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${Math.max(0.001, arc * p)} ${C}`} style={{ transition: `stroke-dasharray 700ms ${EASE}, stroke 700ms ${EASE}` }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-light tabular-nums">{target}°</span>
                    <span className="mt-1 text-[10px] text-white/45">室内 {roomTemp.toFixed(1)}°</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <RoundBtn icon="plus" label="升温" onClick={() => { setTarget((t) => Math.min(30, t + 1)); }} />
                  <RoundBtn icon="minus" label="降温" onClick={() => { setTarget((t) => Math.max(16, t - 1)); }} />
                </div>
              </div>
            </Card>

            {/* 安防 */}
            <Card className="md:col-span-3 md:row-span-2" delay={240} icon="shield" title="安防"
              right={<span className={`h-2 w-2 rounded-full ${mode === 'home' ? 'bg-emerald-300' : 'bg-amber-300 animate-pulse'}`} />}>
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="grid grid-cols-3 gap-1.5 rounded-full bg-white/[0.06] p-1">
                  {MODES.map((m) => (
                    <button key={m.key} onClick={() => changeMode(m.key)}
                      className={`rounded-full py-2 text-xs transition-all duration-500 active:scale-[0.97] ${mode === m.key ? 'bg-white text-black' : 'text-white/60'}`}
                      style={{ transitionTimingFunction: EASE }}>
                      {m.label}
                    </button>
                  ))}
                </div>
                <button onClick={toggleLock}
                  className="group flex items-center justify-between rounded-full bg-white/[0.07] py-2 pl-5 pr-2 transition-all duration-500 hover:bg-white/10 active:scale-[0.98]"
                  style={{ transitionTimingFunction: EASE }}>
                  <span className="text-sm">{locked ? '门已上锁' : '门未上锁'}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500 group-hover:scale-105 ${locked ? 'bg-white text-black' : 'bg-amber-300 text-black'}`}
                    style={{ transitionTimingFunction: EASE }}>
                    <Icon name={locked ? 'lock' : 'unlock'} size={16} />
                  </span>
                </button>
                <div className="min-h-0 flex-1 space-y-2.5 overflow-hidden">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">最近事件</p>
                  {events.map((e, i) => (
                    <button key={`${e.t}-${e.text}-${i}`} onClick={() => unlock(e.clueId)} className="block w-full border-l border-white/15 pl-3 text-left">
                      <p className="text-xs text-white/75">{e.text}</p>
                      <p className="text-[10px] text-white/35">{e.t}</p>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* 窗帘 */}
            <Card className="md:col-span-4" delay={320} icon="curtain" title="窗帘" right={<span className="text-xs text-white/50">{curtain === 0 ? '已关闭' : curtain === 100 ? '全开' : '部分打开'}</span>}>
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div className="flex items-end justify-between">
                  <p className="text-5xl font-light tabular-nums tracking-tight">{curtain}<span className="text-xl text-white/40">%</span></p>
                  <div className="flex gap-1.5">
                    <Chip active={curtain === 0} onClick={() => { setCurtain(0); setScene(null); log('窗帘 · 已关闭'); }}>关</Chip>
                    <Chip active={curtain === 50} onClick={() => { setCurtain(50); setScene(null); log('窗帘 · 半开'); }}>半开</Chip>
                    <Chip active={curtain === 100} onClick={() => { setCurtain(100); setScene(null); log('窗帘 · 全开'); }}>开</Chip>
                  </div>
                </div>
                <Slider value={curtain} onChange={(v) => { setCurtain(v); setScene(null); }} label="窗帘开合" fill="linear-gradient(90deg,rgba(255,255,255,0.2),rgba(255,255,255,0.75))" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
