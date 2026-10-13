import type { ElementType, ReactNode } from 'react';

// 分组列表:设置 App 风格的圆角白底列表
export function Group({ title, footer, children }: { title?: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-6">
      {title && <h3 className="px-4 pb-1.5 text-[13px] uppercase tracking-wide text-[#6d6d72]">{title}</h3>}
      <div className="overflow-hidden rounded-[12px] bg-white [&>*+*]:border-t [&>*+*]:border-black/10">{children}</div>
      {footer && <div className="px-4 pt-1.5 text-[13px] text-[#6d6d72]">{footer}</div>}
    </section>
  );
}

export function IconTile({ bg, children }: { bg: string; children: ReactNode }) {
  return <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[15px] text-white ${bg}`}>{children}</span>;
}

export function Chevron() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#c4c4c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m1 1 6 6-6 6" />
    </svg>
  );
}

export function Row({ leading, title, detail, chevron, onClick, children }: {
  leading?: ReactNode; title: ReactNode; detail?: ReactNode; chevron?: boolean; onClick?: () => void; children?: ReactNode;
}) {
  const Tag: ElementType = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { onClick, type: 'button' } : {})}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-200 active:bg-black/5"
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] leading-snug text-black">{title}</span>
        {children}
      </span>
      {detail && <span className="shrink-0 text-[15px] text-[#8e8e93]">{detail}</span>}
      {chevron && <Chevron />}
    </Tag>
  );
}

export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-300 ${on ? 'bg-[#34c759]' : 'bg-[#e9e9ea]'}`}
    >
      <span
        className="absolute left-0.5 top-0.5 h-[27px] w-[27px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-transform duration-300"
        style={{ transform: `translateX(${on ? 20 : 0}px)`, transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
      />
    </button>
  );
}
