import { beforeEach, describe, expect, it } from "vitest";

import {
  jsUtilsMockFns,
  resetServerHelperMocks,
} from "./setup-server-helper-mocks";
import { createPagesServerHelpers } from "../../src/server/createServerHelpers";

beforeEach(() => {
  resetServerHelperMocks();
  jsUtilsMockFns.getDecodedToken.mockResolvedValue({ sub: "userABC" });
  jsUtilsMockFns.isAuthenticated.mockResolvedValue(false);
  jsUtilsMockFns.getEntitlements.mockResolvedValue([]);
  jsUtilsMockFns.getFlag.mockResolvedValue(42);
  jsUtilsMockFns.getClaim.mockResolvedValue("val");
  jsUtilsMockFns.getCurrentOrganization.mockResolvedValue(null);
  jsUtilsMockFns.getPermission.mockResolvedValue(null);
  jsUtilsMockFns.getPermissions.mockResolvedValue([]);
  jsUtilsMockFns.getRoles.mockResolvedValue([]);
  jsUtilsMockFns.getUserOrganizations.mockResolvedValue([]);
});

describe("createPagesServerHelpers", () => {
  it("accepts req/res and returns helpers", () => {
    const helpers = createPagesServerHelpers({}, {} as any);
    expect(typeof helpers.getAccessToken).toBe("function");
  });
});
