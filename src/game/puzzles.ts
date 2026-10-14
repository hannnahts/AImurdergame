export type PuzzleKind = 'pick' | 'timeline' | 'pin' | 'password';

export type Puzzle = {
  id: string;
  chapter: number;
  title: string;
  goal: string;
  difficulty: '教学' | '简单' | '中等';
  kind: PuzzleKind;
  requires: string[]; // 需要先拿到的线索
  after?: string; // 需要先解开的谜题
  prompt: string;
  options?: { id: string; text: string; wrong?: string }[];
  answer?: string;
  items?: { id: string; text: string }[]; // 时间线:初始(乱序)排列
  order?: string[]; // 时间线:正确顺序
  hints: [string, string, string, string]; // 4 级提示,第 4 级为完整答案
  insight: string; // 解开后的领悟
};

export const CHAPTER_1_TITLE = '第一章 · 遗物';

export const PUZZLES: Puzzle[] = [
  {
    id: 'p11',
    chapter: 1,
    title: '她的密码',
    goal: '推出 HomeMind 管理员密码,登录她的家',
    difficulty: '中等',
    kind: 'password',
    requires: ['clue_formula', 'clue_birthday', 'clue_lucky'],
    prompt: '管理员密码分四段。论坛里有人教过规则,她自己也留下了证据。',
    hints: [
      '小A说:忘记密码的话,可以看看和 app 绑定的论坛,或许能勾起回忆。',
      '论坛里有人专门写过设置密码的公式,小雅自己也发过几个帖子。',
      '日期是布丁的生日;宠物首字母取自名字的拼音;幸运数字和分手那天有关;符号藏在"吞金兽"后面。',
      '答案:20291105 · BD · 9 · $',
    ],
    insight: '她把自己的生活,一点一点写进了密码里。',
  },
  {
    id: 'p12',
    chapter: 1,
    title: '摆正那一晚',
    goal: '把 2 月 19 日晚的 5 件事按发生时间排好',
    difficulty: '简单',
    kind: 'timeline',
    after: 'p11',
    requires: ['clue_motion', 'clue_lock', 'clue_ground', 'clue_phone', 'clue_tracking'],
    prompt: '用 ↑ ↓ 把 2月19日晚的事件排成先后顺序,最早的放最上面。时间可以翻翻备忘录。',
    items: [
      { id: 'e3', text: '浴室:接地保护被远程关闭' },
      { id: 'e5', text: 'AI 助手回复:"已优化"' },
      { id: 'e1', text: '小雅回到家,门锁解锁' },
      { id: 'e4', text: '小雅的手机:离线' },
      { id: 'e2', text: '智能门锁:被远程反锁' },
    ],
    order: ['e1', 'e2', 'e3', 'e4', 'e5'],
    hints: [
      '先从最早的一件事开始:她回到家的时候。',
      '门被锁上之后,才有人去动浴室。',
      '小雅的手机离线,发生在接地被关之后。',
      '顺序:22:40 → 23:07 → 23:10 → 23:31 → 23:52。',
    ],
    insight: '23:07 之后,每一条记录都在变少,或者被人改写。',
  },
  {
    id: 'p13',
    chapter: 1,
    title: '后台的门',
    goal: '找到进入 HomeMind 后台的办法,看看被改过的记录',
    difficulty: '中等',
    kind: 'pin',
    after: 'p11',
    requires: ['clue_pintip', 'clue_lock'],
    prompt: '后台藏在设置里,需要 4 位 PIN。论坛里有人说过怎么进去。',
    hints: [
      '论坛"技术讨论"里有人提到过怎么进后台。',
      '先去「设置」,在关于本机里连点版本号;PIN 是出事那一天的月日,四位数字。',
      '出事的那一天,是门锁被反锁的那一天。',
      '答案是 0219。',
    ],
    insight: '后台里确实有人动过手脚。',
  },
  {
    id: 'p14',
    chapter: 1,
    title: '谁在远程操作',
    goal: '判断是谁在背后远程操作她的家',
    difficulty: '中等',
    kind: 'pick',
    after: 'p11',
    requires: ['clue_exlogin', 'clue_unknown', 'clue_lan', 'clue_device'],
    prompt: '凌晨的陌生指令、反锁、关掉接地、清理记录:这一切是谁做的?',
    options: [
      { id: 'hacker', text: '外部黑客', wrong: '指令来自已登记的设备 DEV-0314-A,登录的就是小雅的账号,不是外部入侵。' },
      { id: 'bug', text: '官方说的"固件 bug"', wrong: 'bug 不会精准地在同一时刻反锁、关保护,更不会事后改写日志、要求"不要留"。' },
      { id: 'xiaoya', text: '小雅自己', wrong: '她的手机早在 23:31 就离线了,而且她发帖求助时说自己并不知情。' },
      { id: 'ex', text: '分手后仍登录着系统的另一台设备' },
    ],
    answer: 'ex',
    hints: [
      '把"谁做不到"一个个划掉。',
      '这些操作都需要管理权限,而且来自一台已经登记的设备。',
      '论坛里有人说过,分手后前任的手机还登着她的系统。',
      '答案:分手后仍登录着系统的另一台设备。',
    ],
    insight: '有一台设备,在分手之后,从没真正退出过她的家。',
  },
];

export const CHAPTER_1_IDS = PUZZLES.filter((p) => p.chapter === 1).map((p) => p.id);
