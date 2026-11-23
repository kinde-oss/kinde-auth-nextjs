import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../session/kindeServerClient", () => ({
  kindeClient: { refreshTokens: vi.fn() },
}));

vi.mock("../config", () => ({
  config: { isDebugMode: false },
}));

import { kindeClient } from "../session/kindeServerClient";
import {
  __resetRefreshTokensSingleFlightForTests,
  refreshTokensSingleFlight,
} from "./refreshTokensSingleFlight";

const mockRefreshTokens = vi.mocked(kindeClient.refreshTokens);

describe("refreshTokensSingleFlight", () => {
  const session = {
    getSessionItem: vi.fn(),
    setSessionItem: vi.fn(),
    removeSessionItem: vi.fn(),
    destroySession: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    __resetRefreshTokensSingleFlightForTests();
    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    session.setSessionItem.mockResolvedValue(undefined);
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

  it("does not commit when commitToSession is false", async () => {
    mockRefreshTokens.mockResolvedValue({
      access_token: "access",
      id_token: "id",
      refresh_token: "refresh_token_new",
    } as any);

    await refreshTokensSingleFlight(session as any, false);
    expect(session.setSessionItem).not.toHaveBeenCalled();
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
