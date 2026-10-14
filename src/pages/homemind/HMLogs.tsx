import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, IconTile, Row } from '../../components/ios';
import { useGame } from '../../game/GameState';

type Log = { id: string; time: string; text: string; dot: string; detail: string; clueId?: string };

const LOGS: Log[] = [
  { id: 'l0', time: '例行', text: '灯光系统:卧室灯光已调至 30%', dot: 'bg-[#c7c7cc]', detail: '例行记录,没有异常。' },
  { id: 'l1', time: '02-19 22:40', text: '智能门锁:已解锁 (住户:小雅)', dot: 'bg-[#34c759]', detail: '小雅回到家。这是她最后一次正常开门。', clueId: 'clue_motion' },
  { id: 'l2', time: '最近', text: '警告:检测到非本人设备的远程指令', dot: 'bg-[#ff3b30]', detail: '设备 DEV-0314-A · 账号 小雅_Cloud。已登记,但不是小雅的手机。', clueId: 'clue_lan' },
  { id: 'l3', time: '02-19 23:07', text: '智能门锁:已远程反锁,室内开锁功能被禁用', dot: 'bg-[#ff3b30]', detail: '操作人:●●●●●●(权限不足,无法查看)', clueId: 'clue_lock' },
  { id: 'l4', time: '02-19 23:10', text: '浴室:接地保护已关闭 (远程指令)', dot: 'bg-[#ff3b30]', detail: '该指令不是自动策略触发的。', clueId: 'clue_ground' },
  { id: 'l5', time: '02-19 23:10', text: '摄像头:23:10–23:52 录像已优化', dot: 'bg-[#c7c7cc]', detail: '该时段画面不存在。"优化"为手动指令触发,不是系统自动清理。', clueId: 'clue_camera' },
  { id: 'l6', time: '02-20 02:13', text: '系统:4 条日志条目已被编辑', dot: 'bg-[#ff9500]', detail: '编辑详情需要后台权限才能查看。' },
];

const ROOMS: { name: string; bad?: boolean; note: string }[] = [
  { name: '客厅', note: '客厅状态正常,未检测到异常。' },
  { name: '卧室', note: '卧室状态正常,未检测到异常。' },
  { name: '浴室', bad: true, note: '浴室异常:检测到连接不稳定。建议检查接地、致电客服,或在论坛技术板块求助。' },
];

export default function HMLogs() {
  const navigate = useNavigate();
  const { unlock } = useGame();
  const [open, setOpen] = useState<string | null>(null);
  const [room, setRoom] = useState('浴室');

  return (
    <div>
      <Group footer="欢迎回来,小雅。今天是 2030 年 2 月 21 日,您已 2 天未登录系统。">
        <Row leading={<IconTile bg="bg-[#34c759]">✓</IconTile>} title="系统状态" detail={<span className="text-[#34c759]">已连接</span>} />
      </Group>

      <Group title="房屋状态" footer={ROOMS.find((r) => r.name === room)?.note}>
        {ROOMS.map((r) => (
          <Row
            key={r.name}
            title={r.name}
            detail={<span className={r.bad ? 'text-[#ff3b30]' : 'text-[#34c759]'}>{r.bad ? '异常' : '安全'}</span>}
            onClick={() => setRoom(r.name)}
          />
        ))}
      </Group>

      <Group title="活动日志" footer="轻点一条记录查看详情。">
        {LOGS.map((log) => (
          <Row
            key={log.id}
            leading={<span className={`h-2.5 w-2.5 shrink-0 rounded-full ${log.dot}`} />}
            title={log.text}
            onClick={() => {
              setOpen(open === log.id ? null : log.id);
              unlock(log.clueId);
            }}
          >
            <span className="mt-0.5 block text-[13px] text-[#8e8e93]">{log.time}</span>
            {open === log.id && <span className="mt-1.5 block text-[14px] leading-relaxed text-[#3c3c43]/80">{log.detail}</span>}
          </Row>
        ))}
      </Group>

      <Group title="助手与设备">
        <Row leading={<IconTile bg="bg-[#007aff]">💬</IconTile>} title="AI 智能管家 · 小A" detail="在线" chevron onClick={() => navigate('/phone/homemind/ai')} />
        <Row leading={<IconTile bg="bg-[#8e8e93]">📱</IconTile>} title="已连接设备" detail="2 台" chevron onClick={() => navigate('/phone/homemind/devices')} />
      </Group>

      <p className="pb-4 text-center text-[13px] text-[#8e8e93]">"HomeMind,让家更懂你。"</p>
    </div>
  );
}
