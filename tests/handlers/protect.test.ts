import { describe, it, expect, vi, beforeEach } from "vitest";

// Token payload the mocked SDK client reads claims from.
const h = vi.hoisted(() => ({ payload: {} as Record<string, unknown> }));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (_body: unknown, init: { status: number }) => ({
      status: init.status,
    }),
  },
}));

vi.mock("../../src/config/index", () => ({
  config: { isDebugMode: false },
  routes: { login: "login" },
}));

vi.mock("../../src/session/sessionManager", () => ({
  sessionManager: vi.fn().mockResolvedValue({}),
}));

// Mirrors the claim helpers of @kinde-oss/kinde-typescript-sdk.
vi.mock("../../src/session/kindeServerClient", () => ({
  kindeClient: {
    getClaimValue: async (_s: unknown, claim: string) =>
      h.payload[claim] ?? null,
    getPermission: async (_s: unknown, name: string) => ({
      orgCode: h.payload.org_code ?? null,
      isGranted: ((h.payload.permissions as string[]) ?? []).includes(name),
    }),
    getPermissions: async () => ({
      permissions: h.payload.permissions ?? null,
      orgCode: h.payload.org_code ?? null,
    }),
  },
}));

// Real session helpers, so the protect helpers are exercised against the
// actual return shapes of getPermission / getPermissions.
vi.mock("../../src/session/index", async () => {
  const { getPermissionFactory } =
    await import("../../src/session/getPermission");
  const { getPermissionsFactory } =
    await import("../../src/session/getPermissions");
  const { getRolesFactory } = await import("../../src/session/getRoles");
  return {
    getKindeServerSession: () => ({
      isAuthenticated: async () => true,
      getPermission: getPermissionFactory(),
      getPermissions: getPermissionsFactory(),
      getRoles: getRolesFactory(),
    }),
  };
});

import { protectApi, protectPage } from "../../src/handlers/protect";

const callApi = (permissions: string | string[]) =>
  protectApi(async () => "HANDLER", { permissions })({} as Request);

const callPage = async (permissions: string | string[]) => {
  try {
    return await protectPage(() => "PAGE", { permissions })({});
  } catch (error) {
    return (error as Error).message.startsWith("REDIRECT")
      ? "REDIRECT"
      : `ERROR ${(error as Error).message}`;
  }
};

const deniedTokens: [string, Record<string, unknown>][] = [
  ["standard token without the permission", { permissions: ["read:x"] }],
  ["token with no permission claims", {}],
  [
    "hasura token without the permission",
    { "x-hasura-permissions": ["read:x"] },
  ],
  ["hasura token with an empty list", { "x-hasura-permissions": [] }],
  [
    "token with both claims, neither granting it",
    { permissions: ["read:x"], "x-hasura-permissions": ["read:x"] },
  ],
];

const grantedTokens: [string, Record<string, unknown>][] = [
  ["standard token with the permission", { permissions: ["admin:all"] }],
  [
    "hasura token with the permission",
    { "x-hasura-permissions": ["admin:all"] },
  ],
];

describe.each([
  ["string", "admin:all"],
  ["array", ["admin:all", "other:thing"]],
] as [string, string | string[]][])(
  "protect helpers with a %s permission requirement",
  (_form, required) => {
    beforeEach(() => {
      process.env.KINDE_SITE_URL = "http://localhost:3000";
      vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it.each(deniedTokens)("denies a %s", async (_name, payload) => {
      h.payload = payload;
      expect(await callApi(required)).toEqual({ status: 403 });
      expect(await callPage(required)).toBe("REDIRECT");
    });

    it.each(grantedTokens)("allows a %s", async (_name, payload) => {
      h.payload = payload;
      expect(await callApi(required)).toBe("HANDLER");
      expect(await callPage(required)).toBe("PAGE");
    });
  },
);
