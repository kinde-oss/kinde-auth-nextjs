import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../session/kindeServerClient", () => ({
  kindeClient: { refreshTokens: vi.fn() },
}));

vi.mock("../config", () => ({
  config: { isDebugMode: false, issuerURL: "https://example.kinde.com" },
}));

vi.mock("@kinde/jwt-validator", () => ({
  validateToken: vi.fn(),
}));

vi.mock("@kinde/jwt-decoder", () => ({
  jwtDecoder: vi.fn(),
}));

import { validateToken } from "@kinde/jwt-validator";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { kindeClient } from "../session/kindeServerClient";
import {
  __resetRefreshTokensSingleFlightForTests,
  refreshTokensSingleFlight,
} from "./refreshTokensSingleFlight";

const mockRefreshTokens = vi.mocked(kindeClient.refreshTokens);
const mockValidateToken = vi.mocked(validateToken);
const mockJwtDecoder = vi.mocked(jwtDecoder);

describe("refreshTokensSingleFlight", () => {
  const session = {
    getSessionItem: vi.fn(),
    setSessionItem: vi.fn(),
    removeSessionItem: vi.fn(),
    destroySession: vi.fn(),
    persistent: true as boolean | undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    __resetRefreshTokensSingleFlightForTests();
    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    session.setSessionItem.mockResolvedValue(undefined);
    session.removeSessionItem.mockResolvedValue(undefined);
    session.persistent = true;
    mockValidateToken.mockResolvedValue({ valid: true } as any);
    mockJwtDecoder.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 3600,
      ksp: { persistent: true },
    } as any);
  });

  afterEach(() => {
    __resetRefreshTokensSingleFlightForTests();
  });

  it("coalesces concurrent refreshes for the same refresh token into one call", async () => {
    let resolveRefresh: (value: unknown) => void = () => undefined;
    mockRefreshTokens.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        }) as any,
    );

    const tokens = {
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    };

    const first = refreshTokensSingleFlight(session as any, false);
    const second = refreshTokensSingleFlight(session as any, false);

    // Flush microtasks so both callers finish getSessionItem and join the flight.
    await Promise.resolve();
    await Promise.resolve();

    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
    expect(mockRefreshTokens).toHaveBeenCalledWith(session, false);

    resolveRefresh(tokens);

    await expect(first).resolves.toEqual(tokens);
    await expect(second).resolves.toEqual(tokens);
    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
  });

  it("commits tokens to the caller session when commitToSession is true", async () => {
    mockRefreshTokens.mockResolvedValue({
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    } as any);

    await refreshTokensSingleFlight(session as any, true);

    expect(session.setSessionItem).toHaveBeenCalledWith(
      "access_token",
      "access",
    );
    expect(session.setSessionItem).toHaveBeenCalledWith("id_token", "id");
    expect(session.setSessionItem).toHaveBeenCalledWith(
      "refresh_token",
      "refresh_token_new",
    );
  });

  it("applies ksp.persistent=false before writing tokens", async () => {
    mockJwtDecoder.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 3600,
      ksp: { persistent: false },
    } as any);
    mockRefreshTokens.mockResolvedValue({
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    } as any);

    await refreshTokensSingleFlight(session as any, true);

    expect(session.persistent).toBe(false);
    expect(session.setSessionItem).toHaveBeenCalled();
  });

  it("rejects commit when access or id token fails validation", async () => {
    mockValidateToken.mockResolvedValue({
      valid: false,
      message: "bad signature",
    } as any);
    mockRefreshTokens.mockResolvedValue({
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    } as any);

    await expect(
      refreshTokensSingleFlight(session as any, true),
    ).rejects.toThrow(/bad signature|Invalid/);
    expect(session.setSessionItem).not.toHaveBeenCalled();
  });

  it("rejects commit when access or id token is expired", async () => {
    mockJwtDecoder.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) - 10,
      ksp: { persistent: true },
    } as any);
    mockRefreshTokens.mockResolvedValue({
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    } as any);

    await expect(
      refreshTokensSingleFlight(session as any, true),
    ).rejects.toThrow(/expired/);
    expect(session.setSessionItem).not.toHaveBeenCalled();
  });

  it("does not commit when commitToSession is false", async () => {
    mockRefreshTokens.mockResolvedValue({
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    } as any);

    await refreshTokensSingleFlight(session as any, false);
    expect(session.setSessionItem).not.toHaveBeenCalled();
    expect(mockValidateToken).not.toHaveBeenCalled();
  });

  it("does not share flights across different refresh tokens", async () => {
    session.getSessionItem
      .mockResolvedValueOnce("refresh_token_a")
      .mockResolvedValueOnce("refresh_token_b");

    mockRefreshTokens
      .mockResolvedValueOnce({
        access_token: "a",
        id_token: "a",
        refresh_token: "a_new",
      } as any)
      .mockResolvedValueOnce({
        access_token: "b",
        id_token: "b",
        refresh_token: "b_new",
      } as any);

    await Promise.all([
      refreshTokensSingleFlight(session as any, false),
      refreshTokensSingleFlight(session as any, false),
    ]);

    expect(mockRefreshTokens).toHaveBeenCalledTimes(2);
  });

  it("starts a new network call after a prior flight finishes", async () => {
    mockRefreshTokens.mockResolvedValue({
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    } as any);

    await refreshTokensSingleFlight(session as any, false);
    await refreshTokensSingleFlight(session as any, false);

    expect(mockRefreshTokens).toHaveBeenCalledTimes(2);
  });

  it("propagates refresh failures to all waiters without committing", async () => {
    mockRefreshTokens.mockRejectedValue({
      errorCode: "STALE_REFRESH_TOKEN",
      message: "stale",
    });

    const first = refreshTokensSingleFlight(session as any, true);
    const second = refreshTokensSingleFlight(session as any, true);

    await Promise.resolve();
    await Promise.resolve();

    await expect(first).rejects.toMatchObject({
      errorCode: "STALE_REFRESH_TOKEN",
    });
    await expect(second).rejects.toMatchObject({
      errorCode: "STALE_REFRESH_TOKEN",
    });
    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
    expect(session.setSessionItem).not.toHaveBeenCalled();
  });
});
