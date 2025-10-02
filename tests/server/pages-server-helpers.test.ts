import { describe, it, expect, vi } from 'vitest';

vi.mock('@kinde/js-utils', () => ({
  getDecodedToken: vi.fn(async () => ({ sub: 'userABC' })),
  getRawToken: vi.fn(async () => 'raw'),
  getFlag: vi.fn(async () => 42),
  getClaim: vi.fn(async () => 'val'),
  getCurrentOrganization: vi.fn(async () => null),
  getPermission: vi.fn(async () => null),
  getPermissions: vi.fn(async () => []),
  getRoles: vi.fn(async () => []),
  getUserOrganizations: vi.fn(async () => []),
  isAuthenticated: vi.fn(async () => false),
  getEntitlements: vi.fn(async () => []),
}));

import { createPagesServerHelpers } from '../../src/server/createServerHelpers';

describe('createPagesServerHelpers', () => {
  it('accepts req/res and returns helpers', () => {
    const helpers = createPagesServerHelpers({}, {} as any);
    expect(typeof helpers.getAccessToken).toBe('function');
  });
});
