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

vi.mock("../../src/session/kindeServerClient", () => ({
  kindeClient: { refreshTokens: vi.fn() },
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
import { kindeClient } from "../../src/session/kindeServerClient";

const mockGetAccessToken = vi.mocked(getAccessToken);
const mockGetIdToken = vi.mocked(getIdToken);
const mockIsTokenExpired = vi.mocked(isTokenExpired);
const mockJwtDecoder = vi.mocked(jwtDecoder);
const mockKindeClient = vi.mocked(kindeClient);

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

describe("setup handler — auth failure HTTP status codes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns HTTP 401 for NOT_LOGGED_IN when no tokens present", async () => {
    mockGetAccessToken.mockResolvedValue(null);
    mockGetIdToken.mockResolvedValue(null);

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(routerClient.json).toHaveBeenCalledWith(
      { message: "NOT_LOGGED_IN", env: ENV },
      { status: 401 },
    );
  });

  it("returns HTTP 401 for REFRESH_FAILED when token refresh throws", async () => {
    mockGetAccessToken.mockResolvedValue("access_token");
    mockGetIdToken.mockResolvedValue("id_token");
    mockIsTokenExpired.mockReturnValue(true);
    (mockKindeClient.refreshTokens as any).mockRejectedValue(
      new Error("refresh failed"),
    );

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "REFRESH_FAILED" }),
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

  it("returns HTTP 401 for ID_TOKEN_DECODE_FAILED when id token decode throws", async () => {
    mockGetAccessToken.mockResolvedValue("access_token");
    mockGetIdToken.mockResolvedValue("bad_id_token");
    mockIsTokenExpired.mockReturnValue(false);
    mockJwtDecoder
      .mockReturnValueOnce({ permissions: [], org_code: "org_01" })
      .mockImplementationOnce(() => {
        throw new Error("decode error");
      });

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "ID_TOKEN_DECODE_FAILED" }),
      { status: 401 },
    );
  });

  it("returns HTTP 401 for TOKENS_MISSING when jwtDecoder returns null", async () => {
    mockGetAccessToken.mockResolvedValue("access_token");
    mockGetIdToken.mockResolvedValue("id_token");
    mockIsTokenExpired.mockReturnValue(false);
    mockJwtDecoder.mockReturnValue(null);

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "TOKENS_MISSING" }),
      { status: 401 },
    );
  });

  it("returns HTTP 500 for unexpected errors in the outer try/catch", async () => {
    mockGetAccessToken.mockRejectedValue(new Error("unexpected"));

    const routerClient = makeRouterClient();
    await setup(routerClient as any);

    expect(routerClient.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "SETUP_FAILED" }),
      { status: 500 },
    );
  });
});
