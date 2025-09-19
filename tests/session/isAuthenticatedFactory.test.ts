import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isAuthenticatedFactory } from '../../src/session/isAuthenticated.js';

vi.mock('../../src/utils/getAccessToken', () => ({
  getAccessToken: vi.fn(async () => mockToken)
}));

vi.mock('../../src/utils/redirectOnExpiredToken', () => ({
  redirectOnExpiredToken: vi.fn(() => {})
}));

vi.mock('../../src/session/getUser', () => ({
  getUserFactory: () => async () => mockUser
}));

vi.mock('@kinde/js-utils', () => ({
  isAuthenticated: vi.fn(async () => jsAuth)
}));

let mockToken: any = null;
let mockUser: any = null;
let jsAuth = false;

describe('isAuthenticatedFactory', () => {
  beforeEach(() => {
    mockToken = null;
    mockUser = null;
    jsAuth = false;
  });

  it('returns null when no token present (legacy tri-state)', async () => {
    const fn = isAuthenticatedFactory();
    const res = await fn();
    expect(res).toBeNull();
  });

  it('returns false when token present but js-utils auth false', async () => {
    mockToken = { sub: 'user_1' };
    jsAuth = false;
    const fn = isAuthenticatedFactory();
    const res = await fn();
    expect(res).toBe(false);
  });

  it('returns true when token + js-utils auth true + user present', async () => {
    mockToken = { sub: 'user_1' };
    jsAuth = true;
    mockUser = { id: 'user_1' };
    const fn = isAuthenticatedFactory();
    const res = await fn();
    expect(res).toBe(true);
  });

  it('returns false when token + js-utils auth true but user missing', async () => {
    mockToken = { sub: 'user_1' };
    jsAuth = true;
    mockUser = null;
    const fn = isAuthenticatedFactory();
    const res = await fn();
    expect(res).toBe(false);
  });
});
