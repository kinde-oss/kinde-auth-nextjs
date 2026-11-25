import { describe, it, expect, vi } from "vitest";

vi.mock("next/server", () => {
  class NextResponse {
    static json() {
      return "UNAUTHORIZED_JSON";
    }
    static redirect() {
      return "REDIRECT_TO_LOGIN";
    }
    static next() {
      return "ALLOWED";
    }
  }
  return { NextResponse };
});

vi.mock("../../src/config/index", () => ({
  config: {
    apiPath: "/api/auth",
    redirectURL: "http://localhost:3000",
    isDebugMode: false,
  },
  routes: { login: "login", register: "register", setup: "setup" },
}));

vi.mock("../../src/utils/getAccessToken", () => ({
  getAccessToken: vi.fn().mockResolvedValue("access"),
}));

vi.mock("../../src/utils/getIdToken", () => ({
  getIdToken: vi.fn().mockResolvedValue("id"),
}));

vi.mock("../../src/session/kindeServerClient", () => ({
  kindeClient: { refreshTokens: vi.fn() },
}));

vi.mock("../../src/session/sessionManager", () => ({
  sessionManager: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../src/utils/jwt/validation", () => ({
  isTokenExpired: vi.fn().mockReturnValue(false),
}));

vi.mock("@kinde/jwt-decoder", () => ({
  jwtDecoder: vi.fn().mockReturnValue({ sub: "user_1", permissions: [] }),
}));

import { withAuth } from "../../src/authMiddleware/authMiddleware";

const makeRequest = () => {
  const url = "http://localhost:3000/admin";
  const req = new Request(url);
  (req as any).nextUrl = new URL(url);
  return req;
};

const run = (isAuthorized: (args: unknown) => unknown, middleware?: unknown) =>
  middleware
    ? (withAuth(middleware, { isAuthorized }) as any)(makeRequest())
    : (withAuth({ isAuthorized }) as any)(makeRequest());

describe("withAuth isAuthorized", () => {
  it.each([
    ["sync", () => false],
    ["async", async () => false],
  ])("redirects to login when a %s callback rejects", async (_kind, cb) => {
    expect(await run(cb)).toBe("REDIRECT_TO_LOGIN");
  });

  it.each([
    ["sync", () => true],
    ["async", async () => true],
  ])("allows the request when a %s callback approves", async (_kind, cb) => {
    expect(await run(cb)).toBe("ALLOWED");
  });

  it("does not run the wrapped middleware when an async callback rejects", async () => {
    const middleware = vi.fn();
    expect(await run(async () => false, middleware)).toBe("REDIRECT_TO_LOGIN");
    expect(middleware).not.toHaveBeenCalled();
  });
});
