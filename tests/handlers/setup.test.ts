import { describe, it, expect, vi, beforeEach } from "vitest";

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

vi.mock("../../src/utils/staleRefreshTokenGuard", () => ({
  shouldClearSessionForRefreshError: vi.fn().mockResolvedValue(false),
}));

vi.mock("../../src/utils/isTerminalRefreshError", () => ({
  isStaleRefreshError: vi.fn().mockReturnValue(false),
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
import { shouldClearSessionForRefreshError } from "../../src/utils/staleRefreshTokenGuard";
import { isStaleRefreshError } from "../../src/utils/isTerminalRefreshError";
import { sessionManager } from "../../src/session/sessionManager";

const mockGetAccessToken = vi.mocked(getAccessToken);
const mockGetIdToken = vi.mocked(getIdToken);
const mockIsTokenExpired = vi.mocked(isTokenExpired);
const mockJwtDecoder = vi.mocked(jwtDecoder);
const mockRefreshTokensSingleFlight = vi.mocked(refreshTokensSingleFlight);
const mockShouldClear = vi.mocked(shouldClearSessionForRefreshError);
const mockIsStaleRefreshError = vi.mocked(isStaleRefreshError);
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
  beforeEach(() => {
    vi.clearAllMocks();
    mockShouldClear.mockResolvedValue(false);
    mockIsStaleRefreshError.mockReturnValue(false);
    mockSessionManager.mockResolvedValue({
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_abc"),
      destroySession: vi.fn(),
    } as any);
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

  it("returns HTTP 401 for REFRESH_FAILED when token refresh throws terminal", async () => {
    const destroySession = vi.fn();
    mockSessionManager.mockResolvedValue({
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_abc"),
      destroySession,
    } as any);
    mockGetAccessToken.mockResolvedValue("access_token");
    mockGetIdToken.mockResolvedValue("id_token");
    mockIsTokenExpired.mockReturnValue(true);
    mockShouldClear.mockResolvedValue(true);
    mockRefreshTokensSingleFlight.mockRejectedValue(
      new Error("refresh failed"),
    );

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(destroySession).toHaveBeenCalled();
    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "REFRESH_FAILED" }),
      { status: 401 },
    );
  });

  it("does not destroy session on STALE_REFRESH_TOKEN / non-terminal refresh failure", async () => {
    const destroySession = vi.fn();
    mockSessionManager.mockResolvedValue({
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_abc"),
      destroySession,
    } as any);
    mockGetAccessToken.mockResolvedValue("access_token");
    mockGetIdToken.mockResolvedValue("id_token");
    mockIsTokenExpired.mockReturnValue(true);
    mockShouldClear.mockResolvedValue(false);
    mockIsStaleRefreshError.mockReturnValue(true);
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
