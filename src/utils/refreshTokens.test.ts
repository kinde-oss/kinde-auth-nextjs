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

vi.mock("./isNonTerminalRefreshError", () => ({
  isNonTerminalRefreshError: vi.fn(),
}));

import { validateToken } from "@kinde/jwt-validator";
import { refreshTokens } from "./refreshTokens";
import { refreshTokensSingleFlight } from "./refreshTokensSingleFlight";
import { isNonTerminalRefreshError } from "./isNonTerminalRefreshError";

const mockValidateToken = vi.mocked(validateToken);
const mockRefreshTokensSingleFlight = vi.mocked(refreshTokensSingleFlight);
const mockIsNonTerminalRefreshError = vi.mocked(isNonTerminalRefreshError);

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
    mockIsNonTerminalRefreshError.mockReturnValue(true);
    mockRefreshTokensSingleFlight.mockRejectedValue({
      errorCode: "STALE_REFRESH_TOKEN",
    });

    await expect(refreshTokens(session as any)).resolves.toBe(false);
    expect(session.destroySession).not.toHaveBeenCalled();
  });

  it("destroys session on terminal refresh failure", async () => {
    mockIsNonTerminalRefreshError.mockReturnValue(false);
    mockRefreshTokensSingleFlight.mockRejectedValue(new Error("invalid_client"));

    await expect(refreshTokens(session as any)).resolves.toBe(false);
    expect(session.destroySession).toHaveBeenCalled();
  });
});
