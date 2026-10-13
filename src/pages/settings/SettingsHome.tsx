import { useNavigate } from 'react-router-dom';
import { Group, IconTile, Row } from '../../components/ios';
import { useGame } from '../../game/GameState';

export default function SettingsHome() {
  const navigate = useNavigate();
  const { devMode } = useGame();
  return (
    <div>
      <Group>
        <Row
          leading={<span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-[#a1a1a6] to-[#6e6e73] text-xl text-white">管</span>}
          title={<span className="text-[19px]">家庭管理员</span>}
        >
          <span className="mt-0.5 block text-[13px] text-[#8e8e93]">HomeMind · 主控设备</span>
        </Row>
      </Group>
      <Group>
        <Row leading={<IconTile bg="bg-[#007aff]">📶</IconTile>} title="无线局域网" detail="HomeMind-5G" />
        <Row leading={<IconTile bg="bg-[#007aff]">ᛒ</IconTile>} title="蓝牙" detail="打开" />
        <Row leading={<IconTile bg="bg-[#ff3b30]">🔔</IconTile>} title="通知" />
      </Group>
      <Group>
        <Row leading={<IconTile bg="bg-[#8e8e93]">⚙️</IconTile>} title="通用" chevron onClick={() => navigate('/phone/settings/general')} />
        <Row leading={<IconTile bg="bg-[#007aff]">☀️</IconTile>} title="显示与亮度" />
        <Row leading={<IconTile bg="bg-[#007aff]">✋</IconTile>} title="隐私与安全性" />
      </Group>
      {devMode && (
        <Group>
          <Row leading={<IconTile bg="bg-[#8e8e93]">🛠️</IconTile>} title="开发者选项" chevron onClick={() => navigate('/phone/settings/developer')} />
        </Group>
      )}
    </div>
  );
}
