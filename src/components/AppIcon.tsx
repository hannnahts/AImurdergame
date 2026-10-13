import { useId, type ReactNode } from 'react';

export type AppKind = 'homemind' | 'forum' | 'notes' | 'settings' | 'panel';

// 12 齿齿轮的轮廓
function gearPath(cx: number, cy: number, rIn: number, rOut: number, teeth: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const w1 = step * 0.3;
    const w2 = step * 0.17;
    for (const [da, r] of [[-w1, rIn], [-w2, rOut], [w2, rOut], [w1, rIn]] as const) {
      pts.push(`${(cx + Math.cos(a + da) * r).toFixed(2)},${(cy + Math.sin(a + da) * r).toFixed(2)}`);
    }
  }
  return `M${pts.join('L')}Z`;
}
const GEAR = gearPath(32, 32, 15.5, 20.5, 12);

const BG: Record<AppKind, string> = {
  homemind: 'linear-gradient(160deg,#5ac8fa 0%,#1b7bff 55%,#0a4fe0 100%)',
  forum: 'linear-gradient(160deg,#ffc247 0%,#ff8a00 50%,#f05a00 100%)',
  notes: 'linear-gradient(180deg,#ffffff 0%,#f1f1f4 100%)',
  settings: 'linear-gradient(160deg,#a9a9b0 0%,#76767d 55%,#55555b 100%)',
  panel: 'linear-gradient(160deg,#363c4e 0%,#171b27 55%,#0a0c13 100%)',
};

function Glyph({ kind, id }: { kind: AppKind; id: string }) {
  switch (kind) {
    case 'homemind':
      return (
        <>
          <defs>
            <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#dbe9ff" />
            </linearGradient>
          </defs>
          <path d="M32 13.5 13.5 28.5V47a4.5 4.5 0 0 0 4.5 4.5h28A4.5 4.5 0 0 0 50.500 47V28.500L32 13.500Z" fill={`url(#${id}h)`} stroke={`url(#${id}h)`} strokeWidth="4" strokeLinejoin="round" />
          <g fill="none" stroke="#1a6cff" strokeLinecap="round" strokeWidth="2.6">
            <path d="M23.500 37.500a12 12 0 0 1 17 0" />
            <path d="M27 42a7 7 0 0 1 10 0" />
          </g>
          <circle cx="32" cy="46.200" r="2.200" fill="#1a6cff" />
        </>
      );
    case 'forum':
      return (
        <>
          <path d="M30 13h19a8 8 0 0 1 8 8v10a8 8 0 0 1-8 8h-2v7l-8-7H30a8 8 0 0 1-8-8V21a8 8 0 0 1 8-8Z" fill="#ffffff" fillOpacity="0.55" />
          <path d="M17 24h22a8.500 8.500 0 0 1 8.500 8.500v6A8.500 8.500 0 0 1 39 47H29l-9 8v-8h-3a8.500 8.500 0 0 1-8.500-8.500v-6A8.500 8.500 0 0 1 17 24Z" fill="#ffffff" />
          <g fill="#f26a00">
            <circle cx="20" cy="35.500" r="2.600" />
            <circle cx="28" cy="35.500" r="2.600" />
            <circle cx="36" cy="35.500" r="2.600" />
          </g>
        </>
      );
    case 'notes':
      return (
        <>
          <rect x="0" y="0" width="64" height="19" fill="#ffd60a" />
          <rect x="0" y="18" width="64" height="1.500" fill="#e6b800" fillOpacity="0.55" />
          <g stroke="#d4d4d9" strokeWidth="1.600" strokeLinecap="round">
            <path d="M9 31.500h46" />
            <path d="M9 41.500h46" />
            <path d="M9 51.500h46" />
          </g>
          <g stroke="#3a3a3c" strokeWidth="2.200" strokeLinecap="round">
            <path d="M12 27.500h20" />
            <path d="M12 37.500h30" />
            <path d="M12 47.500h14" />
          </g>
          <circle cx="12" cy="9.500" r="2" fill="#a67c00" fillOpacity="0.55" />
        </>
      );
    case 'settings':
      return (
        <>
          <defs>
            <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fafafc" />
              <stop offset="1" stopColor="#b9b9c0" />
            </linearGradient>
            <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6d6d74" />
              <stop offset="1" stopColor="#4a4a50" />
            </linearGradient>
          </defs>
          <path d={GEAR} fill={`url(#${id}g)`} stroke={`url(#${id}g)`} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="32" cy="32" r="9.500" fill={`url(#${id}c)`} />
          <circle cx="32" cy="32" r="5.200" fill="#c9c9cf" />
          <circle cx="32" cy="32" r="2.400" fill="#5c5c62" />
        </>
      );
    case 'panel':
      return (
        <>
          <defs>
            <radialGradient id={`${id}p`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffb340" stopOpacity="0.35" />
              <stop offset="1" stopColor="#ffb340" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="26" fill={`url(#${id}p)`} />
          <rect x="11" y="14" width="42" height="36" rx="7" fill="#07080d" stroke="#d9dbe3" strokeWidth="2" />
          <rect x="16" y="19" width="14" height="11" rx="3.200" fill="#ffb340" />
          <rect x="34" y="19" width="14" height="11" rx="3.200" fill="#5ac8fa" />
          <rect x="16" y="33" width="14" height="11" rx="3.200" fill="#ffffff" fillOpacity="0.2" />
          <rect x="34" y="33" width="14" height="11" rx="3.200" fill="#ffffff" fillOpacity="0.2" />
          <circle cx="23" cy="38.500" r="2.200" fill="#ffffff" fillOpacity="0.85" />
          <rect x="38.500" y="37.800" width="5" height="1.600" rx="0.800" fill="#ffffff" fillOpacity="0.85" />
        </>
      );
  }
}

export default function AppIcon({ kind, size = 72 }: { kind: AppKind; size?: number }): ReactNode {
  const id = useId().replace(/:/g, '');
  const radius = size * 0.2237; // iOS 圆角比例
  return (
    <span
      className="relative block shrink-0 overflow-hidden shadow-[0_12px_24px_-12px_rgba(0,0,0,0.7),0_2px_5px_-2px_rgba(0,0,0,0.35)]"
      style={{ width: size, height: size, borderRadius: radius, background: BG[kind] }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
        <Glyph kind={kind} id={id} />
      </svg>
      {/* 顶部高光 + 内描边 */}
      <span className="pointer-events-none absolute inset-0" style={{ borderRadius: radius, background: 'linear-gradient(180deg,rgba(255,255,255,0.3) 0%,rgba(255,255,255,0) 48%)' }} />
      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" style={{ borderRadius: radius, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }} />
    </span>
  );
}
