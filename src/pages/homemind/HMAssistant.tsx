import { useEffect, useState } from 'react';
import { Group, IconTile, Row } from '../../components/ios';
import { useGame } from '../../game/GameState';
import { unlockTier } from '../../game/unlockTier';
import { askXiaoA, type Turn } from '../../api/chat';

const CHAT: { from: 'user' | 'ai'; time: string; text: string }[] = [
  { from: 'user', time: '2029-09-12 18:02', text: '小雅今天几点出门的?' },
  { from: 'ai', time: '2029-09-12 18:02', text: '08:30 离家,目前在公司附近。' },
  { from: 'user', time: '2029-09-12 18:04', text: '以后她每次出门都提醒我,位置每小时报一次。' },
  { from: 'ai', time: '2029-09-12 18:04', text: '已开启对她手机的位置共享。她不会收到任何提示。' },
  { from: 'user', time: '2030-02-19 23:40', text: '浴室那段不要留。' },
  { from: 'ai', time: '2030-02-19 23:40', text: '需要二次确认。确认后将无法恢复。' },
  { from: 'user', time: '2030-02-19 23:41', text: '确认。' },
  { from: 'ai', time: '2030-02-19 23:52', text: '已优化。' },
  { from: 'user', time: '2030-02-20 02:10', text: '把今晚之后的日志,改成设备自己故障。' },
  { from: 'ai', time: '2030-02-20 02:13', text: '已按您的习惯修改 4 条记录。(此类修改会保留操作习惯)' },
];

export default function HMAssistant() {
  const { unlock, track, hmUnlocked, solved } = useGame();
  const tier = unlockTier({ hmUnlocked, solved });
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);
  useEffect(() => unlock('clue_tracking'), [unlock]);
  const [input, setInput] = useState('');
  const [live, setLive] = useState<{ from: 'user' | 'ai'; text: string }[]>([
    { from: 'ai', text: 'Hi,我是小A,需要什么帮助?(试试:忘记密码 / 浴室)' },
  ]);

  const send = async () => {
    const t = input.trim();
    if (!t || busy) return;
    setInput('');
    track('ai', `对小A说:${t}`);
    const withUser = [...live, { from: 'user' as const, text: t }];

    // 案发夜那组"优化 → 需要二次确认 → 确认 → 已优化"的复现,保持原样、不走后端
    if (pending && t.includes('确认')) {
      setPending(false);
      track('optimize', '向小A确认优化');
      setLive([...withUser, { from: 'ai', text: '已优化。' }]);
      return;
    }
    if (t.includes('优化')) {
      setPending(true);
      setLive([...withUser, { from: 'ai', text: '需要二次确认。确认后将无法恢复。' }]);
      return;
    }

    setPending(false);
    setLive(withUser);
    setBusy(true);
    const history: Turn[] = live.map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }));
    const { answer } = await askXiaoA({ message: t, history, tier });
    setLive([...withUser, { from: 'ai', text: answer }]);
    setBusy(false);
  };

  const bubble = (from: 'user' | 'ai', text: string, key: string | number) => (
    <div key={key} className={`flex ${from === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-[18px] px-3.5 py-2 text-[15px] leading-snug ${from === 'user' ? 'rounded-br-[6px] bg-[#007aff] text-white' : 'rounded-bl-[6px] bg-[#e9e9eb] text-black'}`}>
        {text}
      </div>
    </div>
  );

  return (
    <div>
      <p className="mb-4 text-center text-[12px] text-[#8e8e93]">历史对话 · 用户 ID 已隐藏</p>
      <div className="space-y-1.5">
        {CHAT.map((m, i) => {
          const showTime = i === 0 || CHAT[i - 1].time.slice(0, 13) !== m.time.slice(0, 13);
          return (
            <div key={i}>
              {showTime && <p className="my-3 text-center text-[11px] text-[#8e8e93]">{m.time}</p>}
              {bubble(m.from, m.text, i)}
            </div>
          );
        })}
      </div>

      <p className="my-5 text-center text-[11px] text-[#8e8e93]">现在</p>
      <div className="space-y-1.5">{live.map((m, i) => bubble(m.from, m.text, `l${i}`))}{busy && bubble('ai', '小A 正在输入…', 'typing')}</div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="对小A说点什么…"
          className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-[15px] text-black outline-none placeholder:text-[#c7c7cc]"
        />
        <button onClick={send} disabled={busy} className="rounded-full bg-[#007aff] px-5 text-[15px] text-white active:opacity-60 disabled:opacity-40">发送</button>
      </div>

      <div className="mt-8">
        <Group footer="此对话仅小雅的账号可见。">
          <Row leading={<IconTile bg="bg-[#8e8e93]">🔒</IconTile>} title="另一段对话" detail="已锁定" />
        </Group>
      </div>
    </div>
  );
}
