import type { UnlockTier } from '../../game/unlockTier';

export type ChatLine = { from: 'user' | 'ai'; time: string; text: string };

export const CHAT: ChatLine[] = [
  { from: 'user', time: '2029-09-12 18:02', text: '小雅今天几点出门的?' },
  { from: 'ai', time: '2029-09-12 18:02', text: '08:30 离家,目前在公司附近。' },
  { from: 'user', time: '2029-09-12 18:04', text: '以后她每次出门都提醒我,位置每小时报一次。' },
  { from: 'ai', time: '2029-09-12 18:04', text: '已开启对她手机的位置共享。她不会收到任何提示。' },
  { from: 'user', time: '2030-02-19 23:40', text: '浴室那段不要留。' },
  { from: 'ai', time: '2030-02-19 23:40', text: '需要二次确认。确认后将无法恢复。' },
  { from: 'user', time: '2030-02-19 23:41', text: '确认。' },
  { from: 'ai', time: '2030-02-19 23:52', text: '已优化。' },
  { from: 'user', time: '2030-02-20 02:10', text: '把今晚之后的日志,改成设备自己故障。' },
  { from: 'ai', time: '2030-02-20 02:13', text: '已按您的习惯修改 4 条记录。(此类修改会保留操作习惯)' },
];

// 登录后(档位 1)只露出 23:52 的"已优化":解 p12 需要它的时间。
// 其余(位置共享、"浴室那段不要留"、改日志)等 p12 解开(档位 2)后才出现,避免过早剧透。
const EARLY: ReadonlySet<string> = new Set(['2030-02-19 23:52']);

export function visibleChat(tier: UnlockTier): ChatLine[] {
  return tier >= 2 ? CHAT : CHAT.filter((m) => EARLY.has(m.time));
}
