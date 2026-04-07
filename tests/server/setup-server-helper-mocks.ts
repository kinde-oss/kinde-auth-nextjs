import { vi } from "vitest";

export const storageKeys = {
  accessToken: "accessToken",
  idToken: "idToken",
  refreshToken: "refreshToken",
} as const;

export const storageTokenValues = {
  access: "mock_access_token",
  id: "mock_id_token",
  refresh: "mock_refresh_token",
};

// Internal hoisted instances referenced in vi.mock factories below
const _jsUtilsMockFns = vi.hoisted(() => ({
  getDecodedToken: vi.fn(),
  getRawToken: vi.fn(),
  getFlag: vi.fn(),
  getClaim: vi.fn(),
  getCurrentOrganization: vi.fn(),
  getPermission: vi.fn(),
  getPermissions: vi.fn(),
  getRoles: vi.fn(),
  getUserOrganizations: vi.fn(),
  isAuthenticated: vi.fn(),
  getEntitlements: vi.fn(),
}));

const _sessionManagerMock = vi.hoisted(() => vi.fn());

vi.mock("@kinde/js-utils", () => {
  class FakeMemoryStorage {
    private store = new Map<string, unknown>();

    async setSessionItem(key: string, value: unknown) {
      this.store.set(String(key), value);
    }

    async getSessionItem(key: string) {
      return this.store.get(String(key)) ?? null;
    }

    async removeSessionItem(key: string) {
      this.store.delete(String(key));
    }

    async destroySession() {
      this.store.clear();
    }
  }

  return {
    StorageKeys: {
      accessToken: "accessToken",
      idToken: "idToken",
      refreshToken: "refreshToken",
    },
    MemoryStorage: FakeMemoryStorage,
    setActiveStorage: vi.fn(),
    clearActiveStorage: vi.fn(),
    ..._jsUtilsMockFns,
  };
});

vi.mock("../../src/session/sessionManager.js", () => ({
  sessionManager: _sessionManagerMock,
}));

// Public exports — same object references as the hoisted internals above
export const jsUtilsMockFns = _jsUtilsMockFns;
export const sessionManagerMock = _sessionManagerMock;

const defaultSessionManagerImpl = async () => ({
  getSessionItem: async (key: string) => {
    switch (key) {
      case "access_token":
        return storageTokenValues.access;
      case "id_token":
        return storageTokenValues.id;
      case "refresh_token":
        return storageTokenValues.refresh;
      default:
        return null;
    }
  },
});

const setDefaultImplementations = () => {
  _jsUtilsMockFns.getDecodedToken.mockImplementation(async () => ({
    sub: "default",
  }));
  _jsUtilsMockFns.getRawToken.mockImplementation(
    async (k: string) => `${k}_raw`,
  );
  _jsUtilsMockFns.getFlag.mockImplementation(async () => true);
  _jsUtilsMockFns.getClaim.mockImplementation(async () => "abc");
  _jsUtilsMockFns.getCurrentOrganization.mockImplementation(async () => ({
    id: "org1",
  }));
  _jsUtilsMockFns.getPermission.mockImplementation(async () => ({
    code: "perm",
  }));
  _jsUtilsMockFns.getPermissions.mockImplementation(async () => [
    { code: "perm" },
  ]);
  _jsUtilsMockFns.getRoles.mockImplementation(async () => [{ code: "role" }]);
  _jsUtilsMockFns.getUserOrganizations.mockImplementation(async () => [
    { id: "org1" },
  ]);
  _jsUtilsMockFns.isAuthenticated.mockImplementation(async () => true);
  _jsUtilsMockFns.getEntitlements.mockImplementation(async () => [
    { code: "ent" },
  ]);
};

export const resetServerHelperMocks = () => {
  Object.values(_jsUtilsMockFns).forEach((fn) => fn.mockReset());
  setDefaultImplementations();
  _sessionManagerMock.mockReset();
  _sessionManagerMock.mockImplementation(defaultSessionManagerImpl);
};

setDefaultImplementations();
