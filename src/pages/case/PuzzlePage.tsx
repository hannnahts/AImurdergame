import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CLUES } from '../../game/clues';
import { PUZZLES, type Puzzle } from '../../game/puzzles';
import { useGame } from '../../game/GameState';

function Pick({ puzzle }: { puzzle: Puzzle }) {
  const { solved, solve } = useGame();
  const [msg, setMsg] = useState<string | null>(null);
  const isSolved = solved.includes(puzzle.id);
  return (
    <div className="space-y-2">
      {puzzle.options!.map((o) => {
        const right = isSolved && o.id === puzzle.answer;
        return (
          <button
            key={o.id}
            disabled={isSolved}
            onClick={() => {
              if (o.id === puzzle.answer) {
                setMsg(null);
                solve(puzzle.id);
              } else setMsg(o.wrong ?? '再想想。');
            }}
            className={`block w-full text-left rounded-xl border px-4 py-3 text-xs transition-colors ${
              right ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
            }`}
          >
            {o.text}
          </button>
        );
      })}
      {msg && <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-4 py-2">{msg}</p>}
    </div>
  );
}

function Timeline({ puzzle }: { puzzle: Puzzle }) {
  const { solved, solve } = useGame();
  const initial = puzzle.items!.map((i) => i.id);
  const [order, setOrder] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const isSolved = solved.includes(puzzle.id);
  const text = (id: string) => puzzle.items!.find((i) => i.id === id)!.text;
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setMsg(null);
  };
  const submit = () => {
    const ok = order.filter((id, i) => id === puzzle.order![i]).length;
    if (ok === order.length) solve(puzzle.id);
    else setMsg(`${ok}/${order.length} 个位置正确。再调整一下。`);
  };
  return (
    <div className="space-y-2">
      {order.map((id, i) => (
        <div key={id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="w-5 text-[10px] text-slate-400">{i + 1}</span>
          <span className="flex-1 text-xs text-slate-700">{text(id)}</span>
          {!isSolved && (
            <>
              <button aria-label="上移" onClick={() => move(i, -1)} className="px-2 text-slate-500 hover:text-slate-900">↑</button>
              <button aria-label="下移" onClick={() => move(i, 1)} className="px-2 text-slate-500 hover:text-slate-900">↓</button>
            </>
          )}
        </div>
      ))}
      {!isSolved && (
        <div className="flex gap-2 pt-1">
          <button onClick={submit} className="rounded-full bg-slate-900 px-5 py-2 text-xs text-white">确认顺序</button>
          <button onClick={() => { setOrder(initial); setMsg(null); }} className="rounded-full border border-slate-300 px-5 py-2 text-xs text-slate-600">重置</button>
        </div>
      )}
      {msg && <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-4 py-2">{msg}</p>}
    </div>
  );
}

export default function PuzzlePage() {
  const { id } = useParams();
  const puzzle = PUZZLES.find((p) => p.id === id);
  const { found, solved, hints, askHint } = useGame();

  if (!puzzle || puzzle.kind === 'pin') {
    return <div className="py-4 text-sm text-slate-500">找不到这个谜题。<Link to="/phone/notes/todo" className="ml-2 underline">返回待办</Link></div>;
  }
  if (puzzle.after && !solved.includes(puzzle.after)) {
    return <div className="py-4 text-sm text-slate-500">先解开前面的谜题。<Link to="/phone/notes/todo" className="ml-2 underline">返回待办</Link></div>;
  }

  const missing = puzzle.requires.filter((c) => !found.includes(c));
  const level = hints[puzzle.id] ?? 0;
  const isSolved = solved.includes(puzzle.id);

  return (
    <div className="py-2 pb-10">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">待办事项</p>
      <h2 className="text-xl font-semibold text-slate-800">{puzzle.title}</h2>
      <p className="text-xs text-slate-500 mt-1 mb-4">想弄清:{puzzle.goal}</p>

      {missing.length > 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-xs text-slate-600">
          <p className="mb-2">还缺这些证据,去 App 里找找:</p>
          <ul className="list-disc pl-5 space-y-1">
            {missing.map((c) => <li key={c}>{CLUES.find((x) => x.id === c)!.title}</li>)}
          </ul>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-700 mb-3 leading-relaxed">{puzzle.prompt}</p>
          {puzzle.kind === 'pick' ? <Pick puzzle={puzzle} /> : <Timeline puzzle={puzzle} />}
          {isSolved && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-800">
              {puzzle.insight}
              <Link to="/phone/notes/todo" className="block mt-2 underline">返回待办</Link>
            </div>
          )}
        </>
      )}

      {!isSolved && (
        <div className="mt-6 rounded-2xl bg-slate-100 p-4">
          {hints[puzzle.id] ? (
            <ul className="mb-3 space-y-2">
              {puzzle.hints.slice(0, level).map((h, i) => (
                <li key={i} className="text-xs text-slate-700">AI 助手:{h}</li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-xs text-slate-500">卡住了?助手可以帮你回忆。</p>
          )}
          {level < 4 && (
            <button onClick={() => askHint(puzzle.id)} className="rounded-full border border-slate-300 px-4 py-1.5 text-xs text-slate-600">
              向 AI 助手求助 ({level}/4)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
