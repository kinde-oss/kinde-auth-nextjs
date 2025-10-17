import { beforeEach, describe, expect, it } from "vitest";

import {
  jsUtilsMockFns,
  resetServerHelperMocks,
  storageKeys,
} from "./setup-server-helper-mocks";
import { createAppServerHelpers } from "../../src/server/createServerHelpers";
import { getServerUser } from "../../src/server/getServerUser";

beforeEach(() => {
  resetServerHelperMocks();
  jsUtilsMockFns.getDecodedToken.mockImplementation(async (k: string) =>
    k === storageKeys.accessToken
      ? { sub: "user123" }
      : { sub: "user123", email: "e@example.com" }
  );
});

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
