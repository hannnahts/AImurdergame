import { describe, expect, it } from 'vitest';
import { visibleChat } from './chatHistory';

describe('visibleChat', () => {
  it('after login only the 23:52 reply is visible (enough for p12)', () => {
    const shown = visibleChat(1);
    expect(shown.map((m) => m.text)).toEqual(['已优化。']);
  });

  it('hides the tracking and cover-up messages before p12 is solved', () => {
    const text = visibleChat(1).map((m) => m.text).join('');
    expect(text).not.toContain('位置共享');
    expect(text).not.toContain('浴室那段');
    expect(text).not.toContain('改成设备自己故障');
  });

  it('shows the whole history once p12 is solved', () => {
    expect(visibleChat(2)).toHaveLength(10);
    expect(visibleChat(3)).toHaveLength(10);
  });
});
