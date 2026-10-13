// src/pages/forum/forumTypes.ts
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

export type Comment = { user: string; time: string; text: string; likes?: number };

export type Post = {
  id: string;
  title: string;
  section: PostSection;
  author: string;
  time: string;
  replies: number;
  views: number;
  isPinned?: boolean;
  isEdited?: boolean;
  tags?: string[];
  excerpt: string;
  content: string;
  clueId?: string;
  lastBy?: string;
  lastTime?: string;
  comments?: Comment[];
};
