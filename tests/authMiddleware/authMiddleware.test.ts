import { describe, it, expect, vi, beforeEach } from "vitest";

// --------------------------------------------------------------------------
// Mocks
// vi.mock is hoisted above imports, so factory functions cannot reference
// variables declared in this file — use vi.fn() directly inside factories.
// --------------------------------------------------------------------------

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn(),
    redirect: vi.fn(),
    next: vi.fn(() => ({
      cookies: { set: vi.fn(), getAll: vi.fn(() => []) },
      headers: new Headers(),
    })),
  },
}));

vi.mock("../../src/config/index", () => ({
  config: {
    apiPath: "/api/auth",
    redirectURL: "http://localhost:3000",
    isDebugMode: false,
  },
  routes: {
    login: "login",
    register: "register",
    setup: "setup",
  },
}));

vi.mock("../../src/utils/getAccessToken", () => ({
  getAccessToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../../src/utils/getIdToken", () => ({
  getIdToken: vi.fn().mockResolvedValue(null),
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
  jwtDecoder: vi.fn().mockReturnValue(null),
}));

vi.mock("../../src/utils/cookies/getSplitSerializedCookies", () => ({
  getSplitCookies: vi.fn().mockReturnValue([]),
}));

vi.mock("../../src/utils/copyCookiesToRequest", () => ({
  copyCookiesToRequest: vi.fn(),
}));

vi.mock("../../src/utils/cookies/getStandardCookieOptions", () => ({
  getStandardCookieOptions: vi.fn().mockReturnValue({}),
}));

vi.mock("../../src/utils/isPublicPathMatch", () => ({
  isPublicPathMatch: vi.fn().mockReturnValue(false),
}));

import { NextResponse } from "next/server";
import { withAuth } from "../../src/authMiddleware/authMiddleware";

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const makeRequest = (method: string, url: string): Request => {
  const req = new Request(url, { method });
  (req as any).nextUrl = new URL(url);
  (req as any).cookies = {
    get: vi.fn().mockReturnValue(null),
    getAll: vi.fn(() => []),
  };
  return req;
};

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("authMiddleware — non-GET/HEAD returns HTTP 401", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleInvitationCodeRedirect", () => {
    it("returns HTTP 401 for POST with invitation_code", async () => {
      const req = makeRequest(
        "POST",
        "http://localhost:3000/dashboard?invitation_code=abc123",
      );
      await withAuth(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 },
      );
    });

    it("returns HTTP 401 for PUT with invitation_code", async () => {
      const req = makeRequest(
        "PUT",
        "http://localhost:3000/dashboard?invitation_code=abc123",
      );
      await withAuth(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 },
      );
    });

    it("redirects GET with invitation_code instead of returning 401", async () => {
      const req = makeRequest(
        "GET",
        "http://localhost:3000/dashboard?invitation_code=abc123",
      );
      await withAuth(req);
      expect(NextResponse.json).not.toHaveBeenCalled();
      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("redirects HEAD with invitation_code instead of returning 401", async () => {
      const req = makeRequest(
        "HEAD",
        "http://localhost:3000/dashboard?invitation_code=abc123",
      );
      await withAuth(req);
      expect(NextResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("loginRedirect", () => {
    it("redirects GET to login when unauthenticated", async () => {
      const req = makeRequest("GET", "http://localhost:3000/dashboard");
      await withAuth(req);
      expect(NextResponse.json).not.toHaveBeenCalled();
      expect(NextResponse.redirect).toHaveBeenCalled();
    });
  });
});
