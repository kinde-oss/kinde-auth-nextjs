import { describe, it, expect, vi, beforeEach } from "vitest";

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

vi.mock("../../src/config/index.js", () => ({
  config: {
    apiPath: "/api/auth",
    isDebugMode: false,
  },
  routes: {
    setup: "setup",
  },
}));

import { fetchKindeState } from "../../src/frontend/utils";

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const ENV = {
  clientId: "client_123",
  issuerUrl: "https://example.kinde.com",
  redirectUrl: "http://localhost:3000",
};

const mockFetch = (body: object, status: number) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as any);
};

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("fetchKindeState — auth failure HTTP status handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns { success: false, error: 'Not logged in' } for HTTP 401 NOT_LOGGED_IN", async () => {
    mockFetch({ message: "NOT_LOGGED_IN", env: ENV }, 401);

    const result = await fetchKindeState();

    expect(result).toMatchObject({ success: false, error: "Not logged in" });
  });

  it("passes env through for NOT_LOGGED_IN", async () => {
    mockFetch({ message: "NOT_LOGGED_IN", env: ENV }, 401);

    const result = await fetchKindeState();

    expect(result).toMatchObject({ success: false, env: ENV });
  });

  it("returns { success: false } with error message for HTTP 401 REFRESH_FAILED", async () => {
    mockFetch(
      { message: "REFRESH_FAILED", error: "Token expired", env: ENV },
      401,
    );

    const result = await fetchKindeState();

    expect(result).toMatchObject({ success: false, error: "Token expired" });
  });

  it("returns { success: false } with error message for HTTP 401 ACCESS_TOKEN_DECODE_FAILED", async () => {
    mockFetch(
      {
        message: "ACCESS_TOKEN_DECODE_FAILED",
        error: "Invalid token",
        env: ENV,
      },
      401,
    );

    const result = await fetchKindeState();

    expect(result).toMatchObject({ success: false, error: "Invalid token" });
  });

  it("returns { success: false } with error message for HTTP 401 ID_TOKEN_DECODE_FAILED", async () => {
    mockFetch(
      { message: "ID_TOKEN_DECODE_FAILED", error: "Invalid token", env: ENV },
      401,
    );

    const result = await fetchKindeState();

    expect(result).toMatchObject({ success: false, error: "Invalid token" });
  });

  it("returns { success: false } with error message for HTTP 401 TOKENS_MISSING", async () => {
    mockFetch(
      { message: "TOKENS_MISSING", error: "No access or id token", env: ENV },
      401,
    );

    const result = await fetchKindeState();

    expect(result).toMatchObject({
      success: false,
      error: "No access or id token",
    });
  });

  it("falls back to message when no error field is present on non-ok response", async () => {
    mockFetch({ message: "UNKNOWN_FAILURE", env: ENV }, 401);

    const result = await fetchKindeState();

    expect(result).toMatchObject({
      success: false,
      error: "UNKNOWN_FAILURE",
    });
  });

  it("returns { success: true } for HTTP 200 OK", async () => {
    mockFetch(
      {
        message: "OK",
        accessToken: {},
        idToken: {},
        user: { id: "user_01" },
        permissions: { permissions: [], orgCode: "org_01" },
        organization: { orgCode: "org_01" },
        featureFlags: {},
        userOrganizations: { orgCodes: [] },
        env: ENV,
      },
      200,
    );

    const result = await fetchKindeState();

    expect(result.success).toBe(true);
  });

  it("returns { success: false } when fetch throws a network error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network error"));

    const result = await fetchKindeState();

    expect(result).toMatchObject({
      success: false,
      error: "Failed to fetch Kinde state",
    });
  });
});
