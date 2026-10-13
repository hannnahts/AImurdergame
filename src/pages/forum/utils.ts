import { forumSections } from "./forumData";

export function clsx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export function formatSectionName(key: string) {
  return forumSections.find((s) => s.key === key)?.label ?? "未知";
}
