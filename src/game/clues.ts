export type Clue = { id: string; title: string; desc: string; source: string };

// 顺序即备忘录里的显示顺序
export const CLUES: Clue[] = [
  { id: 'clue_timegap', title: '时间线对不上', desc: '备份恢复后,有几条记录的日期被挪动过,系统提示"记录已优化"。', source: '论坛 · 故障求助' },
  { id: 'clue_control', title: '她曾抱怨被监控', desc: '小雅发帖说,男友给全屋装了监控,还说"这是爱"。她不太敢反驳。', source: '论坛 · 生活分享' },
  { id: 'clue_pintip', title: '后台的进入方式', desc: '设置 → 通用 → 关于本机,连点「版本号」打开开发者选项,后台入口在里面。PIN 常是家里发生大事的那天,月日四位数字。', source: '论坛 · 技术讨论' },
  { id: 'clue_lan', title: '"入侵"来自家里', desc: '未经授权的远程访问,来源 192.168.1.2,是本地局域网,不是外部黑客。', source: 'HomeMind 日志' },
  { id: 'clue_lock', title: '03-14 23:07 门锁被反锁', desc: '室内开锁功能被禁用。远程反锁需要管理员权限,操作人信息权限不足,无法查看。', source: 'HomeMind 日志' },
  { id: 'clue_camera', title: '客厅录像缺失 23:10–23:52', desc: '该时段画面不存在,由手动指令触发,不是系统自动清理。', source: 'HomeMind 日志' },
  { id: 'clue_motion', title: '22:58 客厅检测到移动', desc: '03-14 22:58 客厅检测到移动,此后一小时内再没有正常记录。', source: '墙面面板 · 最近事件' },
  { id: 'clue_phone', title: '小雅的手机 23:31 离线', desc: '她的手机直到 03-14 23:31 才断开连接,之后位置不再更新。', source: 'HomeMind 设备' },
  { id: 'clue_tracking', title: 'AI 助手里的指令', desc: '有人要求持续追踪小雅的位置且不让她知道;03-14 23:52,AI 回复"已优化"。用户 ID 被隐藏。', source: 'AI 助手对话' },
  { id: 'clue_device', title: '主控设备 DEV-0314-A', desc: '家里唯一的管理员设备。', source: 'HomeMind 设备' },
  { id: 'clue_edit', title: '4 次日志编辑记录', desc: '4 次编辑来自同一台设备 DEV-0314-A,编辑人信息已被加密。', source: '后台日志' },
];

export const ADMIN_PIN = '0314';
