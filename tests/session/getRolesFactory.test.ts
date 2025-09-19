import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRolesFactory } from '../../src/session/getRoles.js';

let rolesMock: any[] | null = [];
vi.mock('@kinde/js-utils', () => ({
  getRoles: vi.fn(async () => rolesMock)
}));

describe('getRolesFactory', () => {
  beforeEach(() => {
    rolesMock = [];
  });

  it('returns null when js-utils returns empty array', async () => {
    const fn = getRolesFactory();
    const res = await fn();
    expect(res).toBeNull();
  });

  it('returns roles when js-utils returns roles', async () => {
    rolesMock = [{ id: 'r1', key: 'admin', name: 'Admin' }];
    const fn = getRolesFactory();
    const res = await fn();
    expect(res).toEqual(rolesMock);
  });
});
