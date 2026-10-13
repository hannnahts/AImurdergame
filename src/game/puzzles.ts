export type PuzzleKind = 'pick' | 'timeline' | 'pin';

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

export const CHAPTER_1_TITLE = '第一章 · 失联';

export const PUZZLES: Puzzle[] = [
  {
    id: 'p11',
    chapter: 1,
    title: '被困住的人',
    goal: '找出说明"小雅那晚没法自己出门"的那条记录',
    difficulty: '教学',
    kind: 'pick',
    requires: [],
    prompt: '哪一条记录说明:3月14日晚上,小雅没办法自己走出家门?',
    options: [
      { id: 'l1', text: '智能门锁:于 08:30 已解锁 (住户:小雅)', wrong: '这是早上的例行解锁,说明不了晚上的事。' },
      { id: 'l2', text: '灯光系统:卧室灯光已调至 30%', wrong: '灯光和她能不能出门没有关系。' },
      { id: 'l3', text: '警告:发现未经授权的远程访问尝试', wrong: '这说明有人在操作,但没说谁被困住了。' },
      { id: 'l4', text: '03-14 23:07 智能门锁:已远程反锁,室内开锁功能被禁用' },
      { id: 'l5', text: '03-14 23:10–23:52 客厅摄像头:录像已优化', wrong: '录像缺失说明有人想隐藏什么,但没说她出不出得去。' },
      { id: 'l6', text: '03-15 02:13 系统:4 条日志条目已被编辑', wrong: '有人改过记录,但这和她能不能出门无关。' },
    ],
    answer: 'l4',
    hints: [
      '先看那些带日期的记录。',
      '有一条记录发生在 3月14日 晚上,而且动的是"门"。',
      '门锁那条:室内的什么功能被禁用了?',
      '答案是 03-14 23:07 的门锁记录。',
    ],
    insight: '室内开锁被禁用:她不是不想走,是走不了。',
  },
  {
    id: 'p12',
    chapter: 1,
    title: '摆正那一晚',
    goal: '把当晚的 5 件事按发生时间排好',
    difficulty: '简单',
    kind: 'timeline',
    after: 'p11',
    requires: ['clue_motion', 'clue_lock', 'clue_camera', 'clue_phone', 'clue_tracking'],
    prompt: '用 ↑ ↓ 把 3月14日晚的事件排成先后顺序,最早的放最上面。时间可以翻翻备忘录。',
    items: [
      { id: 'e3', text: '客厅摄像头:录像开始中断' },
      { id: 'e5', text: 'AI 助手回复:"已优化"' },
      { id: 'e1', text: '客厅检测到移动' },
      { id: 'e4', text: '小雅的手机:离线' },
      { id: 'e2', text: '智能门锁:被远程反锁' },
    ],
    order: ['e1', 'e2', 'e3', 'e4', 'e5'],
    hints: [
      '先从最早的一件事开始:客厅里还有人的时候。',
      '门被锁上之后,才有人开始动录像。',
      '小雅的手机离线,发生在录像中断之后。',
      '顺序:22:58 → 23:07 → 23:10 → 23:31 → 23:52。',
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
      '先去「设置」,在关于本机里连点版本号;PIN 是家里发生大事的那一天,月日四位数字。',
      '大事发生在门锁被反锁的那一天。',
      '答案是 0314。',
    ],
    insight: '后台里确实有人动过手脚。',
  },
  {
    id: 'p14',
    chapter: 1,
    title: '谁在指挥',
    goal: '判断是谁在背后让 AI 追踪、锁门、清理记录',
    difficulty: '中等',
    kind: 'pick',
    after: 'p11',
    requires: ['clue_lan', 'clue_lock', 'clue_tracking', 'clue_device'],
    prompt: '追踪小雅、远程锁门、清理记录:这一切是谁的指令?',
    options: [
      { id: 'hacker', text: '外部黑客', wrong: '"入侵"来自局域网 192.168.1.2,也就是家里,不是外部。' },
      { id: 'xiaoya', text: '小雅自己', wrong: '被追踪、被锁在室内的人是她,她不会给自己下这样的指令。' },
      { id: 'guest', text: '来访的陌生人', wrong: '远程反锁需要管理员权限,访客做不到。' },
      { id: 'admin', text: '家里的管理员账号' },
    ],
    answer: 'admin',
    hints: [
      '把"谁做不到"一个个划掉。',
      '这些操作都需要很高的权限,而且来自家里的网络。',
      '家里只有一台设备有管理员权限。',
      '答案:家里的管理员账号。',
    ],
    insight: '只有管理员账号能做到这一切,而且它就在这个家里。',
  },
];

export const CHAPTER_1_IDS = PUZZLES.filter((p) => p.chapter === 1).map((p) => p.id);
