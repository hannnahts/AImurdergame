import type { Post } from '../forumTypes';
import { formatSectionName } from '../utils';
import { Avatar, Badge } from './ForumChrome';

export default function PostList({ posts, onOpen }: { posts: Post[]; onOpen: (id: string) => void }) {
  if (posts.length === 0) {
    return <div className="px-4 py-10 text-center text-[13px] text-[#999]">没有找到相关帖子。</div>;
  }
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id} className="border-b border-[#eee] last:border-b-0">
          <button onClick={() => onOpen(p.id)} className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-orange-50/50">
            <Avatar name={p.author} size={38} />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-1.5">
                {p.isPinned && <Badge tone="red">置顶</Badge>}
                <Badge tone="blue">{formatSectionName(p.section)}</Badge>
                <span className="text-[15px] font-semibold leading-snug text-[#222]">{p.title}</span>
              </span>
              <span className="mt-1 block truncate text-[13px] text-[#888]">{p.excerpt}</span>
              <span className="mt-1 flex flex-wrap gap-x-3 text-[12px] text-[#aaa]">
                <span className="text-sky-700">{p.author}</span>
                <span>{p.time}</span>
                {p.tags?.map((t) => <span key={t}>#{t}</span>)}
              </span>
            </span>
            <span className="hidden w-16 shrink-0 text-center sm:block">
              <span className="block text-[15px] text-[#555]">{p.replies}</span>
              <span className="block text-[11px] text-[#aaa]">回复</span>
              <span className="mt-1 block text-[12px] text-[#999]">{p.views}</span>
              <span className="block text-[11px] text-[#aaa]">查看</span>
            </span>
            <span className="hidden w-28 shrink-0 text-right text-[12px] leading-5 md:block">
              <span className="block text-sky-700">{p.lastBy ?? p.author}</span>
              <span className="block text-[#aaa]">{p.lastTime ?? p.time}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
