import { Group, IconTile, Row } from '../../components/ios';
import { CLUES } from '../../game/clues';
import { useGame } from '../../game/GameState';

// 备忘录里的"记录":玩家发现的每条线索,以一条备忘的形式出现
export default function Clues() {
  const { found } = useGame();
  const notes = CLUES.filter((c) => found.includes(c.id));
  if (!notes.length) {
    return <p className="mt-24 text-center text-[17px] text-[#8e8e93]">无备忘录</p>;
  }
  return (
    <Group footer={`${notes.length} 个备忘录`}>
      {notes.map((c) => (
        <Row key={c.id} leading={<IconTile bg="bg-[#ffcc00]">📝</IconTile>} title={<span className="font-medium">{c.title}</span>}>
          <span className="mt-0.5 block text-[14px] leading-relaxed text-[#3c3c43]/80">{c.desc}</span>
          <span className="mt-1 block text-[12px] text-[#8e8e93]">{c.source}</span>
        </Row>
      ))}
    </Group>
  );
}
