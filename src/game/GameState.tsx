import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CLUES } from './clues';
import { PUZZLES } from './puzzles';

export type Ending = 'confess' | 'hide' | null;
// 玩家在墙面面板里布置的"习惯",之后会成为篡改者的指纹(第二章、第五章使用)
export type Habit = { level: number; warm: number; curtain: number; target: number };
export type TraceEntry = { at: number; kind: string; text: string };

// 追加一条行为记录;1.5 秒内的完全重复忽略,最多保留 80 条
function pushTrace(trace: TraceEntry[], kind: string, text: string): TraceEntry[] {
  const last = trace[trace.length - 1];
  const now = Date.now();
  if (last && last.kind === kind && last.text === text && now - last.at < 1500) return trace;
  return [...trace, { at: now, kind, text }].slice(-80);
}

type Saved = {
  found: string[];
  solved: string[];
  hints: Record<string, number>;
  habit: Habit | null;
  devMode: boolean;
  hmUnlocked: boolean;
  trace: TraceEntry[];
  adminOpen: boolean;
  ending: Ending;
};

const KEY = 'homemind-save-v3';
const empty: Saved = { found: [], solved: [], hints: {}, habit: null, devMode: false, hmUnlocked: false, trace: [], adminOpen: false, ending: null };

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

type Ctx = Saved & {
  toast: string | null;
  unlock: (id?: string) => void;
  solve: (id: string) => void;
  askHint: (id: string) => void;
  track: (kind: string, text: string) => void;
  setHabit: (h: Habit) => void;
  enableDev: () => void;
  unlockHM: () => void;
  notify: (msg: string) => void;
  openAdmin: () => void;
  finish: (e: Exclude<Ending, null>) => void;
  reset: () => void;
};

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<Saved>(load);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(save));
    } catch {
      /* 存档失败不影响游玩 */
    }
  }, [save]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // 玩家真实的操作习惯,只存在本地浏览器里
  const track = useCallback((kind: string, text: string) => setSave((s) => ({ ...s, trace: pushTrace(s.trace, kind, text) })), []);

  const unlock = useCallback(
    (id?: string) => {
      if (!id || save.found.includes(id)) return;
      const clue = CLUES.find((c) => c.id === id);
      if (!clue) return;
      setSave((s) => ({ ...s, found: [...s.found, id] }));
      setToast(`已添加到备忘录:${clue.title}`);
    },
    [save.found],
  );

  const solve = useCallback(
    (id: string) => {
      if (save.solved.includes(id)) return;
      const puzzle = PUZZLES.find((p) => p.id === id);
      if (!puzzle) return;
      setSave((s) => ({ ...s, solved: [...s.solved, id] }));
      setToast(`待办已完成:${puzzle.title}`);
    },
    [save.solved],
  );

  const value = useMemo<Ctx>(
    () => ({
      ...save,
      toast,
      unlock,
      solve,
      askHint: (id) =>
        setSave((s) => ({ ...s, hints: { ...s.hints, [id]: Math.min(4, (s.hints[id] ?? 0) + 1) }, trace: pushTrace(s.trace, 'hint', `向 AI 求助 ${id}`) })),
      track,
      setHabit: (habit) => setSave((s) => ({ ...s, habit })),
      unlockHM: () => setSave((s) => ({ ...s, hmUnlocked: true })),
      enableDev: () => setSave((s) => ({ ...s, devMode: true })),
      notify: (msg) => setToast(msg),
      openAdmin: () => setSave((s) => ({ ...s, adminOpen: true })),
      finish: (e) => setSave((s) => ({ ...s, ending: e })),
      reset: () => {
        setSave(empty);
        setToast(null);
      },
    }),
    [save, toast, unlock, solve, track],
  );

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
