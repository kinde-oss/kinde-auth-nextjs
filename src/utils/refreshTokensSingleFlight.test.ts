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
    vi.useRealTimers();
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

    await Promise.resolve();
    await Promise.resolve();

    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
    expect(mockRefreshTokens).toHaveBeenCalledWith(session, false);

    resolveRefresh(tokens);

    await expect(first).resolves.toEqual(tokens);
    await expect(second).resolves.toEqual(tokens);
    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
  });

  it("keeps the flight registered until waiters finish committing", async () => {
    let resolveRefresh: (value: unknown) => void = () => undefined;
    let resolveCommitGate: () => void = () => undefined;
    const commitGate = new Promise<void>((resolve) => {
      resolveCommitGate = resolve;
    });

    mockRefreshTokens.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        }) as any,
    );
    mockValidateToken.mockImplementation(async () => {
      await commitGate;
      return { valid: true } as any;
    });

    const tokens = {
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    };

    const first = refreshTokensSingleFlight(session as any, true);
    await Promise.resolve();
    await Promise.resolve();

    resolveRefresh(tokens);
    // Wait until the first waiter has entered commit validation.
    await vi.waitFor(() => {
      expect(mockValidateToken).toHaveBeenCalled();
    });

    // While first waiter is still committing, a new caller with the same key
    // must join rather than start a second network exchange.
    const second = refreshTokensSingleFlight(session as any, false);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);

    resolveCommitGate();
    await expect(first).resolves.toEqual(tokens);
    await expect(second).resolves.toEqual(tokens);
    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
  });

  it("does not serve a cached result once its returned refresh token is exchanged", async () => {
    mockRefreshTokens
      .mockResolvedValueOnce({
        access_token: "access_1",
        id_token: "id_1",
        refresh_token: "refresh_token_rotated",
      } as any)
      .mockResolvedValueOnce({
        access_token: "access_2",
        id_token: "id_2",
        refresh_token: "refresh_token_rotated_2",
      } as any);

    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    await refreshTokensSingleFlight(session as any, false);

    // A later refresh exchanges the rotated token — cache under abc must not
    // hand back the spent rotated token afterwards.
    session.getSessionItem.mockResolvedValue("refresh_token_rotated");
    await refreshTokensSingleFlight(session as any, false);

    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    mockRefreshTokens.mockResolvedValueOnce({
      access_token: "access_3",
      id_token: "id_3",
      refresh_token: "refresh_token_new",
    } as any);
    const result = await refreshTokensSingleFlight(session as any, false);

    expect(result.access_token).toBe("access_3");
    expect(mockRefreshTokens).toHaveBeenCalledTimes(3);
  });

  it("does not join a resolved flight after its returned refresh token is exchanged", async () => {
    const rotated = {
      access_token: "access_1",
      id_token: "id_1",
      refresh_token: "refresh_token_rotated",
    };
    const next = {
      access_token: "access_2",
      id_token: "id_2",
      refresh_token: "refresh_token_rotated_2",
    };
    const afterSpent = {
      access_token: "access_3",
      id_token: "id_3",
      refresh_token: "refresh_token_new",
    };

    let resolveValidationGate: () => void = () => undefined;
    const validationGate = new Promise<void>((resolve) => {
      resolveValidationGate = resolve;
    });
    mockValidateToken.mockImplementation(async () => {
      await validationGate;
      return { valid: true } as any;
    });
    mockRefreshTokens
      .mockResolvedValueOnce(rotated as any)
      .mockResolvedValueOnce(next as any)
      .mockResolvedValueOnce(afterSpent as any);

    // Keep the R0 flight registered while a waiter is still committing.
    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    const slowCommit = refreshTokensSingleFlight(session as any, true);
    await vi.waitFor(() => {
      expect(mockValidateToken).toHaveBeenCalled();
    });

    // Exchange the returned R1 — invalidates cache and the resolved R0 flight.
    const rotatedSession = {
      ...session,
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_rotated"),
    };
    await expect(
      refreshTokensSingleFlight(rotatedSession as any, false),
    ).resolves.toEqual(next);
    expect(mockRefreshTokens).toHaveBeenCalledTimes(2);

    // Late R0 caller must start a new network exchange, not reuse spent R1.
    const late = refreshTokensSingleFlight(session as any, false);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockRefreshTokens).toHaveBeenCalledTimes(3);

    resolveValidationGate();
    await expect(slowCommit).resolves.toEqual(rotated);
    await expect(late).resolves.toEqual(afterSpent);
    // Waiter must not write the spent R1 after a successor exchanged it.
    expect(session.setSessionItem).not.toHaveBeenCalled();
  });

  it("skips commit when the returned refresh token was exchanged during validation", async () => {
    const rotated = {
      access_token: "access_1",
      id_token: "id_1",
      refresh_token: "refresh_token_rotated",
    };
    const next = {
      access_token: "access_2",
      id_token: "id_2",
      refresh_token: "refresh_token_rotated_2",
    };

    let resolveValidationGate: () => void = () => undefined;
    const validationGate = new Promise<void>((resolve) => {
      resolveValidationGate = resolve;
    });
    mockValidateToken.mockImplementation(async () => {
      await validationGate;
      return { valid: true } as any;
    });
    mockRefreshTokens
      .mockResolvedValueOnce(rotated as any)
      .mockResolvedValueOnce(next as any);

    // Waiter's session still holds R0 for the whole commit — the R0 session-key
    // guard would pass; the returned-token (R1) exchange check must skip.
    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    const slowCommit = refreshTokensSingleFlight(session as any, true);
    await vi.waitFor(() => {
      expect(mockValidateToken).toHaveBeenCalled();
    });

    // commitToSession=false still marks R1 exchanged (invalidate on exchange).
    const successorSession = {
      ...session,
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_rotated"),
    };
    await expect(
      refreshTokensSingleFlight(successorSession as any, false),
    ).resolves.toEqual(next);

    resolveValidationGate();
    await expect(slowCommit).resolves.toEqual(rotated);
    expect(session.setSessionItem).not.toHaveBeenCalled();
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

  it("skips commit after validation when session refresh token no longer matches", async () => {
    mockJwtDecoder.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 3600,
      ksp: { persistent: false },
    } as any);
    mockRefreshTokens.mockResolvedValue({
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    } as any);
    session.getSessionItem
      .mockResolvedValueOnce("refresh_token_abc") // initial key
      .mockResolvedValueOnce("refresh_token_abc") // confirm before flight
      .mockResolvedValueOnce("refresh_token_newer"); // post-validation recheck

    await refreshTokensSingleFlight(session as any, true);

    expect(mockValidateToken).toHaveBeenCalled();
    expect(session.setSessionItem).not.toHaveBeenCalled();
    // Skipped commit must not flip cookie persistence policy.
    expect(session.persistent).toBe(true);
  });

  it("skips commit when the refresh token rotates during validation", async () => {
    let resolveValidationGate: () => void = () => undefined;
    const validationGate = new Promise<void>((resolve) => {
      resolveValidationGate = resolve;
    });
    mockValidateToken.mockImplementation(async () => {
      await validationGate;
      return { valid: true } as any;
    });
    mockJwtDecoder.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 3600,
      ksp: { persistent: false },
    } as any);
    mockRefreshTokens.mockResolvedValue({
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    } as any);

    let refreshReads = 0;
    session.getSessionItem.mockImplementation(async () => {
      refreshReads += 1;
      // Reads 1–2: key + confirm. After validation starts, session has rotated.
      return refreshReads <= 2 ? "refresh_token_abc" : "refresh_token_newer";
    });

    const pending = refreshTokensSingleFlight(session as any, true);
    await vi.waitFor(() => {
      expect(mockValidateToken).toHaveBeenCalled();
    });

    resolveValidationGate();
    await expect(pending).resolves.toMatchObject({ access_token: "access" });

    expect(session.setSessionItem).not.toHaveBeenCalled();
    expect(session.persistent).toBe(true);
  });

  it("commits and applies persistent when the flight key still matches after validation", async () => {
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
    expect(session.setSessionItem).toHaveBeenCalledWith(
      "refresh_token",
      "refresh_token_new",
    );
  });

  it("adopts the current refresh token when it changes before flight start", async () => {
    const tokens = {
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_from_newer",
    };
    let resolveRefresh: (value: unknown) => void = () => undefined;
    mockRefreshTokens.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        }) as any,
    );

    // First caller starts a flight under the newer key.
    const newerSession = {
      ...session,
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_newer"),
    };

    const first = refreshTokensSingleFlight(newerSession as any, false);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);

    // Second caller initially reads the old key, then confirms the newer one
    // and must join the in-flight exchange instead of starting another.
    session.getSessionItem
      .mockResolvedValueOnce("refresh_token_old")
      .mockResolvedValueOnce("refresh_token_newer");

    const second = refreshTokensSingleFlight(session as any, false);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
    resolveRefresh(tokens);
    await expect(first).resolves.toEqual(tokens);
    await expect(second).resolves.toEqual(tokens);
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

  it("rejects commit when access or id token fails validation with SDK error", async () => {
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
    ).rejects.toMatchObject({
      errorCode: "INVALID_TOKEN_MEMORY_COMMIT",
      name: "KindeSDKError",
    });
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
    ).rejects.toMatchObject({
      errorCode: "INVALID_TOKEN_MEMORY_COMMIT",
    });
    expect(session.setSessionItem).not.toHaveBeenCalled();
  });

  it("serves a cached success to late arrivals with the old refresh token", async () => {
    mockRefreshTokens.mockResolvedValue({
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    } as any);

    await refreshTokensSingleFlight(session as any, false);
    await refreshTokensSingleFlight(session as any, false);

    // Second call with same key should hit the short TTL cache, not the network.
    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
  });

  it("makes a new exchange after the cached success expires", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const first = {
      access_token: "first_access",
      id_token: "first_id",
      refresh_token: "first_refresh",
      expires_in: "3600",
      token_type: "Bearer",
      scope: "openid",
    };
    const next = { ...first, access_token: "next_access" };
    mockRefreshTokens.mockResolvedValueOnce(first).mockResolvedValueOnce(next);

    await expect(refreshTokensSingleFlight(session, false)).resolves.toEqual(
      first,
    );
    vi.setSystemTime(Date.now() + 4_999);
    await expect(refreshTokensSingleFlight(session, false)).resolves.toEqual(
      first,
    );
    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);

    vi.setSystemTime(Date.now() + 2);
    await expect(refreshTokensSingleFlight(session, false)).resolves.toEqual(
      next,
    );
    expect(mockRefreshTokens).toHaveBeenCalledTimes(2);
  });

  it("does not share refresh results when sessions have no refresh token", async () => {
    session.getSessionItem.mockResolvedValue(null);
    const other = { ...session, getSessionItem: vi.fn().mockResolvedValue("") };
    const first = {
      access_token: "first_access",
      id_token: "first_id",
      refresh_token: "first_refresh",
      expires_in: "3600",
      token_type: "Bearer",
      scope: "openid",
    };
    const second = { ...first, access_token: "other_access" };
    mockRefreshTokens
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);

    await expect(
      Promise.all([
        refreshTokensSingleFlight(session, false),
        refreshTokensSingleFlight(other, false),
      ]),
    ).resolves.toEqual([first, second]);
    expect(mockRefreshTokens).toHaveBeenCalledTimes(2);
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
    const sessionA = {
      ...session,
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_a"),
    };
    const sessionB = {
      ...session,
      getSessionItem: vi.fn().mockResolvedValue("refresh_token_b"),
    };

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
      refreshTokensSingleFlight(sessionA as any, false),
      refreshTokensSingleFlight(sessionB as any, false),
    ]);

    expect(mockRefreshTokens).toHaveBeenCalledTimes(2);
  });

  it("starts a new network call for a different refresh token after a prior flight", async () => {
    session.getSessionItem
      .mockResolvedValueOnce("refresh_token_abc")
      .mockResolvedValueOnce("refresh_token_abc")
      .mockResolvedValueOnce("refresh_token_xyz")
      .mockResolvedValueOnce("refresh_token_xyz");
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

  it("allows a new flight after a failed flight is released", async () => {
    mockRefreshTokens
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce({
        access_token: "access",
        id_token: "id",
        refresh_token: "refresh_token_new",
      } as any);

    await expect(
      refreshTokensSingleFlight(session as any, false),
    ).rejects.toThrow("temporary");

    await expect(
      refreshTokensSingleFlight(session as any, false),
    ).resolves.toMatchObject({ access_token: "access" });
    expect(mockRefreshTokens).toHaveBeenCalledTimes(2);
  });
});
