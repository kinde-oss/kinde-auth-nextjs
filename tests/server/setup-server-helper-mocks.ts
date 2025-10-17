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

export const jsUtilsMockFns = {
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
};

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

export const sessionManagerMock = vi.fn(defaultSessionManagerImpl);

const setDefaultImplementations = () => {
  jsUtilsMockFns.getDecodedToken.mockImplementation(async () => ({
    sub: "default",
  }));
  jsUtilsMockFns.getRawToken.mockImplementation(
    async (k: string) => `${k}_raw`,
  );
  jsUtilsMockFns.getFlag.mockImplementation(async () => true);
  jsUtilsMockFns.getClaim.mockImplementation(async () => "abc");
  jsUtilsMockFns.getCurrentOrganization.mockImplementation(async () => ({
    id: "org1",
  }));
  jsUtilsMockFns.getPermission.mockImplementation(async () => ({
    code: "perm",
  }));
  jsUtilsMockFns.getPermissions.mockImplementation(async () => [
    { code: "perm" },
  ]);
  jsUtilsMockFns.getRoles.mockImplementation(async () => [{ code: "role" }]);
  jsUtilsMockFns.getUserOrganizations.mockImplementation(async () => [
    { id: "org1" },
  ]);
  jsUtilsMockFns.isAuthenticated.mockImplementation(async () => true);
  jsUtilsMockFns.getEntitlements.mockImplementation(async () => [
    { code: "ent" },
  ]);
};

export const resetServerHelperMocks = () => {
  Object.values(jsUtilsMockFns).forEach((fn) => fn.mockReset());
  setDefaultImplementations();
  sessionManagerMock.mockReset();
  sessionManagerMock.mockImplementation(defaultSessionManagerImpl);
};

setDefaultImplementations();

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
    StorageKeys: storageKeys,
    MemoryStorage: FakeMemoryStorage,
    setActiveStorage: vi.fn(),
    clearActiveStorage: vi.fn(),
    ...jsUtilsMockFns,
  };
});

vi.mock("../../src/session/sessionManager.js", () => ({
  sessionManager: sessionManagerMock,
}));
