import type { NextApiRequest, NextApiResponse } from "next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getKindeServerSession } from "../../src/session";
import { refreshTokensServerAction } from "../../src/session/refreshTokensServerAction";
import { sessionManager } from "../../src/session/sessionManager";
import { refreshTokensSingleFlight } from "../../src/utils/refreshTokensSingleFlight";
import {
  __resetStaleRefreshTokenGuardForTests,
  STALE_TERMINAL_MIN_INTERVAL_MS,
} from "../../src/utils/staleRefreshTokenGuard";

vi.mock("../../src/config/index", () => ({
  config: { isDebugMode: false },
}));

vi.mock("../../src/session/kindeServerClient", () => ({
  kindeClient: {},
}));

vi.mock("../../src/session/sessionManager", () => ({
  sessionManager: vi.fn(),
}));

vi.mock("../../src/utils/refreshTokensSingleFlight", () => ({
  refreshTokensSingleFlight: vi.fn(),
}));

const tokens = {
  access_token: "new_access",
  id_token: "new_id",
  refresh_token: "new_refresh",
  expires_in: "3600",
  token_type: "Bearer",
  scope: "openid",
};

const session = {
  getSessionItem: vi.fn().mockResolvedValue("current_refresh"),
  setSessionItem: vi.fn(),
  removeSessionItem: vi.fn(),
  destroySession: vi.fn(),
};

describe("session refresh entry points", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    __resetStaleRefreshTokenGuardForTests();
    vi.mocked(sessionManager).mockResolvedValue(session);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns refreshed tokens and enables commit for the Pages Router session", async () => {
    const req = { cookies: {} } as NextApiRequest;
    const res = {} as NextApiResponse;
    vi.mocked(refreshTokensSingleFlight).mockResolvedValueOnce(tokens);

    await expect(
      getKindeServerSession(req, res).refreshTokens(),
    ).resolves.toEqual(tokens);
    expect(sessionManager).toHaveBeenCalledWith(req, res);
    expect(refreshTokensSingleFlight).toHaveBeenCalledWith(session, true);
  });

  it("returns null to Pages Router callers if refresh fails", async () => {
    vi.mocked(refreshTokensSingleFlight).mockRejectedValueOnce(
      new TypeError("fetch failed"),
    );

    await expect(getKindeServerSession().refreshTokens()).resolves.toBeNull();
  });

  it("preserves the App Router session after first stale and clears it after grace", async () => {
    const stale = { errorCode: "STALE_REFRESH_TOKEN" };
    vi.mocked(refreshTokensSingleFlight).mockRejectedValue(stale);

    await expect(refreshTokensServerAction()).rejects.toThrow(
      "Failed to refresh tokens",
    );
    expect(refreshTokensSingleFlight).toHaveBeenCalledWith(session, true);
    expect(session.destroySession).not.toHaveBeenCalled();

    // Immediate retry stays non-terminal (grace window).
    await expect(refreshTokensServerAction()).rejects.toThrow(
      "Failed to refresh tokens",
    );
    expect(session.destroySession).not.toHaveBeenCalled();

    vi.advanceTimersByTime(STALE_TERMINAL_MIN_INTERVAL_MS + 1);

    await expect(refreshTokensServerAction()).rejects.toThrow(
      "Failed to refresh tokens",
    );
    expect(session.destroySession).toHaveBeenCalledTimes(1);
  });
});
