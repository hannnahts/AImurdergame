import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../game/GameState';
import { forumPosts, forumSections, sectionCountOffset } from '../forumData';
import type { SectionKey } from '../forumTypes';
import { userInfo } from '../userInfo';

const ME = '小雅_Cloud';

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const u = userInfo(name);
  return (
    <span
      className="inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium text-white"
      style={{ width: size, height: size, background: u.color, fontSize: size * 0.42 }}
    >
      {u.char}
    </span>
  );
}

export function Badge({ children, tone = 'orange' }: { children: React.ReactNode; tone?: 'orange' | 'red' | 'blue' | 'gray' }) {
  const map = {
    orange: 'border-orange-300 bg-orange-50 text-orange-600',
    red: 'border-red-300 bg-red-50 text-red-600',
    blue: 'border-sky-300 bg-sky-50 text-sky-700',
    gray: 'border-[#ddd] bg-[#f5f5f5] text-[#777]',
  };
  return <span className={`inline-flex items-center rounded-[3px] border px-1.5 py-px text-[11px] leading-4 ${map[tone]}`}>{children}</span>;
}

/* 顶栏:返回、Logo、搜索、当前登录用户 */
export function ForumHeader({ query, onQuery, onSubmit }: { query: string; onQuery: (q: string) => void; onSubmit?: (q: string) => void }) {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#e6e6e6] bg-white px-3 py-2">
      <button aria-label="返回主屏幕" onClick={() => nav('/phone')} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#007aff] transition-colors hover:bg-black/5">
        <svg width="10" height="17" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2 2 10l8 8" /></svg>
      </button>
      <button onClick={() => nav('/phone/forum')} className="flex shrink-0 items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-orange-400 to-orange-600 text-[13px] font-black text-white">XX</span>
        <span className="hidden text-[19px] font-bold tracking-wide text-[#333] sm:block">XX论坛</span>
      </button>
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit?.(query); }}
        className="mx-1 flex min-w-0 max-w-xl flex-1 overflow-hidden rounded border border-orange-400"
      >
        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="搜索帖子 / 用户 / 关键词" className="min-w-0 flex-1 bg-white px-3 py-1.5 text-[13px] text-[#333] outline-none placeholder:text-[#aaa]" />
        <button className="bg-orange-500 px-4 text-[13px] text-white transition-colors hover:bg-orange-600">搜索</button>
      </form>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Avatar name={ME} size={30} />
        <div className="hidden text-[12px] leading-tight md:block">
          <p className="font-medium text-[#333]">{ME}</p>
          <p className="text-[#999]"><span className="text-orange-500">VIP3</span> · 在线</p>
        </div>
      </div>
    </header>
  );
}

/* 板块导航标签 */
export function ForumNav({ active, onSelect }: { active: SectionKey | ''; onSelect: (k: SectionKey) => void }) {
  const { notify } = useGame();
  const tabs = forumSections.filter((s) => !s.key.startsWith('mine_'));
  return (
    <nav className="flex items-center border-b border-[#e6e6e6] bg-white pl-2 pr-3">
      <div className="custom-scrollbar flex min-w-0 flex-1 overflow-x-auto whitespace-nowrap [mask-image:linear-gradient(to_right,#000_88%,transparent)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            className={`relative px-4 py-2.5 text-[14px] transition-colors ${active === t.key ? 'font-semibold text-orange-600' : 'text-[#555] hover:text-orange-500'}`}
          >
            {t.label}
            {t.badge && <span className="ml-1 rounded-sm bg-red-500 px-1 text-[10px] leading-4 text-white">new</span>}
            {active === t.key && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-orange-500" />}
          </button>
        ))}
      </div>
      <button onClick={() => notify('发帖需要先通过新手验证')} className="ml-2 shrink-0 rounded bg-orange-500 px-3 py-1.5 text-[13px] text-white transition-colors hover:bg-orange-600 active:scale-[0.97] sm:px-4" aria-label="发帖">
        ✎<span className="max-sm:hidden"> 发帖</span>
      </button>
    </nav>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-[#e6e6e6] bg-white">
      <h3 className="border-b border-[#eee] bg-[#fafafa] px-3 py-2 text-[13px] font-semibold text-[#333]">{title}</h3>
      {children}
    </section>
  );
}

/* 右侧栏:用户卡片、我的入口、论坛统计、热门帖子 */
export function ForumSideBar({ onSelect, onOpen }: { onSelect: (k: SectionKey, locked?: boolean) => void; onOpen: (id: string) => void }) {
  const { notify } = useGame();
  const mine = forumSections.filter((s) => s.key.startsWith('mine_'));
  const hot = [...forumPosts].sort((a, b) => b.views - a.views).slice(0, 4);
  return (
    <aside className="space-y-3">
      <Box title="我的账号">
        <div className="flex items-center gap-3 p-3">
          <Avatar name={ME} size={44} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-[#333]">{ME}</p>
            <p className="text-[12px] text-[#999]"><span className="text-orange-500">VIP3</span> · 积分 1280</p>
          </div>
          <button onClick={() => notify('今日已签到，积分 +5')} className="rounded border border-orange-400 px-2.5 py-1 text-[12px] text-orange-600 transition-colors hover:bg-orange-50 active:scale-[0.97]">签到</button>
        </div>
        <ul className="border-t border-[#eee]">
          {mine.map((m) => (
            <li key={m.key}>
              <button onClick={() => onSelect(m.key, m.locked)} className="flex w-full items-center justify-between px-3 py-2 text-[13px] text-[#555] transition-colors hover:bg-orange-50 hover:text-orange-600">
                <span>{m.label}{m.locked ? ' 🔒' : ''}</span>
                <span className="text-[#aaa]">{sectionCountOffset[m.key] ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </Box>

      <Box title="论坛统计">
        <dl className="grid grid-cols-2 gap-y-2 p-3 text-[12px] text-[#777]">
          <dt>今日帖子</dt><dd className="text-right font-medium text-[#333]">128</dd>
          <dt>昨日帖子</dt><dd className="text-right font-medium text-[#333]">203</dd>
          <dt>总主题</dt><dd className="text-right font-medium text-[#333]">11,742</dd>
          <dt>在线用户</dt><dd className="text-right font-medium text-orange-600">3,456</dd>
        </dl>
      </Box>

      <Box title="热门主题">
        <ol className="py-1">
          {hot.map((p, i) => (
            <li key={p.id}>
              <button onClick={() => onOpen(p.id)} className="flex w-full items-start gap-2 px-3 py-1.5 text-left text-[13px] text-[#444] transition-colors hover:text-orange-600">
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-[10px] text-white ${i < 3 ? 'bg-orange-500' : 'bg-[#bbb]'}`}>{i + 1}</span>
                <span className="line-clamp-2">{p.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </Box>
    </aside>
  );
}

export function ForumFooter() {
  return (
    <footer className="border-t border-[#e6e6e6] bg-white px-4 py-4 text-center text-[12px] leading-6 text-[#999]">
      <p>关于我们 · 联系客服 · 隐私政策 · 版规</p>
      <p>© XX论坛 版权所有 · 请勿发布违法信息</p>
    </footer>
  );
}
