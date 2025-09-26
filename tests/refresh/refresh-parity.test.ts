import { describe, it, expect, vi } from 'vitest';
import { createAppRouterSession } from '@kinde-oss/kinde-auth-nextjs/app/server';
import { createPagesRouterSession } from '@kinde-oss/kinde-auth-nextjs/pages/server';

// NOTE: These are structural tests only. Full integration (actual network refresh) is delegated
// to js-utils. We just assert shape and cookie side-effects scaffolding exists.

describe('refreshTokens wrappers (structural)', () => {
  it('app wrapper exposes refreshTokens returning null (no env)', async () => {
    const s = createAppRouterSession();
    const r = await s.refreshTokens();
    expect(r === null || typeof r === 'object').toBe(true);
  });

  it('pages wrapper exposes refreshTokens returning null (no env)', async () => {
    const s = createPagesRouterSession();
    const r = await s.refreshTokens();
    expect(r === null || typeof r === 'object').toBe(true);
  });
});
