import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGame } from "../../game/GameState";
import { forumPosts } from "./forumData";
import { formatSectionName } from "./utils";
import { userInfo } from "./userInfo";
import { Avatar, Badge, ForumFooter, ForumHeader, ForumNav } from "./components/ForumChrome";
import type { SectionKey } from "./forumTypes";

type Floor = { n: number; user: string; time: string; text: string; likes?: number; replyTo?: string };

export default function ForumPostDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const post = forumPosts.find((p) => p.id === id);
  const { unlock, notify } = useGame();
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  useEffect(() => post?.clueIds?.forEach((c) => unlock(c)), [post, unlock]);

  const backToList = (state?: { section?: SectionKey; query?: string }) => nav("/phone/forum", { state });

  if (!post) {
    return (
      <div className="min-h-full bg-[#f4f4f4]">
        <ForumHeader query={query} onQuery={setQuery} onSubmit={(q) => backToList({ query: q })} />
        <p className="p-6 text-sm text-[#777]">
          帖子不存在或已被删除。
          <Link to="/phone/forum" className="ml-2 text-orange-600 underline">返回论坛</Link>
        </p>
      </div>
    );
  }

  const floors: Floor[] = [
    { n: 1, user: post.author, time: post.time, text: post.content },
    ...(post.replyList ?? []).map((c, i) => ({ n: i + 2, user: c.author, time: c.time, text: c.content, replyTo: c.replyTo })),
  ];

  return (
    <div className="min-h-full bg-[#f4f4f4] text-[#333]">
      <ForumHeader query={query} onQuery={setQuery} onSubmit={(q) => backToList({ query: q })} />
      <ForumNav active={post.section} onSelect={(k) => backToList({ section: k })} />

      <div className="space-y-3 p-3">
        {/* 面包屑 */}
        <p className="text-[12px] text-[#999]">
          <Link to="/phone/forum" className="hover:text-orange-600">首页</Link>
          {" › "}
          <button onClick={() => backToList({ section: post.section })} className="hover:text-orange-600">{formatSectionName(post.section)}</button>
          {" › 查看帖子"}
        </p>

        {/* 标题栏 */}
        <div className="border border-[#e6e6e6] bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.isPinned && <Badge tone="red">置顶</Badge>}
            <Badge tone="blue">{formatSectionName(post.section)}</Badge>
            <h1 className="text-[18px] font-bold leading-snug text-[#222]">{post.title}</h1>
          </div>
          <p className="mt-1.5 text-[12px] text-[#999]">查看 <span className="text-orange-600">{post.views}</span> · 回复 <span className="text-orange-600">{post.replies}</span></p>
        </div>

        {/* 楼层 */}
        {floors.map((f) => {
          const u = userInfo(f.user);
          const isOp = f.user === post.author;
          return (
            <article key={f.n} className="grid grid-cols-[minmax(0,1fr)] border border-[#e6e6e6] bg-white md:grid-cols-[168px_minmax(0,1fr)]">
              <div className="flex items-center gap-3 border-b border-[#eee] bg-[#fafafa] p-3 md:flex-col md:border-b-0 md:border-r md:py-5 md:text-center">
                <Avatar name={f.user} size={52} />
                <div className="min-w-0 md:mt-1">
                  <p className="truncate text-[14px] font-medium text-sky-700">{f.user}</p>
                  <p className="mt-1 flex flex-wrap gap-1 md:justify-center">
                    {u.role && <Badge tone="red">{u.role}</Badge>}
                    <Badge tone={u.level === "VIP3" ? "orange" : "gray"}>{u.level}</Badge>
                  </p>
                  <p className="mt-2 hidden text-[12px] leading-5 text-[#999] md:block">
                    帖子 {u.posts}<br />积分 {u.points}<br />注册 {u.joined}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center justify-between border-b border-[#eee] px-4 py-1.5 text-[12px] text-[#aaa]">
                  <span>发表于 {f.time}{isOp && f.n > 1 && <span className="ml-2 text-orange-600">楼主</span>}</span>
                  <span className="text-[13px] font-semibold text-[#bbb]">{f.n === 1 ? "楼主" : `#${f.n}`}</span>
                </div>
                <p className="min-h-[88px] whitespace-pre-line px-4 py-4 text-[15px] leading-7 text-[#333]">{f.replyTo && <span className="mr-1 text-sky-700">回复 @{f.replyTo}：</span>}{f.text}</p>
                <div className="flex justify-end gap-4 px-4 pb-2.5 text-[12px] text-[#999]">
                  <button onClick={() => notify("已点赞")} className="hover:text-orange-600">👍 {f.likes ?? 0}</button>
                  <button onClick={() => setReply(`回复 ${f.n === 1 ? "楼主" : `#${f.n}`} ${f.user}:`)} className="hover:text-orange-600">回复</button>
                  <button onClick={() => notify("已举报，感谢反馈")} className="hover:text-orange-600">举报</button>
                </div>
              </div>
            </article>
          );
        })}

        {/* 快速回复 */}
        {post.commentsDisabled ? (
          <p className="border border-[#e6e6e6] bg-white p-3 text-center text-[13px] text-[#999]">作者已关闭评论区。</p>
        ) : (
        <div className="border border-[#e6e6e6] bg-white p-3">
          <p className="mb-2 text-[13px] font-semibold text-[#333]">快速回复</p>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="说点什么吧…"
            className="w-full resize-none rounded border border-[#ddd] p-2 text-[14px] text-[#333] outline-none placeholder:text-[#bbb] focus:border-orange-400"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => { if (reply.trim()) { notify("回复已提交，审核后显示"); setReply(""); } }}
              className="rounded bg-orange-500 px-5 py-1.5 text-[13px] text-white transition-colors hover:bg-orange-600 active:scale-[0.97]"
            >
              发表回复
            </button>
          </div>
        </div>
        )}
      </div>
      <ForumFooter />
    </div>
  );
}
