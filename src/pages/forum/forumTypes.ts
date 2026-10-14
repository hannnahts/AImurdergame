export type SectionKey =
  | "home"
  | "help"
  | "life"
  | "tech"
  | "announce"
  | "other"
  | "mine_posts"
  | "mine_fav"
  | "mine_hidden";

export type ForumSection = {
  key: SectionKey;
  label: string;
  count?: number;
  badge?: "new";
  locked?: boolean;
};

export type PostSection = Exclude<
  SectionKey,
  "home" | "mine_posts" | "mine_fav" | "mine_hidden"
>;

export type Post = {
  id: string;
  title: string;
  section: PostSection;
  mirrors?: SectionKey[]; // 其他板块也展示（我的帖子/收藏等）
  author: string;
  time: string;
  replies: number;
  views: number;
  isPinned?: boolean;
  isEdited?: boolean;
  commentsDisabled?: boolean;
  tags?: string[];
  excerpt?: string;
  content: string;
  clueIds?: string[];
  replyList?: ForumReply[];
};

export type ForumReply = {
  author: string;
  time: string;
  content: string;
  replyTo?: string;
};
