import { useEffect } from 'react';
import { Group, IconTile, Row } from '../../components/ios';
import { useGame } from '../../game/GameState';

export default function HMDevices() {
  const { unlock } = useGame();
  useEffect(() => unlock('clue_phone'), [unlock]);
  return (
    <Group title="登录此账号的设备" footer="轻点平板查看权限。">
      <Row leading={<IconTile bg="bg-[#8e8e93]">📱</IconTile>} title="小雅的手机" detail="离线">
        <span className="mt-0.5 block text-[13px] text-[#8e8e93]">DEV-0207-B · 主账号 · 02-19 23:31 起</span>
      </Row>
      <Row leading={<IconTile bg="bg-[#007aff]">🖥️</IconTile>} title="平板" detail={<span className="text-[#34c759]">在线</span>} chevron onClick={() => unlock('clue_device')}>
        <span className="mt-0.5 block text-[13px] text-[#8e8e93]">DEV-0314-A · 2028 年绑定 · 保留管理权限</span>
      </Row>
    </Group>
  );
}
