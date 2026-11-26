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

vi.mock("../../src/session/sessionManager", () => ({
  sessionManager: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../src/utils/refreshTokensSingleFlight", () => ({
  refreshTokensSingleFlight: vi.fn(),
}));

vi.mock("../../src/utils/staleRefreshTokenGuard", () => ({
  shouldClearSessionForRefreshError: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../src/utils/clearSessionCookiesOnResponse", () => ({
  clearSessionCookiesOnResponse: vi.fn(),
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
import { getAccessToken } from "../../src/utils/getAccessToken";
import { getIdToken } from "../../src/utils/getIdToken";
import { isTokenExpired } from "../../src/utils/jwt/validation";
import { refreshTokensSingleFlight } from "../../src/utils/refreshTokensSingleFlight";
import { shouldClearSessionForRefreshError } from "../../src/utils/staleRefreshTokenGuard";
import { clearSessionCookiesOnResponse } from "../../src/utils/clearSessionCookiesOnResponse";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { getSplitCookies } from "../../src/utils/cookies/getSplitSerializedCookies";
import { isPublicPathMatch } from "../../src/utils/isPublicPathMatch";
import { sessionManager } from "../../src/session/sessionManager";

const mockGetAccessToken = vi.mocked(getAccessToken);
const mockGetIdToken = vi.mocked(getIdToken);
const mockIsTokenExpired = vi.mocked(isTokenExpired);
const mockRefreshTokensSingleFlight = vi.mocked(refreshTokensSingleFlight);
const mockShouldClearSessionForRefreshError = vi.mocked(
  shouldClearSessionForRefreshError,
);
const mockClearSessionCookiesOnResponse = vi.mocked(
  clearSessionCookiesOnResponse,
);
const mockSessionManager = vi.mocked(sessionManager);
const mockJwtDecoder = vi.mocked(jwtDecoder);
const mockGetSplitCookies = vi.mocked(getSplitCookies);
const mockIsPublicPathMatch = vi.mocked(isPublicPathMatch);

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const makeRequest = (
  method: string,
  url: string,
  headers: Record<string, string> = {},
): Request => {
  const req = new Request(url, { method });
  (req as any).nextUrl = new URL(url);
  (req as any).cookies = {
    get: vi.fn().mockReturnValue(null),
    getAll: vi.fn(() => []),
  };

  // Sec-Fetch-* are forbidden request headers and cannot be set via Request.
  // Override headers.get so middleware can still read the values under test.
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
  const originalGet = req.headers.get.bind(req.headers);
  req.headers.get = (name: string) => {
    const key = name.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(normalized, key)) {
      return normalized[key];
    }
    return originalGet(name);
  };

  return req;
};

const redirectResponse = { cookies: { set: vi.fn(), getAll: vi.fn(() => []) } };
const nextResponse = {
  cookies: { set: vi.fn(), getAll: vi.fn(() => []) },
  headers: new Headers(),
};

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("authMiddleware — non-GET/HEAD returns HTTP 401", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockResolvedValue(null);
    mockGetIdToken.mockResolvedValue(null);
    mockIsTokenExpired.mockReturnValue(false);
    mockIsPublicPathMatch.mockReturnValue(false);
    mockShouldClearSessionForRefreshError.mockResolvedValue(true);
    mockSessionManager.mockResolvedValue({
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_abc"),
    } as any);
    (NextResponse.redirect as any).mockReturnValue(redirectResponse);
    (NextResponse.next as any).mockReturnValue(nextResponse);
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
      expect(NextResponse.redirect).toHaveBeenCalled();
    });
  });

  describe("authRedirect", () => {
    it("returns HTTP 401 for POST when unauthenticated", async () => {
      const req = makeRequest("POST", "http://localhost:3000/dashboard");
      await withAuth(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 },
      );
    });

    it("returns HTTP 401 for DELETE when unauthenticated", async () => {
      const req = makeRequest("DELETE", "http://localhost:3000/dashboard");
      await withAuth(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 },
      );
    });

    it("returns HTTP 401 for PATCH when unauthenticated", async () => {
      const req = makeRequest("PATCH", "http://localhost:3000/dashboard");
      await withAuth(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 },
      );
    });

    it("redirects GET to login when unauthenticated", async () => {
      const req = makeRequest("GET", "http://localhost:3000/dashboard");
      await withAuth(req);
      expect(NextResponse.json).not.toHaveBeenCalled();
      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("returns HTTP 401 for GET fetch with Sec-Fetch-Dest empty", async () => {
      const req = makeRequest("GET", "http://localhost:3000/api/data", {
        "Sec-Fetch-Dest": "empty",
      });
      await withAuth(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 },
      );
    });

    it("returns HTTP 401 for GET fetch with Sec-Fetch-Mode cors", async () => {
      const req = makeRequest("GET", "http://localhost:3000/api/data", {
        "Sec-Fetch-Mode": "cors",
      });
      await withAuth(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 },
      );
    });

    it("returns HTTP 401 for GET when Accept prefers application/json", async () => {
      const req = makeRequest("GET", "http://localhost:3000/api/data", {
        Accept: "application/json",
      });
      await withAuth(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { statusCode: 401, message: "Unauthorized" },
        { status: 401 },
      );
    });

    it("redirects document GET navigation (text/html Accept)", async () => {
      const req = makeRequest("GET", "http://localhost:3000/dashboard", {
        Accept: "text/html,application/xhtml+xml",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
      });
      await withAuth(req);
      expect(NextResponse.json).not.toHaveBeenCalled();
      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("redirects Next.js App Router RSC GET instead of returning 401", async () => {
      const req = makeRequest("GET", "http://localhost:3000/dashboard", {
        RSC: "1",
        "Next-Router-State-Tree": "[]",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
      });
      await withAuth(req);
      expect(NextResponse.json).not.toHaveBeenCalled();
      expect(NextResponse.redirect).toHaveBeenCalled();
    });
  });
});

describe("authMiddleware — refresh single-flight + cookie clear policy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockResolvedValue("expired_access");
    mockGetIdToken.mockResolvedValue("expired_id");
    mockIsTokenExpired.mockReturnValue(true);
    mockIsPublicPathMatch.mockReturnValue(false);
    mockShouldClearSessionForRefreshError.mockResolvedValue(true);
    mockSessionManager.mockResolvedValue({
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_abc"),
    } as any);
    (NextResponse.redirect as any).mockReturnValue(redirectResponse);
    (NextResponse.next as any).mockReturnValue(nextResponse);
    mockGetSplitCookies.mockImplementation((name: string, value: string) => [
      { name, value, options: { maxAge: 1000 } },
    ]);
    mockJwtDecoder.mockImplementation((token: string) => {
      if (token === "new_access" || token === "expired_access") {
        return {
          permissions: [],
          org_code: "org_1",
          ksp: { persistent: true },
        };
      }
      return {
        family_name: "Test",
        given_name: "User",
        email: "u@test.com",
        sub: "kp_1",
        picture: null,
      };
    });
  });

  it("does not clear cookies on non-terminal refresh failure (STALE_REFRESH_TOKEN)", async () => {
    mockShouldClearSessionForRefreshError.mockResolvedValue(false);
    mockRefreshTokensSingleFlight.mockRejectedValue({
      errorCode: "STALE_REFRESH_TOKEN",
      message: "Refresh token is invalid or expired",
    });

    const req = makeRequest("GET", "http://localhost:3000/dashboard");
    await withAuth(req);

    expect(mockRefreshTokensSingleFlight).toHaveBeenCalledWith(
      expect.anything(),
      false,
    );
    expect(mockClearSessionCookiesOnResponse).not.toHaveBeenCalled();
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it("clears cookies on terminal refresh failure", async () => {
    mockShouldClearSessionForRefreshError.mockResolvedValue(true);
    mockRefreshTokensSingleFlight.mockRejectedValue(
      new Error("invalid_client"),
    );

    const req = makeRequest("GET", "http://localhost:3000/dashboard");
    await withAuth(req);

    expect(mockClearSessionCookiesOnResponse).toHaveBeenCalledWith(
      redirectResponse,
      req,
    );
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it("clears cookies on NextResponse.next for terminal failure on public paths", async () => {
    mockIsPublicPathMatch.mockReturnValue(true);
    mockShouldClearSessionForRefreshError.mockResolvedValue(true);
    mockRefreshTokensSingleFlight.mockRejectedValue(
      new Error("invalid_client"),
    );

    const req = makeRequest("GET", "http://localhost:3000/public");
    await withAuth(req);

    expect(mockClearSessionCookiesOnResponse).toHaveBeenCalledWith(
      nextResponse,
      req,
    );
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it("does not clear cookies on non-terminal failure for public paths", async () => {
    mockIsPublicPathMatch.mockReturnValue(true);
    mockShouldClearSessionForRefreshError.mockResolvedValue(false);
    mockRefreshTokensSingleFlight.mockRejectedValue({
      errorCode: "STALE_REFRESH_TOKEN",
    });

    const req = makeRequest("GET", "http://localhost:3000/public");
    await withAuth(req);

    expect(mockClearSessionCookiesOnResponse).not.toHaveBeenCalled();
    expect(nextResponse.cookies.set).not.toHaveBeenCalled();
  });

  it("does not clear cookies on transient transport failures", async () => {
    mockShouldClearSessionForRefreshError.mockResolvedValue(false);
    mockRefreshTokensSingleFlight.mockRejectedValue(
      new TypeError("fetch failed"),
    );

    const req = makeRequest("GET", "http://localhost:3000/dashboard");
    await withAuth(req);

    expect(mockClearSessionCookiesOnResponse).not.toHaveBeenCalled();
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it("returns next response after clearing cookies on public terminal failure", async () => {
    mockIsPublicPathMatch.mockReturnValue(true);
    mockShouldClearSessionForRefreshError.mockResolvedValue(true);
    mockRefreshTokensSingleFlight.mockRejectedValue(
      new Error("invalid_client"),
    );

    const req = makeRequest("GET", "http://localhost:3000/public");
    const result = await withAuth(req);

    expect(mockClearSessionCookiesOnResponse).toHaveBeenCalledWith(
      nextResponse,
      req,
    );
    expect(result).toBe(nextResponse);
    // Must not fall through into the cookie-write path after a failed refresh.
    expect(nextResponse.cookies.set).not.toHaveBeenCalled();
  });

  it("sets refreshed token cookies on success without clearing", async () => {
    mockRefreshTokensSingleFlight.mockResolvedValue({
      access_token: "new_access",
      id_token: "new_id",
      refresh_token: "new_refresh",
    } as any);

    const req = makeRequest("GET", "http://localhost:3000/dashboard");
    await withAuth(req);

    expect(mockClearSessionCookiesOnResponse).not.toHaveBeenCalled();
    expect(nextResponse.cookies.set).toHaveBeenCalledWith(
      "access_token",
      "new_access",
      expect.any(Object),
    );
    expect(nextResponse.cookies.set).toHaveBeenCalledWith(
      "id_token",
      "new_id",
      expect.any(Object),
    );
    expect(nextResponse.cookies.set).toHaveBeenCalledWith(
      "refresh_token",
      "new_refresh",
      expect.any(Object),
    );
  });
});
