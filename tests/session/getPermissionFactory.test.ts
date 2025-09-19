import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPermissionFactory } from '../../src/session/getPermission.js';

let permissionMock: { permissionKey: string; orgCode: string | null; isGranted: boolean } | null = null;

vi.mock('@kinde/js-utils', () => ({
  getPermission: vi.fn(async (key: string) => {
    if (permissionMock === null) throw new Error('boom');
    return permissionMock;
  })
}));

describe('getPermissionFactory', () => {
  beforeEach(() => {
    permissionMock = { permissionKey: 'perm:view', orgCode: 'org_1', isGranted: true };
  });

  it('returns mapped object with isGranted/orgCode', async () => {
    const fn = getPermissionFactory();
    const res = await fn('perm:view');
    expect(res).toEqual({ isGranted: true, orgCode: 'org_1' });
  });

  it('returns null on underlying error', async () => {
    permissionMock = null; // will trigger throw
    const fn = getPermissionFactory();
    const res = await fn('perm:view');
    expect(res).toBeNull();
  });

  it('returns not granted case', async () => {
    permissionMock = { permissionKey: 'perm:edit', orgCode: 'org_1', isGranted: false };
    const fn = getPermissionFactory();
    const res = await fn('perm:edit');
    expect(res).toEqual({ isGranted: false, orgCode: 'org_1' });
  });
});
