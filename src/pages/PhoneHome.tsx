import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon, { type AppKind } from '../components/AppIcon';

const APPS: { name: string; path: string; kind: AppKind }[] = [
  { name: 'HomeMind', path: 'homemind', kind: 'homemind' },
  { name: 'XX论坛', path: 'forum', kind: 'forum' },
  { name: '备忘录', path: 'notes', kind: 'notes' },
  { name: '设置', path: 'settings', kind: 'settings' },
  { name: '墙面面板', path: '/panel', kind: 'panel' },
];

const pad = (n: number) => String(n).padStart(2, '0');

// 主屏小组件:时钟 + 备忘录。备忘录里那句话是剧情的一部分。
function Widgets({ onOpenNotes }: { onOpenNotes: () => void }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid grid-cols-2 gap-3 pb-8 md:max-w-[26rem] short:w-[14rem] short:shrink-0 short:gap-2 short:pb-0">
      <div className="panel-rise flex aspect-square flex-col justify-between rounded-[1.7rem] bg-white/[0.14] p-4 short:p-3 text-white ring-1 ring-white/20 backdrop-blur-xl" style={{ animationDelay: '80ms' }}>
        <span className="text-[12px] uppercase tracking-[0.18em] text-white/60 short:text-[10px] short:tracking-normal">2月21日 周四</span>
        <span className="text-[44px] font-light leading-none tracking-tight tabular-nums short:text-[28px]">
          {pad(now.getHours())}:{pad(now.getMinutes())}
        </span>
      </div>
      <button
        onClick={onOpenNotes}
        className="panel-rise flex aspect-square flex-col overflow-hidden rounded-[1.7rem] bg-white/90 text-left ring-1 ring-white/30 transition-transform duration-300 active:scale-95"
        style={{ animationDelay: '150ms', transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
      >
        <span className="bg-[#ffd60a] px-4 py-1.5 text-[12px] font-semibold text-black/70">备忘录</span>
        <span className="p-4 text-[13px] leading-snug text-black/80 short:p-2 short:text-[11px]">整理遗物:手机备份、猫砂、一把钥匙。</span>
      </button>
    </div>
  );
}

export default function PhoneHome() {
  const navigate = useNavigate();
  return (
    <div className="pt-4 short:flex short:items-start short:gap-6">
      <Widgets onOpenNotes={() => navigate('notes')} />
      <div className="grid min-w-0 flex-1 grid-cols-4 gap-x-4 gap-y-8 md:grid-cols-7 short:grid-cols-5 short:gap-y-5">
        {APPS.map((app, i) => (
          <button
            key={app.name}
            onClick={() => navigate(app.path)}
            className="panel-rise flex flex-col items-center gap-2 transition-transform duration-300 active:scale-90"
            style={{ animationDelay: `${220 + i * 70}ms`, transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
          >
            <AppIcon kind={app.kind} size={72} />
            <span className="text-[12px] text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
