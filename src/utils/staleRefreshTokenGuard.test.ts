import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../config", () => ({
  config: { isDebugMode: false },
}));

import {
  __resetStaleRefreshTokenGuardForTests,
  assessStaleRefreshFailure,
  shouldClearSessionForRefreshError,
  STALE_TERMINAL_MIN_INTERVAL_MS,
  tagRefreshErrorWithFlightId,
} from "./staleRefreshTokenGuard";

describe("staleRefreshTokenGuard", () => {
  const session = {
    getSessionItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    __resetStaleRefreshTokenGuardForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("forgets an earlier stale failure after the retry window expires", async () => {
    const token = "refresh_token_abc";
    session.getSessionItem.mockResolvedValue(token);
    const stale = { errorCode: "STALE_REFRESH_TOKEN" };

    await expect(
      shouldClearSessionForRefreshError(session as any, stale, token),
    ).resolves.toBe(false);

    // Memory TTL is 60s — after prune, the next stale is first-chance again.
    vi.advanceTimersByTime(60_001);
    await expect(
      shouldClearSessionForRefreshError(session as any, stale, token),
    ).resolves.toBe(false);

    // Terminal only after the grace interval on a later distinct failure.
    vi.advanceTimersByTime(STALE_TERMINAL_MIN_INTERVAL_MS + 1);
    await expect(
      shouldClearSessionForRefreshError(session as any, stale, token),
    ).resolves.toBe(true);
  });

  it("detects winner cookies when refresh token changed", async () => {
    session.getSessionItem.mockResolvedValue("refresh_token_new");
    await expect(
      assessStaleRefreshFailure(session as any, "refresh_token_old"),
    ).resolves.toBe("winner_cookies_present");
  });

  it("keeps repeat stale within grace window non-terminal", async () => {
    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    await expect(
      assessStaleRefreshFailure(session as any, "refresh_token_abc"),
    ).resolves.toBe("first_stale");

    vi.advanceTimersByTime(STALE_TERMINAL_MIN_INTERVAL_MS - 100);

    await expect(
      assessStaleRefreshFailure(session as any, "refresh_token_abc"),
    ).resolves.toBe("first_stale");
  });

  it("marks repeat stale terminal after the grace window", async () => {
    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    await expect(
      assessStaleRefreshFailure(session as any, "refresh_token_abc"),
    ).resolves.toBe("first_stale");

    vi.advanceTimersByTime(STALE_TERMINAL_MIN_INTERVAL_MS + 1);

    await expect(
      assessStaleRefreshFailure(session as any, "refresh_token_abc"),
    ).resolves.toBe("repeat_stale_terminal");
  });

  it("shares one assessment across waiters of the same failed flight", async () => {
    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    const flightId = "flight-1";

    await expect(
      assessStaleRefreshFailure(session as any, "refresh_token_abc", flightId),
    ).resolves.toBe("first_stale");

    // Even after grace window, same flight id must not promote to terminal.
    vi.advanceTimersByTime(STALE_TERMINAL_MIN_INTERVAL_MS + 1);

    await expect(
      assessStaleRefreshFailure(session as any, "refresh_token_abc", flightId),
    ).resolves.toBe("first_stale");
  });

  it("shouldClearSessionForRefreshError uses tagged flight id", async () => {
    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    const error = tagRefreshErrorWithFlightId(
      { errorCode: "STALE_REFRESH_TOKEN" },
      "flight-shared",
    );

    await expect(
      shouldClearSessionForRefreshError(session as any, error),
    ).resolves.toBe(false);

    vi.advanceTimersByTime(STALE_TERMINAL_MIN_INTERVAL_MS + 1);

    await expect(
      shouldClearSessionForRefreshError(session as any, error),
    ).resolves.toBe(false);
  });

  it("shouldClearSessionForRefreshError is true for plain OAuth Error", async () => {
    await expect(
      shouldClearSessionForRefreshError(
        session as any,
        new Error("invalid_client"),
      ),
    ).resolves.toBe(true);
  });

  it("shouldClearSessionForRefreshError is false for TypeError", async () => {
    await expect(
      shouldClearSessionForRefreshError(
        session as any,
        new TypeError("fetch failed"),
      ),
    ).resolves.toBe(false);
  });
});
