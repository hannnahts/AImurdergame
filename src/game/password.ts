// HomeMind 管理员密码 = 20291105 + BD + 9 + $,由论坛线索推出
export const HM_PASSWORD = { date: '20291105', pet: 'BD', lucky: '9', symbol: '$' } as const;
export type PwField = keyof typeof HM_PASSWORD;

const norm: Record<PwField, (s: string) => string> = {
  date: (s) => s.replace(/\D/g, ''),
  pet: (s) => s.trim().toUpperCase(),
  lucky: (s) => s.trim(),
  symbol: (s) => s.trim().replace('＄', '$'),
};

// 逐段校验,给玩家"哪几段对了"的部分反馈
export function checkPassword(input: Record<PwField, string>): Record<PwField, boolean> {
  const out = {} as Record<PwField, boolean>;
  (Object.keys(HM_PASSWORD) as PwField[]).forEach((k) => {
    out[k] = norm[k](input[k]) === HM_PASSWORD[k];
  });
  return out;
}
