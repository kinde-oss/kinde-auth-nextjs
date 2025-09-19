import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPermissionsFactory } from '../../src/session/getPermissions.js';

let permissionsMock: { permissions: string[]; orgCode: string | null } = { permissions: [], orgCode: null };
vi.mock('@kinde/js-utils', () => ({
  getPermissions: vi.fn(async () => permissionsMock)
}));

describe('getPermissionsFactory', () => {
  beforeEach(() => {
    permissionsMock = { permissions: [], orgCode: null };
  });

  it('returns empty permissions object when js-utils empty', async () => {
    const fn = getPermissionsFactory();
    const res = await fn();
    expect(res).toEqual({ permissions: [], orgCode: null });
  });

  it('returns permissions when populated', async () => {
    permissionsMock = { permissions: ['a', 'b'], orgCode: 'org_1' };
    const fn = getPermissionsFactory();
    const res = await fn();
    expect(res).toEqual({ permissions: ['a', 'b'], orgCode: 'org_1' });
  });
});
