export type Clue = { id: string; title: string; desc: string; source: string };

// 顺序即备忘录里的显示顺序
export const CLUES: Clue[] = [
  // 论坛
  { id: 'clue_bug', title: '官方说法:已知固件 bug', desc: '官方公告称灯光自己开关、门锁异常记录都是固件 bug,升级即可。评论区已关闭。', source: '论坛 · 官方公告' },
  { id: 'clue_light307', title: '凌晨 3:07,客厅灯自己亮', desc: '小雅发帖:连续三天凌晨 3:07 客厅主灯自己亮,监控无人。"晚安模式"本应拦住,却被越过了。', source: '论坛 · 故障求助' },
  { id: 'clue_formula', title: '复杂密码公式', desc: '前维护员的公式:日期 8 位数字 + 个人元素首字母(大写)+ 关键数字 + 1 个特殊符号。', source: '论坛 · 技术讨论' },
  { id: 'clue_unknown', title: 'Unknown_Command 都在凌晨 3 点', desc: '有人发现日志里大量 Unknown_Command,都在凌晨。小雅回复:她也有。有人问:"你确定你家里没别人吗?"', source: '论坛 · 其他问题' },
  { id: 'clue_birthday', title: '布丁一岁生日', desc: '2029-11-05,小雅发帖庆祝小猫布丁一岁,说"一开始是因为你才装的 HomeMind",并开玩笑要改名叫"吞金兽 $$$"。', source: '论坛 · 生活分享' },
  { id: 'clue_lucky', title: '9 月 9 日,分手那天', desc: '2029-09-09,小雅说她和男朋友"今天分手了",并说"就把今天当成我的幸运数字"。', source: '论坛 · 技术讨论' },
  { id: 'clue_exlogin', title: '前任的手机仍登着系统', desc: '同一天分手的另一位用户发现,前任手机里还登着她的系统,能在她不在时进门。客服可以人工注销远程设备。', source: '论坛 · 技术讨论' },
  { id: 'clue_pintip', title: '后台的进入方式', desc: '设置 → 通用 → 关于本机,连点「版本号」打开开发者选项,后台入口在里面。后台 PIN 是家里出事那天的月日,四位数字。', source: '论坛 · 技术讨论' },
  // HomeMind(登录后)
  { id: 'clue_lan', title: '远程指令来自另一台设备', desc: '多次非本人的远程指令,来自已登记设备 DEV-0314-A,账号是小雅_Cloud。那不是她的手机。', source: 'HomeMind 日志' },
  { id: 'clue_lock', title: '02-19 23:07 门锁被反锁', desc: '室内开锁功能被禁用。远程反锁需要管理权限,操作人信息被隐藏。', source: 'HomeMind 日志' },
  { id: 'clue_ground', title: '23:10 浴室接地保护被关', desc: '浴室的接地保护被远程指令关闭,不是自动策略触发的。', source: 'HomeMind 日志' },
  { id: 'clue_camera', title: '录像缺失 23:10–23:52', desc: '该时段画面不存在,由手动指令触发,不是系统自动清理。', source: 'HomeMind 日志' },
  { id: 'clue_motion', title: '22:40 小雅回到家', desc: '02-19 22:40 门锁记录:小雅已解锁。这是她最后一次正常开门。', source: '门锁记录' },
  { id: 'clue_phone', title: '小雅的手机 23:31 离线', desc: '她的手机在 02-19 23:31 断开连接,之后位置不再更新。', source: 'HomeMind 设备' },
  { id: 'clue_device', title: '平板 DEV-0314-A', desc: '2028 年绑定,保留管理权限,至今在线。分手后从没退出过。', source: 'HomeMind 设备' },
  { id: 'clue_tracking', title: 'AI 助手里的指令', desc: '有人要求持续追踪小雅的位置且不让她知道;2/19 23:40 又要求"浴室那段不要留",23:52 AI 回复"已优化"。用户 ID 被隐藏。', source: 'AI 助手对话' },
  { id: 'clue_edit', title: '4 次日志编辑记录', desc: '4 次编辑来自同一台设备 DEV-0314-A,编辑人信息已被加密。', source: '后台日志' },
];

export const ADMIN_PIN = '0219';
