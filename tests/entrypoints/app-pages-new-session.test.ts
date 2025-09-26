import { describe, it, expect } from 'vitest';

import { createAppRouterSession } from '@kinde-oss/kinde-auth-nextjs/app/server';
import { createPagesRouterSession, getKindeServerSession as legacyPagesSession } from '@kinde-oss/kinde-auth-nextjs/pages/server';
import { getKindeServerSession as legacyRootSession } from '@kinde-oss/kinde-auth-nextjs/server';

// These tests are shallow because we cannot simulate authenticated cookies easily here.
// They ensure the new helpers exist and expose a compatible surface without throwing.

describe('new create*RouterSession helpers', () => {
  it('createAppRouterSession returns object with expected methods', async () => {
    const s = createAppRouterSession();
    expect(s).toBeTypeOf('object');
    for (const key of [
      'getAccessToken','getIdToken','getAccessTokenRaw','getIdTokenRaw','getFlag','getBooleanFlag','getIntegerFlag','getStringFlag','getClaim','getOrganization','getPermission','getPermissions','getRoles','getUserOrganizations','isAuthenticated','getEntitlements','refreshTokens'
    ]) {
      expect((s as any)[key]).toBeTypeOf('function');
    }
  });

  it('createPagesRouterSession returns object with expected methods', async () => {
    const s = createPagesRouterSession();
    expect(s).toBeTypeOf('object');
    expect(typeof (s as any).refreshTokens).toBe('function');
  });

  it('legacy sessions still export getKindeServerSession', () => {
    expect(typeof legacyPagesSession).toBe('function');
    expect(typeof legacyRootSession).toBe('function');
  });
});
