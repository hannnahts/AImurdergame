import { describe, expect, it } from 'vitest';
import { unlockTier } from './unlockTier';

describe('unlockTier', () => {
  it('is 0 by default', () => {
    expect(unlockTier({ hmUnlocked: false, solved: [] })).toBe(0);
  });

  it('stays 0 when p12 is solved but HomeMind is not unlocked', () => {
    expect(unlockTier({ hmUnlocked: false, solved: ['p12'] })).toBe(0);
  });

  it('is 1 once HomeMind is unlocked', () => {
    expect(unlockTier({ hmUnlocked: true, solved: ['p11'] })).toBe(1);
  });

  it('is 2 when HomeMind is unlocked and p12 is solved', () => {
    expect(unlockTier({ hmUnlocked: true, solved: ['p11', 'p12'] })).toBe(2);
  });

  it('is 3 only when p11, p12, p13 and p14 are all solved', () => {
    expect(unlockTier({ hmUnlocked: true, solved: ['p11', 'p12', 'p13'] })).toBe(2);
    expect(unlockTier({ hmUnlocked: true, solved: ['p11', 'p12', 'p13', 'p14'] })).toBe(3);
  });
});
