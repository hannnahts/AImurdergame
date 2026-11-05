export type UnlockTier = 0 | 1 | 2 | 3;

// 小A 能引用多少知识,取决于玩家的解锁进度:
// 0 开局;1 HomeMind 已登录;2 已解开"摆正那一晚"(p12);3 第一章四个谜题全部完成。
export function unlockTier(s: { hmUnlocked: boolean; solved: string[] }): UnlockTier {
  const has = (id: string) => s.solved.includes(id);
  if (['p11', 'p12', 'p13', 'p14'].every(has)) return 3;
  if (s.hmUnlocked && has('p12')) return 2;
  if (s.hmUnlocked) return 1;
  return 0;
}
