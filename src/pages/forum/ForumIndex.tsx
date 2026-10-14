import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGame } from "../../game/GameState";
import type { SectionKey } from "./forumTypes";
import { forumPosts } from "./forumData";
import { ForumFooter, ForumHeader, ForumNav, ForumSideBar } from "./components/ForumChrome";
import PostList from "./components/PostList";

export default function ForumIndex() {
  const nav = useNavigate();
  const { notify } = useGame();
  const init = (useLocation().state ?? {}) as { section?: SectionKey; query?: string };

  const [activeSection, setActiveSection] = useState<SectionKey>(init.section ?? "home");
  const [query, setQuery] = useState(init.query ?? "");
  const [sort, setSort] = useState<"default" | "hot">("default");

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      activeSection === "home"
        ? forumPosts
        : activeSection.startsWith("mine_")
          ? forumPosts.filter((p) => p.mirrors?.includes(activeSection))
          : forumPosts.filter((p) => p.section === activeSection);
    const searched = q
      ? base.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.author.toLowerCase().includes(q))
      : base;
    return [...searched].sort((a, b) =>
      sort === "hot" ? b.views - a.views : Number(!!b.isPinned) - Number(!!a.isPinned),
    );
  }, [activeSection, query, sort]);

  const handleSelect = (key: SectionKey, locked?: boolean) => {
    if (locked) {
      notify("此入口需要密码");
      return;
    }
    setActiveSection(key);
  };

  return (
    <div className="min-h-full bg-[#f4f4f4] text-[#333]">
      <ForumHeader query={query} onQuery={setQuery} />
      <ForumNav active={activeSection.startsWith("mine_") ? "" : activeSection} onSelect={setActiveSection} />

      <div className="grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_260px]">
        <main className="border border-[#e6e6e6] bg-white">
          <div className="flex items-center justify-between border-b border-[#eee] bg-[#fafafa] px-4 py-2 text-[13px]">
            <span className="text-[#777]">共 {filteredPosts.length} 个主题</span>
            <span className="flex gap-3">
              {([["default", "综合"], ["hot", "热门"]] as const).map(([k, label]) => (
                <button key={k} onClick={() => setSort(k)} className={sort === k ? "font-semibold text-orange-600" : "text-[#888] hover:text-orange-500"}>
                  {label}
                </button>
              ))}
            </span>
          </div>
          <PostList posts={filteredPosts} onOpen={(id) => nav(`/phone/forum/detail/${id}`)} />
          <div className="flex items-center justify-center gap-1.5 border-t border-[#eee] py-3 text-[13px] text-[#777]">
            <span className="rounded bg-orange-500 px-2.5 py-0.5 text-white">1</span>
            <span className="rounded border border-[#e6e6e6] px-2.5 py-0.5">2</span>
            <span className="rounded border border-[#e6e6e6] px-2.5 py-0.5">3</span>
            <span>…</span>
            <span className="rounded border border-[#e6e6e6] px-2.5 py-0.5">下一页</span>
          </div>
        </main>

        <ForumSideBar onSelect={handleSelect} onOpen={(id) => nav(`/phone/forum/detail/${id}`)} />
      </div>
      <ForumFooter />
    </div>
  );
}
