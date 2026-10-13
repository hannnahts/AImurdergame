import { useNavigate } from 'react-router-dom';
import { Group, Row } from '../../components/ios';

export default function General() {
  const navigate = useNavigate();
  return (
    <div>
      <Group>
        <Row title="关于本机" chevron onClick={() => navigate('/phone/settings/about')} />
        <Row title="软件更新" detail="已是最新" />
      </Group>
      <Group>
        <Row title="iPad 储存空间" detail="38.2 GB / 128 GB" />
        <Row title="后台 App 刷新" detail="打开" />
      </Group>
    </div>
  );
}
