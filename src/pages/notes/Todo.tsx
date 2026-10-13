import { useNavigate } from 'react-router-dom';
import { Group, Row } from '../../components/ios';
import { CHAPTER_1_IDS, PUZZLES } from '../../game/puzzles';
import { useGame } from '../../game/GameState';

// 备忘录里的"待办":第一章的谜题伪装成一份清单
export default function Todo() {
  const navigate = useNavigate();
  const { found, solved, devMode } = useGame();
  const chapter = PUZZLES.filter((p) => p.chapter === 1);
  const done = CHAPTER_1_IDS.every((id) => solved.includes(id));

  return (
    <div>
      <Group footer="想弄明白的事。">
        {chapter.map((p) => {
          const isSolved = solved.includes(p.id);
          const blocked = !!p.after && !solved.includes(p.after);
          const missing = p.requires.filter((c) => !found.includes(c));
          const to = p.kind === 'pin' ? (devMode ? '/phone/settings/developer' : '/phone/settings') : `/phone/notes/todo/${p.id}`;
          return (
            <Row
              key={p.id}
              leading={
                <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] text-[12px] text-white ${isSolved ? 'border-[#ffcc00] bg-[#ffcc00]' : 'border-[#c7c7cc]'}`}>
                  {isSolved ? '✓' : ''}
                </span>
              }
              title={<span className={isSolved ? 'text-[#8e8e93] line-through' : blocked ? 'text-[#8e8e93]' : ''}>{p.goal}</span>}
              detail={!isSolved && !blocked && missing.length ? `缺 ${missing.length} 条记录` : undefined}
              onClick={blocked ? undefined : () => navigate(to)}
            >
              {isSolved && <span className="mt-0.5 block text-[13px] text-[#8e8e93]">{p.insight}</span>}
            </Row>
          );
        })}
      </Group>

      {done && (
        <Group footer="AI 助手里,有一段你还看不到的对话。">
          <Row title="第一章 完" detail="有人动了所有记录,而且熟悉这里的一切。" />
          <Row title={<span className="text-[#007aff]">预览终章(开发中)</span>} chevron onClick={() => navigate('/ending')} />
        </Group>
      )}
    </div>
  );
}
