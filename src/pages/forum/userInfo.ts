// 论坛用户资料(按用户名稳定生成,同一个人每次看到的一样)
const COLORS = ['#f97316', '#0ea5e9', '#8b5cf6', '#10b981', '#ec4899', '#64748b', '#eab308'];
const pad = (n: number) => String(n).padStart(2, '0');

const SPECIAL: Record<string, { char?: string; role?: string; level?: string; color?: string; posts?: number; points?: number; joined?: string }> = {
  小雅_Cloud: { char: '雅', level: 'VIP3', role: '', color: '#f59e0b', posts: 42, points: 1280, joined: '2023-06-18' },
  老王_运维: { role: '版主', level: '运维', color: '#2563eb', posts: 1203, points: 9420, joined: '2019-03-02' },
  官方客服: { char: '官', role: '官方', level: '客服', color: '#dc2626', posts: 380, points: 0, joined: '2018-01-01' },
};

export function userInfo(name: string) {
  const sp = SPECIAL[name];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 100000;
  return {
    char: sp?.char ?? name.slice(0, 1),
    color: sp?.color ?? COLORS[h % COLORS.length],
    role: sp?.role ?? '',
    level: sp?.level ?? `Lv.${1 + (h % 6)}`,
    posts: sp?.posts ?? 12 + ((h * 7) % 480),
    points: sp?.points ?? 100 + ((h * 13) % 4000),
    joined: sp?.joined ?? `20${19 + (h % 6)}-${pad(1 + (h % 12))}-${pad(1 + (h % 28))}`,
  };
}
