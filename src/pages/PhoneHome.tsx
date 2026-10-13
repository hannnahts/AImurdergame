import { useNavigate } from 'react-router-dom';
import AppIcon, { type AppKind } from '../components/AppIcon';

const APPS: { name: string; path: string; kind: AppKind }[] = [
  { name: 'HomeMind', path: 'homemind', kind: 'homemind' },
  { name: 'XX论坛', path: 'forum', kind: 'forum' },
  { name: '备忘录', path: 'notes', kind: 'notes' },
  { name: '设置', path: 'settings', kind: 'settings' },
  { name: '墙面面板', path: '/panel', kind: 'panel' },
];

export default function PhoneHome() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-4 gap-x-4 gap-y-8 pt-6 md:grid-cols-7">
      {APPS.map((app, i) => (
        <button
          key={app.name}
          onClick={() => navigate(app.path)}
          className="panel-rise flex flex-col items-center gap-2 transition-transform duration-300 active:scale-90"
          style={{ animationDelay: `${150 + i * 70}ms`, transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
        >
          <AppIcon kind={app.kind} size={72} />
          <span className="text-[12px] text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]">{app.name}</span>
        </button>
      ))}
    </div>
  );
}
