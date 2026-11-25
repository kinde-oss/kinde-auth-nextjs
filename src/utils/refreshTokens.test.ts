import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@kinde/jwt-validator", () => ({
  validateToken: vi.fn(),
}));

vi.mock("../config", () => ({
  config: { issuerURL: "https://example.kinde.com", isDebugMode: false },
}));

vi.mock("./refreshTokensSingleFlight", () => ({
  refreshTokensSingleFlight: vi.fn(),
}));

vi.mock("./staleRefreshTokenGuard", () => ({
  shouldClearSessionForRefreshError: vi.fn(),
}));

import { validateToken } from "@kinde/jwt-validator";
import { refreshTokens } from "./refreshTokens";
import { refreshTokensSingleFlight } from "./refreshTokensSingleFlight";
import { shouldClearSessionForRefreshError } from "./staleRefreshTokenGuard";

const mockValidateToken = vi.mocked(validateToken);
const mockRefreshTokensSingleFlight = vi.mocked(refreshTokensSingleFlight);
const mockShouldClear = vi.mocked(shouldClearSessionForRefreshError);

describe("refreshTokens util", () => {
  const session = {
    getSessionItem: vi.fn(),
    setSessionItem: vi.fn(),
    removeSessionItem: vi.fn(),
    destroySession: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    session.getSessionItem.mockResolvedValue("access_token");
    session.destroySession.mockResolvedValue(undefined);
    mockShouldClear.mockResolvedValue(false);
  });

  it("returns true when refresh succeeds and access token validates", async () => {
    mockRefreshTokensSingleFlight.mockResolvedValue({
      access_token: "access_token",
    } as any);
    mockValidateToken.mockResolvedValue({ valid: true } as any);

    await expect(refreshTokens(session as any)).resolves.toBe(true);
    expect(session.destroySession).not.toHaveBeenCalled();
  });

  it("does not destroy session on non-terminal refresh failure", async () => {
    mockShouldClear.mockResolvedValue(false);
    mockRefreshTokensSingleFlight.mockRejectedValue({
      errorCode: "STALE_REFRESH_TOKEN",
    });

    await expect(refreshTokens(session as any)).resolves.toBe(false);
    expect(session.destroySession).not.toHaveBeenCalled();
  });

  it("destroys session on terminal refresh failure", async () => {
    mockShouldClear.mockResolvedValue(true);
    mockRefreshTokensSingleFlight.mockRejectedValue(
      new Error("invalid_client"),
    );

    await expect(refreshTokens(session as any)).resolves.toBe(false);
    expect(session.destroySession).toHaveBeenCalled();
  });

  it("does not destroy session when post-refresh validateToken throws", async () => {
    mockRefreshTokensSingleFlight.mockResolvedValue({
      access_token: "access_token",
    } as any);
    mockValidateToken.mockRejectedValue(new TypeError("JWKS fetch failed"));

    await expect(refreshTokens(session as any)).resolves.toBe(false);
    expect(session.destroySession).not.toHaveBeenCalled();
  });
});
