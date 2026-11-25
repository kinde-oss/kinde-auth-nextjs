import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config", () => ({
  config: { isDebugMode: false },
}));

import {
  __resetStaleRefreshTokenGuardForTests,
  assessStaleRefreshFailure,
  shouldClearSessionForRefreshError,
} from "./staleRefreshTokenGuard";

describe("staleRefreshTokenGuard", () => {
  const session = {
    getSessionItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    __resetStaleRefreshTokenGuardForTests();
  });

  it("detects winner cookies when refresh token changed", async () => {
    session.getSessionItem.mockResolvedValue("refresh_token_new");
    await expect(
      assessStaleRefreshFailure(session as any, "refresh_token_old"),
    ).resolves.toBe("winner_cookies_present");
  });

  it("marks first stale then terminal on repeat for same token", async () => {
    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    await expect(
      assessStaleRefreshFailure(session as any, "refresh_token_abc"),
    ).resolves.toBe("first_stale");
    await expect(
      assessStaleRefreshFailure(session as any, "refresh_token_abc"),
    ).resolves.toBe("repeat_stale_terminal");
  });

  it("shouldClearSessionForRefreshError is false for first stale", async () => {
    session.getSessionItem.mockResolvedValue("refresh_token_abc");
    await expect(
      shouldClearSessionForRefreshError(session as any, {
        errorCode: "STALE_REFRESH_TOKEN",
      }),
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
