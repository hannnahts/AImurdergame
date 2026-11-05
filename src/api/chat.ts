import type { UnlockTier } from '../game/unlockTier';
import { keywordReply } from '../pages/homemind/keywordReply';

export type Turn = { role: 'user' | 'assistant'; content: string };

const ANON_KEY = 'homemind-anon-id';
const MAX_HISTORY = 12;

// 匿名 id:首次生成并存进 localStorage,之后复用;后端据此做每人每日限额。只存在浏览器里。
export function getAnonId(storage?: Pick<Storage, 'getItem' | 'setItem'>): string {
  try {
    const s = storage ?? globalThis.localStorage;
    const existing = s.getItem(ANON_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    s.setItem(ANON_KEY, id);
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2, 12)}`;
  }
}

type AskArgs = {
  message: string;
  history: Turn[];
  tier: UnlockTier;
  fetchImpl?: typeof fetch;
  baseUrl?: string;
  anonId?: string;
  timeoutMs?: number;
};

// 向后端提问。未配置地址、网络错误、非 200、超时、回答为空——一律回退到关键词应答,游戏不能因此坏掉。
export async function askXiaoA(args: AskArgs): Promise<{ answer: string; fallback: boolean }> {
  const fallback = () => ({ answer: keywordReply(args.message), fallback: true });
  const baseUrl = args.baseUrl ?? import.meta.env.VITE_CHAT_API_URL;
  if (!baseUrl) return fallback();

  const doFetch = args.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), args.timeoutMs ?? 8000);
  try {
    const res = await doFetch(`${baseUrl.replace(/\/$/, '')}/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        anon_id: args.anonId ?? getAnonId(),
        tier: args.tier,
        message: args.message,
        history: args.history.slice(-MAX_HISTORY),
      }),
      signal: controller.signal,
    });
    if (!res.ok) return fallback();
    const data: unknown = await res.json();
    const answer = typeof data === 'object' && data !== null ? (data as { answer?: unknown }).answer : undefined;
    if (typeof answer !== 'string' || !answer.trim()) return fallback();
    return { answer, fallback: false };
  } catch {
    return fallback();
  } finally {
    clearTimeout(timer);
  }
}
