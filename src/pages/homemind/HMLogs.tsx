import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, IconTile, Row } from '../../components/ios';
import { useGame } from '../../game/GameState';

type Log = { id: string; time: string; text: string; dot: string; detail: string; clueId?: string };

const LOGS: Log[] = [
  { id: 'l1', time: '08:30', text: '智能门锁:已解锁 (住户:小雅)', dot: 'bg-[#34c759]', detail: '例行记录,没有异常。' },
  { id: 'l2', time: '例行', text: '灯光系统:卧室灯光已调至 30%', dot: 'bg-[#c7c7cc]', detail: '例行记录,没有异常。' },
  { id: 'l3', time: '最近', text: '警告:发现未经授权的远程访问尝试', dot: 'bg-[#ff3b30]', detail: '来源地址 192.168.1.2,属于本地局域网。不是外部入侵。', clueId: 'clue_lan' },
  { id: 'l4', time: '03-14 23:07', text: '智能门锁:已远程反锁,室内开锁功能被禁用', dot: 'bg-[#ff3b30]', detail: '操作人:●●●●●●(权限不足,无法查看)', clueId: 'clue_lock' },
  { id: 'l5', time: '03-14 23:10', text: '客厅摄像头:23:10–23:52 录像已优化', dot: 'bg-[#c7c7cc]', detail: '该时段画面不存在。"优化"为手动指令触发,不是系统自动清理。', clueId: 'clue_camera' },
  { id: 'l6', time: '03-15 02:13', text: '系统:4 条日志条目已被编辑', dot: 'bg-[#ff9500]', detail: '编辑详情需要后台权限才能查看。' },
];

export default function HMLogs() {
  const navigate = useNavigate();
  const { unlock } = useGame();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <Group>
        <Row leading={<IconTile bg="bg-[#34c759]">✓</IconTile>} title="系统状态" detail={<span className="text-[#34c759]">已连接</span>} />
      </Group>

      <Group title="活动日志" footer="轻点一条记录查看详情。最近更新 12:45。">
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
        <Row leading={<IconTile bg="bg-[#007aff]">💬</IconTile>} title="AI 助手" detail="对话记录" chevron onClick={() => navigate('/phone/homemind/ai')} />
        <Row leading={<IconTile bg="bg-[#8e8e93]">📱</IconTile>} title="已连接设备" detail="2 台" chevron onClick={() => navigate('/phone/homemind/devices')} />
      </Group>

      <p className="pb-4 text-center text-[13px] text-[#8e8e93]">"HomeMind,让你的家比你更了解你。"</p>
    </div>
  );
}
