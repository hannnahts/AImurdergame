import { useEffect, useState } from 'react';
import { Group, IconTile, Row } from '../../components/ios';
import { useGame } from '../../game/GameState';

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

// 小A 的关键词应答(沿用旧版)
function reply(text: string) {
  const t = text.trim();
  if (!t) return '小A听不懂主人的话,可以再说一遍吗?';
  if (t.includes('忘记密码')) return '如果主人忘记了密码,可以通过手机发送验证信息修改密码哦~ 若手机不在身边,可以看看与 app 绑定的论坛内容,或许能勾起回忆 ><';
  if (['浴室', '卫生间', '浴缸'].some((k) => t.includes(k))) return '目前浴室系统连接异常,可以检查接地情况、致电客服,或在论坛发技术帖子求助哦~';
  if (t.includes('小雅')) return '小雅的最后一次登录是 2 天前。';
  if (['删除', '记录'].some((k) => t.includes(k))) return '修改记录需要管理员二次确认,且不可恢复哦。';
  return '小A听不懂主人的话,可以再说一遍吗?';
}

export default function HMAssistant() {
  const { unlock, track } = useGame();
  const [pending, setPending] = useState(false);
  useEffect(() => unlock('clue_tracking'), [unlock]);
  const [input, setInput] = useState('');
  const [live, setLive] = useState<{ from: 'user' | 'ai'; text: string }[]>([
    { from: 'ai', text: 'Hi,我是小A,需要什么帮助?(试试:忘记密码 / 浴室)' },
  ]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    let r: string;
    if (pending && t.includes('确认')) {
      r = '已优化。';
      setPending(false);
      track('optimize', '向小A确认优化');
    } else if (t.includes('优化')) {
      r = '需要二次确认。确认后将无法恢复。';
      setPending(true);
    } else {
      r = reply(t);
      setPending(false);
    }
    track('ai', `对小A说:${t}`);
    setLive((l) => [...l, { from: 'user', text: input }, { from: 'ai', text: r }]);
    setInput('');
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
      <div className="space-y-1.5">{live.map((m, i) => bubble(m.from, m.text, `l${i}`))}</div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="对小A说点什么…"
          className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2 text-[15px] text-black outline-none placeholder:text-[#c7c7cc]"
        />
        <button onClick={send} className="rounded-full bg-[#007aff] px-5 text-[15px] text-white active:opacity-60">发送</button>
      </div>

      <div className="mt-8">
        <Group footer="此对话仅小雅的账号可见。">
          <Row leading={<IconTile bg="bg-[#8e8e93]">🔒</IconTile>} title="另一段对话" detail="已锁定" />
        </Group>
      </div>
    </div>
  );
}
