import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFlagFactory } from '../../src/session/getFlag.js';

vi.mock('../../src/session/sessionManager', () => ({
  sessionManager: vi.fn(async () => ({})),
}));

const claimValues: Record<string, any> = {};
vi.mock('../../src/session/kindeServerClient', () => ({
  kindeClient: {
    getClaimValue: vi.fn(async (_session: any, claim: string) => claimValues[claim])
  }
}));

vi.mock('@kinde/js-utils', async () => {
  return {
    // js-utils fast path; replaced per-test
    getFlag: vi.fn(async (code: string) => fastPathValues[code] ?? null)
  };
});

// Local mutable stores
let fastPathValues: Record<string, any> = {};

describe('getFlagFactory', () => {
  beforeEach(() => {
    fastPathValues = {};
    for (const k of Object.keys(claimValues)) delete claimValues[k];
  });

  it('returns enriched object when js-utils fast path hits', async () => {
    fastPathValues.feature_enabled = true;
    const getFlag = getFlagFactory();
    const res = await getFlag('feature_enabled', 'fallback', 'b');
    expect(res.value).toBe(true);
    if ('is_default' in res) {
      expect(res.is_default).toBe(false);
    } else {
      throw new Error('Expected enriched flag object');
    }
  });

  it('falls back to merged legacy flags when js-utils returns null', async () => {
    claimValues['feature_flags'] = { legacy_flag: { t: 'b', v: true } };
    claimValues['x-hasura-feature-flags'] = { another_flag: { t: 's', v: 'yes' } };
    const getFlag = getFlagFactory();
    const res = await getFlag('another_flag', 'fallback', 's');
    expect(res.value).toBe('yes');
    if ('is_default' in res) {
      expect(res.is_default).toBe(false);
    } else {
      throw new Error('Expected enriched flag object');
    }
  });

  it('throws when flag missing and no default provided', async () => {
  const getFlag = getFlagFactory();
  // @ts-expect-error intentionally omitting default to trigger error path
  await expect(getFlag('missing_flag', undefined, 's')).rejects.toThrow(/no default value/);
  });

  it('uses default when flag absent but default provided', async () => {
    const getFlag = getFlagFactory();
    const res = await getFlag('missing_flag', 42, 'i');
    expect(res.value).toBe(42);
    if ('is_default' in res) {
      expect(res.is_default).toBe(true);
    } else {
      throw new Error('Expected enriched flag object');
    }
  });
});
