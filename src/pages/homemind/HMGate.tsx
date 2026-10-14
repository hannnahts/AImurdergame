import { useState, type ReactNode } from 'react';
import { Group } from '../../components/ios';
import { checkPassword, type PwField } from '../../game/password';
import { PUZZLES } from '../../game/puzzles';
import { useGame } from '../../game/GameState';

const FIELDS: { key: PwField; label: string; placeholder: string; max: number }[] = [
  { key: 'date', label: '第一部分', placeholder: '8 位数字', max: 8 },
  { key: 'pet', label: '第二部分', placeholder: '大写字母', max: 4 },
  { key: 'lucky', label: '第三部分', placeholder: '1 位数字', max: 2 },
  { key: 'symbol', label: '第四部分', placeholder: '1 个符号', max: 1 },
];
const EMPTY: Record<PwField, string> = { date: '', pet: '', lucky: '', symbol: '' };
const P11 = PUZZLES.find((p) => p.id === 'p11')!;

// HomeMind 管理员验证:逐段反馈,输错没有惩罚
export default function HMGate({ children }: { children: ReactNode }) {
  const { hmUnlocked, unlockHM, solve, hints, askHint } = useGame();
  const [values, setValues] = useState(EMPTY);
  const [result, setResult] = useState<Record<PwField, boolean> | null>(null);
  const [forgot, setForgot] = useState(false);

  if (hmUnlocked) return <>{children}</>;

  const level = hints[P11.id] ?? 0;
  const submit = () => {
    const r = checkPassword(values);
    setResult(r);
    if (Object.values(r).every(Boolean)) {
      unlockHM();
      solve(P11.id);
    }
  };
  const okCount = result ? Object.values(result).filter(Boolean).length : 0;

  return (
    <div className="mx-auto max-w-md pt-4">
      <div className="mb-6 text-center">
        <p className="text-[44px] leading-none">🔒</p>
        <h2 className="mt-3 text-[22px] font-semibold text-black">管理员验证</h2>
        <p className="mt-1 text-[14px] text-[#8e8e93]">请输入 HomeMind 管理员密码。密码由四部分组成。</p>
      </div>

      <Group footer={result ? (okCount === 0 ? '四段都不对,再想想线索。' : `${okCount} / 4 段正确。`) : undefined}>
        {FIELDS.map((f) => (
          <label key={f.key} className="flex items-center gap-3 px-4 py-3">
            <span className="w-20 shrink-0 text-[16px] text-black">{f.label}</span>
            <input
              value={values[f.key]}
              maxLength={f.max}
              onChange={(e) => { setValues({ ...values, [f.key]: e.target.value }); setResult(null); }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder={f.placeholder}
              className="min-w-0 flex-1 bg-transparent text-right text-[16px] text-black outline-none placeholder:text-[#c7c7cc]"
            />
            <span className={`w-5 text-center text-[15px] ${result?.[f.key] ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
              {result ? (result[f.key] ? '✓' : '✗') : ''}
            </span>
          </label>
        ))}
      </Group>

      <button onClick={submit} className="mb-3 w-full rounded-[12px] bg-[#007aff] py-3 text-[17px] font-medium text-white transition-opacity active:opacity-60">
        验证
      </button>
      <button onClick={() => setForgot(true)} className="block w-full py-2 text-center text-[15px] text-[#007aff] active:opacity-50">
        忘记密码?
      </button>

      {forgot && (
        <div className="panel-rise mt-3 rounded-[18px] rounded-bl-[6px] bg-[#e9e9eb] px-4 py-3 text-[15px] leading-snug text-black">
          如果主人忘记了密码,可以通过手机发送验证信息修改密码哦~ 若手机不在身边,可以看看与 app 绑定的论坛内容,或许能勾起回忆 &gt;&lt;
          <p className="mt-1 text-[11px] text-[#8e8e93]">小A</p>
        </div>
      )}

      {level > 0 && (
        <ul className="mt-4 space-y-2">
          {P11.hints.slice(0, level).map((h, i) => (
            <li key={i} className="text-[14px] text-[#3c3c43]/80">小A:{h}</li>
          ))}
        </ul>
      )}
      {level < 4 && (
        <button onClick={() => askHint(P11.id)} className="mt-4 block w-full text-center text-[14px] text-[#8e8e93] active:opacity-50">
          向小A求助 ({level}/4)
        </button>
      )}
    </div>
  );
}
