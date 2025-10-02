import { describe, it, expect, vi } from 'vitest';
import { StorageKeys } from "@kinde/js-utils";

vi.mock("@kinde/js-utils", () => ({
  StorageKeys: { ...StorageKeys },
  getDecodedToken: vi.fn(async (k: string) =>
    k === StorageKeys.accessToken
      ? { sub: "user123" }
      : { sub: "user123", email: "e@example.com" }
  ),
  getRawToken: vi.fn(async (k: string) => k + "_raw"),
  getFlag: vi.fn(async () => true),
  getClaim: vi.fn(async () => "abc"),
  getCurrentOrganization: vi.fn(async () => ({ id: "org1" })),
  getPermission: vi.fn(async () => ({ code: "perm" })),
  getPermissions: vi.fn(async () => [{ code: "perm" }]),
  getRoles: vi.fn(async () => [{ code: "role" }]),
  getUserOrganizations: vi.fn(async () => [{ id: "org1" }]),
  isAuthenticated: vi.fn(async () => true),
  getEntitlements: vi.fn(async () => [{ code: "ent" }]),
}));

import { createAppServerHelpers } from "../../src/server/createServerHelpers";
import { getServerUser } from "../../src/server/getServerUser";

describe("createAppServerHelpers", () => {
  const helpers = createAppServerHelpers();
  const keys = [
    "getAccessToken",
    "getIdToken",
    "getAccessTokenRaw",
    "getIdTokenRaw",
    "getFlag",
    "getBooleanFlag",
    "getIntegerFlag",
    "getStringFlag",
    "getClaim",
    "getOrganization",
    "getPermission",
    "getPermissions",
    "getRoles",
    "getUserOrganizations",
    "isAuthenticated",
    "getEntitlements",
  ];
  it("exposes expected function keys", () => {
    for (const k of keys) {
      expect((helpers as any)[k]).toBeTypeOf("function");
    }
  });
  it("boolean flag fallback works", async () => {
    const b = await helpers.getBooleanFlag("missing", false);
    expect(typeof b).toBe("boolean");
  });
  it("getServerUser returns shaped user", async () => {
    const u = await getServerUser();
    expect(u?.id).toBe("user123");
  });
  it("getClaim normalizes tokenKey variants", async () => {
    const claim1 = await helpers.getClaim("sub", "accessToken");
    const claim2 = await helpers.getClaim("sub", "idToken");
    expect(claim1?.name).toBe("sub");
    expect(claim2?.name).toBe("sub");
  });
});
