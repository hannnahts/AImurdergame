import { describe, expect, it, vi } from 'vitest';
import { askXiaoA, getAnonId } from './chat';
import { keywordReply } from '../pages/homemind/keywordReply';

const BASE = 'https://api.example.test';
const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
const args = { message: '忘记密码', history: [], tier: 0 as const, baseUrl: BASE, anonId: 'anon-test-0001', timeoutMs: 200 };

describe('askXiaoA', () => {
  it('returns the server answer without fallback on success', async () => {
    const fetchImpl = vi.fn(() => json(200, { answer: '可以在面板里调亮度', sources: ['a.md#0'], input_tokens: 1, output_tokens: 1 }));
    const out = await askXiaoA({ ...args, fetchImpl });
    expect(out).toEqual({ answer: '可以在面板里调亮度', fallback: false });
  });

  it('falls back to the keyword reply on network error', async () => {
    const fetchImpl = vi.fn(() => Promise.reject(new TypeError('network down')));
    const out = await askXiaoA({ ...args, fetchImpl });
    expect(out).toEqual({ answer: keywordReply('忘记密码'), fallback: true });
  });

  it.each([429, 503, 500, 422])('falls back on HTTP %i', async (status) => {
    const fetchImpl = vi.fn(() => json(status, { code: 'x' }));
    const out = await askXiaoA({ ...args, fetchImpl });
    expect(out.fallback).toBe(true);
    expect(out.answer).toBe(keywordReply('忘记密码'));
  });

  it('falls back when the request times out', async () => {
    const fetchImpl = vi.fn((_url: unknown, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      }),
    );
    const out = await askXiaoA({ ...args, fetchImpl: fetchImpl as unknown as typeof fetch, timeoutMs: 20 });
    expect(out.fallback).toBe(true);
  });

  it('falls back on a 200 with an empty or malformed answer', async () => {
    expect((await askXiaoA({ ...args, fetchImpl: vi.fn(() => json(200, { answer: '   ' })) })).fallback).toBe(true);
    expect((await askXiaoA({ ...args, fetchImpl: vi.fn(() => json(200, { nope: 1 })) })).fallback).toBe(true);
  });

  it('does not call fetch when no base url is configured', async () => {
    const fetchImpl = vi.fn();
    const out = await askXiaoA({ message: '浴室', history: [], tier: 0, baseUrl: '', fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(out).toEqual({ answer: keywordReply('浴室'), fallback: true });
  });

  it('posts the documented request body', async () => {
    let seen: { url: string; body: Record<string, unknown> } | undefined;
    const fetchImpl = vi.fn((url: unknown, init?: RequestInit) => {
      seen = { url: String(url), body: JSON.parse(String(init?.body)) };
      return json(200, { answer: '好', sources: [], input_tokens: 0, output_tokens: 0 });
    });
    const history = Array.from({ length: 14 }, (_, i) => ({ role: (i % 2 ? 'assistant' : 'user') as 'user' | 'assistant', content: `第${i}轮` }));
    await askXiaoA({ ...args, tier: 2, history, fetchImpl });
    expect(seen?.url).toBe(`${BASE}/chat`);
    expect(seen?.body).toMatchObject({ anon_id: 'anon-test-0001', tier: 2, message: '忘记密码' });
    expect((seen?.body.history as unknown[]).length).toBe(12);
    expect((seen?.body.history as { content: string }[]).at(-1)?.content).toBe('第13轮');
  });
});

describe('getAnonId', () => {
  const memory = () => {
    const store = new Map<string, string>();
    return { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
  };

  it('generates an id of at least 8 chars once and then reuses it', () => {
    const storage = memory();
    const first = getAnonId(storage);
    expect(first.length).toBeGreaterThanOrEqual(8);
    expect(getAnonId(storage)).toBe(first);
  });
});
