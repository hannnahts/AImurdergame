import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../game/GameState';
import { ADMIN_PIN } from '../../game/clues';

const MASK = '●●●●●●';
const LINES = [
  { cls: 'text-green-500', text: '[SYSTEM] 扫描文件系统中...' },
  { cls: 'text-red-500', text: '[CRITICAL] 发现 4 条日志已被篡改。' },
  { cls: 'text-green-500', text: `#1  02-19 23:52  浴室 / 客厅录像编辑人: ${MASK}  设备: DEV-0314-A` },
  { cls: 'text-green-500', text: `#2  02-20 02:13  门锁记录        编辑人: ${MASK}  设备: DEV-0314-A` },
  { cls: 'text-green-500', text: `#3  02-20 02:13  位置记录        编辑人: ${MASK}  设备: DEV-0314-A` },
  { cls: 'text-green-500', text: `#4  02-20 02:14  AI 对话         编辑人: ${MASK}  设备: DEV-0314-A` },
  { cls: 'text-amber-400', text: '[TRACE] 编辑账号信息已被加密,无法读取。' },
  { cls: 'text-zinc-400', text: '[NOTE] 检测到未登记的备份分区 (1.2GB)。访问被拒绝。' },
];

export default function AdminLogs() {
  const navigate = useNavigate();
  const { adminOpen, openAdmin, unlock, solve } = useGame();
  const [pin, setPin] = useState('');
  const [fails, setFails] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!adminOpen) return;
    unlock('clue_edit');
    solve('p13');
    if (shown >= LINES.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 900);
    return () => clearTimeout(t);
  }, [adminOpen, shown, unlock, solve]);

  const submit = () => {
    if (pin === ADMIN_PIN) {
      openAdmin();
      return;
    }
    // 部分反馈:告诉玩家有几位位置正确,但不说是哪几位
    const ok = [...pin].filter((c, i) => c === ADMIN_PIN[i]).length;
    setFails((n) => n + 1);
    setFeedback(pin.length < 4 ? 'PIN 需要 4 位数字' : `PIN 错误 · ${ok} 位位置正确`);
    setPin('');
  };

  if (!adminOpen) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center font-mono">
        <div className="text-red-600 mb-6 tracking-tighter">{">>>> ADMIN ACCESS"}</div>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          inputMode="numeric"
          placeholder="PIN"
          className="bg-black border border-zinc-700 text-green-500 text-center tracking-[0.6em] px-4 py-2 w-40 outline-none focus:border-green-500"
        />
        <button onClick={submit} className="mt-4 text-zinc-400 hover:text-white text-sm">
          [ 验证 ]
        </button>
        {feedback && <p className="mt-4 text-red-500 text-xs">{feedback}</p>}
        {fails >= 3 && <p className="mt-2 text-zinc-500 text-xs">提示:出事那天的月和日。</p>}
        <button onClick={() => navigate('/phone/settings/developer')} className="mt-10 text-zinc-600 underline text-xs hover:text-white">
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-2 font-mono">
      <div className="text-red-600 mb-4 tracking-tighter">{">>>> INTERNAL_SYSTEM_BYPASS_INITIATED"}</div>
      <div className="border border-zinc-800 p-4 text-sm">
        {LINES.slice(0, shown).map((l, i) => (
          <p key={i} className={`mb-2 ${l.cls}`}>
            {l.text}
          </p>
        ))}
        {shown >= LINES.length && (
          <button onClick={() => navigate('/phone/notes/todo')} className="mt-8 text-zinc-400 underline hover:text-white">
            返回待办...
          </button>
        )}
      </div>
    </div>
  );
}
