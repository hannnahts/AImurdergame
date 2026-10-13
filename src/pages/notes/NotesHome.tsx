import { useNavigate } from 'react-router-dom';
import { Group, IconTile, Row } from '../../components/ios';
import { CHAPTER_1_IDS } from '../../game/puzzles';
import { useGame } from '../../game/GameState';

export default function NotesHome() {
  const navigate = useNavigate();
  const { found, solved } = useGame();
  const todoLeft = CHAPTER_1_IDS.filter((id) => !solved.includes(id)).length;
  return (
    <Group title="我的 iPad">
      <Row leading={<IconTile bg="bg-[#ffcc00]">📁</IconTile>} title="记录" detail={found.length} chevron onClick={() => navigate('/phone/notes/clues')} />
      <Row leading={<IconTile bg="bg-[#ffcc00]">📁</IconTile>} title="待办" detail={todoLeft} chevron onClick={() => navigate('/phone/notes/todo')} />
    </Group>
  );
}
