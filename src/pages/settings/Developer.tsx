import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Group, Row, Switch } from '../../components/ios';
import { useGame } from '../../game/GameState';

export default function Developer() {
  const navigate = useNavigate();
  const { devMode } = useGame();
  const [usb, setUsb] = useState(false);
  const [bounds, setBounds] = useState(false);
  if (!devMode) return <Navigate to="/phone/settings" replace />;
  return (
    <div>
      <Group title="HomeMind" footer="仅供维护人员使用。">
        <Row title="HomeMind 后台" detail="需要 PIN" chevron onClick={() => navigate('/phone/settings/developer/console')} />
      </Group>
      <Group title="调试">
        <Row title="USB 调试" detail={<Switch on={usb} onChange={setUsb} />} />
        <Row title="显示布局边界" detail={<Switch on={bounds} onChange={setBounds} />} />
      </Group>
    </div>
  );
}
