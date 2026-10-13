import { useEffect } from 'react';
import { Group, IconTile, Row } from '../../components/ios';
import { useGame } from '../../game/GameState';

const CHAT: { from: 'user' | 'ai'; time: string; text: string }[] = [
  { from: 'user', time: '02-20 18:02', text: '小雅今天几点出门的?' },
  { from: 'ai', time: '02-20 18:02', text: '08:30 离家,目前在公司附近。' },
  { from: 'user', time: '02-20 18:04', text: '以后她每次出门都提醒我,位置每小时报一次。' },
  { from: 'ai', time: '02-20 18:04', text: '已开启对她手机的位置共享。她不会收到任何提示。' },
  { from: 'user', time: '03-14 23:40', text: '客厅那段不要留。' },
  { from: 'ai', time: '03-14 23:40', text: '需要二次确认。确认后将无法恢复。' },
  { from: 'user', time: '03-14 23:41', text: '确认。' },
  { from: 'ai', time: '03-14 23:52', text: '已优化。' },
  { from: 'user', time: '03-15 02:10', text: '把今天晚上之后的日志,改成她是自己出门的。' },
  { from: 'ai', time: '03-15 02:13', text: '已按您的习惯修改 4 条记录。(此类修改会保留操作习惯)' },
];

export default function HMAssistant() {
  const { unlock } = useGame();
  useEffect(() => unlock('clue_tracking'), [unlock]);

  return (
    <div>
      <p className="mb-4 text-center text-[12px] text-[#8e8e93]">对话记录 · 用户 ID 已隐藏</p>
      <div className="space-y-1.5">
        {CHAT.map((m, i) => {
          const showTime = i === 0 || CHAT[i - 1].time.slice(0, 5) !== m.time.slice(0, 5);
          return (
            <div key={i}>
              {showTime && <p className="my-3 text-center text-[11px] text-[#8e8e93]">{m.time}</p>}
              <div className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-[18px] px-3.5 py-2 text-[15px] leading-snug ${
                    m.from === 'user' ? 'rounded-br-[6px] bg-[#007aff] text-white' : 'rounded-bl-[6px] bg-[#e9e9eb] text-black'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8">
        <Group footer="此对话仅小雅的账号可见。">
          <Row leading={<IconTile bg="bg-[#8e8e93]">🔒</IconTile>} title="另一段对话" detail="已锁定" />
        </Group>
      </div>
    </div>
  );
}
