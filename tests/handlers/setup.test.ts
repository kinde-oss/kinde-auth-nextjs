import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

vi.mock("../../src/utils/getAccessToken", () => ({
  getAccessToken: vi.fn(),
}));

vi.mock("../../src/utils/getIdToken", () => ({
  getIdToken: vi.fn(),
}));

vi.mock("../../src/config/index", () => ({
  config: {
    clientID: "client_123",
    issuerURL: "https://example.kinde.com",
    redirectURL: "http://localhost:3000",
    isDebugMode: false,
  },
}));

vi.mock("../../src/session/sessionManager", () => ({
  sessionManager: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../src/utils/refreshTokensSingleFlight", () => ({
  refreshTokensSingleFlight: vi.fn(),
}));

vi.mock("../../src/utils/jwt/validation", () => ({
  isTokenExpired: vi.fn().mockReturnValue(false),
}));

vi.mock("@kinde/jwt-decoder", () => ({
  jwtDecoder: vi.fn(),
}));

vi.mock("../../src/utils/generateUserObject", () => ({
  generateUserObject: vi.fn().mockReturnValue({ id: "user_01" }),
}));

import { setup } from "../../src/handlers/setup";
import { getAccessToken } from "../../src/utils/getAccessToken";
import { getIdToken } from "../../src/utils/getIdToken";
import { isTokenExpired } from "../../src/utils/jwt/validation";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { refreshTokensSingleFlight } from "../../src/utils/refreshTokensSingleFlight";
import {
  __resetStaleRefreshTokenGuardForTests,
  STALE_TERMINAL_MIN_INTERVAL_MS,
} from "../../src/utils/staleRefreshTokenGuard";
import { sessionManager } from "../../src/session/sessionManager";

const mockGetAccessToken = vi.mocked(getAccessToken);
const mockGetIdToken = vi.mocked(getIdToken);
const mockIsTokenExpired = vi.mocked(isTokenExpired);
const mockJwtDecoder = vi.mocked(jwtDecoder);
const mockRefreshTokensSingleFlight = vi.mocked(refreshTokensSingleFlight);
const mockSessionManager = vi.mocked(sessionManager);

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const ENV = {
  clientId: "client_123",
  issuerUrl: "https://example.kinde.com",
  redirectUrl: "http://localhost:3000",
};

const makeRouterClient = () => {
  const json = vi.fn();
  return { req: {}, res: {}, json };
};

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("setup handler", () => {
  const defaultDestroySession = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    __resetStaleRefreshTokenGuardForTests();
    mockRefreshTokensSingleFlight.mockReset();
    mockSessionManager.mockResolvedValue({
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_abc"),
      destroySession: defaultDestroySession,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns HTTP 401 for NOT_LOGGED_IN when tokens are missing", async () => {
    mockGetAccessToken.mockResolvedValue(null);
    mockGetIdToken.mockResolvedValue(null);

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "NOT_LOGGED_IN", env: ENV }),
      { status: 401 },
    );
  });

  it("returns HTTP 401 for REFRESH_FAILED without re-destroying on plain OAuth Error", async () => {
    const destroySession = vi.fn();
    mockSessionManager.mockResolvedValue({
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_abc"),
      destroySession,
    } as any);
    mockGetAccessToken.mockResolvedValue("access_token");
    mockGetIdToken.mockResolvedValue("id_token");
    mockIsTokenExpired.mockReturnValue(true);
    // SDK already called destroySession before throwing plain Error.
    mockRefreshTokensSingleFlight.mockRejectedValue(
      new Error("refresh failed"),
    );

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(destroySession).not.toHaveBeenCalled();
    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "REFRESH_FAILED" }),
      { status: 401 },
    );
  });

  it("clears the session only after a later request gets stale past the grace window", async () => {
    const destroySession = vi.fn();
    mockSessionManager.mockResolvedValue({
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_abc"),
      destroySession,
    } as any);
    mockGetAccessToken.mockResolvedValue("access_token");
    mockGetIdToken.mockResolvedValue("id_token");
    mockIsTokenExpired.mockReturnValue(true);
    mockRefreshTokensSingleFlight.mockRejectedValue({
      errorCode: "STALE_REFRESH_TOKEN",
      message: "stale",
    });

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(destroySession).not.toHaveBeenCalled();
    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "REFRESH_IN_PROGRESS_OR_STALE" }),
      { status: 401 },
    );
    expect(mockRefreshTokensSingleFlight).toHaveBeenCalledTimes(1);

    // Immediate client retry must stay non-terminal (cookie race / grace).
    const immediateRetry = makeRouterClient();
    await setup(immediateRetry as any);
    expect(destroySession).not.toHaveBeenCalled();
    expect(immediateRetry.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "REFRESH_IN_PROGRESS_OR_STALE" }),
      { status: 401 },
    );

    vi.advanceTimersByTime(STALE_TERMINAL_MIN_INTERVAL_MS + 1);

    const nextRequest = makeRouterClient();
    await setup(nextRequest as any);

    expect(mockRefreshTokensSingleFlight).toHaveBeenCalledTimes(3);
    expect(destroySession).toHaveBeenCalledTimes(1);
    expect(nextRequest.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "REFRESH_FAILED" }),
      { status: 401 },
    );
  });

  it("uses fresh cookies from a concurrent winner without another refresh", async () => {
    mockGetAccessToken
      .mockResolvedValueOnce("expired_access")
      .mockResolvedValueOnce("winner_access");
    mockGetIdToken
      .mockResolvedValueOnce("old_id")
      .mockResolvedValueOnce("winner_id");
    mockIsTokenExpired.mockReturnValueOnce(true).mockReturnValue(false);
    mockRefreshTokensSingleFlight.mockRejectedValue({
      errorCode: "STALE_REFRESH_TOKEN",
    });
    mockJwtDecoder.mockReturnValue({});

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(mockRefreshTokensSingleFlight).toHaveBeenCalledTimes(1);
    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "OK",
        accessTokenEncoded: "winner_access",
        idTokenEncoded: "winner_id",
      }),
    );
    expect(defaultDestroySession).not.toHaveBeenCalled();
  });

  it("uses tokens returned by a successful transport retry", async () => {
    mockGetAccessToken.mockResolvedValue("expired_access");
    mockGetIdToken.mockResolvedValue("old_id");
    mockIsTokenExpired.mockReturnValue(true);
    mockRefreshTokensSingleFlight
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce({
        access_token: "retry_access",
        id_token: "retry_id",
        refresh_token: "retry_refresh",
        expires_in: "3600",
        token_type: "Bearer",
        scope: "openid",
      });
    mockJwtDecoder.mockReturnValue({});

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(mockRefreshTokensSingleFlight).toHaveBeenCalledTimes(2);
    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "OK",
        accessTokenEncoded: "retry_access",
        idTokenEncoded: "retry_id",
      }),
    );
  });

  it("stops after a second transport failure and preserves the session", async () => {
    mockGetAccessToken.mockResolvedValue("expired_access");
    mockGetIdToken.mockResolvedValue("old_id");
    mockIsTokenExpired.mockReturnValue(true);
    mockRefreshTokensSingleFlight
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockRejectedValueOnce(new SyntaxError("invalid refresh response"));

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(mockRefreshTokensSingleFlight).toHaveBeenCalledTimes(2);
    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "REFRESH_FAILED",
        error: "invalid refresh response",
      }),
      { status: 401 },
    );
    expect(defaultDestroySession).not.toHaveBeenCalled();
  });

  it("returns HTTP 401 for ACCESS_TOKEN_DECODE_FAILED when access token decode throws", async () => {
    mockGetAccessToken.mockResolvedValue("bad_access_token");
    mockGetIdToken.mockResolvedValue("id_token");
    mockIsTokenExpired.mockReturnValue(false);
    mockJwtDecoder.mockImplementationOnce(() => {
      throw new Error("decode error");
    });

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "ACCESS_TOKEN_DECODE_FAILED" }),
      { status: 401 },
    );
  });

  it("returns OK payload when tokens are valid", async () => {
    mockGetAccessToken.mockResolvedValue("access_token");
    mockGetIdToken.mockResolvedValue("id_token");
    mockIsTokenExpired.mockReturnValue(false);
    mockJwtDecoder
      .mockReturnValueOnce({
        permissions: ["read"],
        org_code: "org_1",
        org_name: "Org",
        feature_flags: {},
        organization_properties: {},
      } as any)
      .mockReturnValueOnce({
        org_codes: ["org_1"],
        organizations: [{ id: "org_1", name: "Org" }],
      } as any);

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "OK" }),
    );
  });
});
