import { useState } from 'react';
import { Group, Row } from '../../components/ios';
import { useGame } from '../../game/GameState';

export default function About() {
  const { devMode, enableDev, notify } = useGame();
  const [taps, setTaps] = useState(0);

  // 连点"版本号"进入开发者模式
  const tapBuild = () => {
    if (devMode) {
      notify('您已处于开发者模式');
      return;
    }
    const n = taps + 1;
    setTaps(n);
    if (n >= 7) {
      enableDev();
      notify('您现在处于开发者模式!');
    } else if (n >= 3) {
      notify(`再点击 ${7 - n} 次即可进入开发者模式`);
    }
  };

  return (
    <div>
      <Group>
        <Row title="名称" detail="客厅主控平板" />
        <Row title="型号名称" detail="HM Panel 11" />
        <Row title="序列号" detail="HM0314A7QX" />
      </Group>
      <Group>
        <Row title="HomeMind 设备 ID" detail="DEV-0314-A" />
        <Row title="软件版本" detail="HomeMind OS 3.1.4" />
        <Row title="版本号" detail="20291201.07" onClick={tapBuild} />
      </Group>
    </div>
  );
}
