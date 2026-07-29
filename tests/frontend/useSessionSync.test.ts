import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const fetchKindeState = vi.hoisted(() => vi.fn());
const destroySession = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const setItems = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const setRefreshTimer = vi.hoisted(() => vi.fn());
const clearRefreshTimer = vi.hoisted(() => vi.fn());
const getDecodedToken = vi.hoisted(() => vi.fn());
const sessionHandlerRef = vi.hoisted(() => ({
  current: null as null | ((event: { type: string }) => void | Promise<void>),
}));

vi.mock("../../src/frontend/utils", () => ({
  fetchKindeState,
}));

vi.mock("../../src/frontend/store", () => ({
  clientStorage: {
    destroySession,
    setItems,
  },
}));

vi.mock("../../src/config/index", () => ({
  config: { isDebugMode: false },
}));

vi.mock("@kinde-oss/kinde-auth-react/utils", () => ({
  StorageKeys: {
    accessToken: "accessToken",
    idToken: "idToken",
  },
  setRefreshTimer,
  clearRefreshTimer,
  getDecodedToken,
}));

vi.mock("../../src/frontend/sessionChannel", () => ({
  subscribeSessionEvents: (
    handler: (event: { type: string }) => void | Promise<void>,
  ) => {
    sessionHandlerRef.current = handler;
    return () => {
      sessionHandlerRef.current = null;
    };
  },
}));

import { useSessionSync } from "../../src/frontend/hooks/internal/use-session-sync";

const ENV = {
  clientId: "client_123",
  issuerUrl: "https://example.kinde.com",
  redirectUrl: "http://localhost:3000",
};

const loggedInState = {
  accessToken: { sub: "user_1" },
  accessTokenEncoded: "access.jwt",
  idToken: { sub: "user_1" },
  idTokenRaw: "id.jwt",
  featureFlags: {},
  organization: null,
  permissions: null,
  user: { id: "user_1" },
  userOrganizations: null,
  isAuthenticated: true,
};

describe("useSessionSync — cross-tab and focus sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionHandlerRef.current = null;
    destroySession.mockResolvedValue(undefined);
    setItems.mockResolvedValue(undefined);
    getDecodedToken.mockResolvedValue({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    fetchKindeState.mockResolvedValue({
      success: true,
      kindeState: loggedInState,
      env: ENV,
    });
  });

  it("clears client session when logged_out is received", async () => {
    const { result } = renderHook(() => useSessionSync());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(sessionHandlerRef.current).toBeTypeOf("function");

    await act(async () => {
      await sessionHandlerRef.current?.({ type: "logged_out" });
    });

    expect(clearRefreshTimer).toHaveBeenCalled();
    expect(destroySession).toHaveBeenCalled();
    expect(result.current.getFetchedState().isAuthenticated).toBe(false);
    expect(result.current.getFetchedState().error).toBeNull();
  });

  it("revalidates via setup on visibilitychange to visible", async () => {
    const { result } = renderHook(() => useSessionSync());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCalls = fetchKindeState.mock.calls.length;

    fetchKindeState.mockResolvedValue({
      success: false,
      error: "Not logged in",
      env: ENV,
    });

    await act(async () => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
      // Allow the async visibility handler to settle.
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(fetchKindeState.mock.calls.length).toBeGreaterThan(initialCalls);
      expect(result.current.getFetchedState().isAuthenticated).toBe(false);
    });

    expect(destroySession).toHaveBeenCalled();
  });

  it("updates tokens when focus revalidate succeeds", async () => {
    const { result } = renderHook(() => useSessionSync());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    fetchKindeState.mockResolvedValue({
      success: true,
      kindeState: {
        ...loggedInState,
        accessTokenEncoded: "access.jwt.refreshed",
        idTokenRaw: "id.jwt.refreshed",
      },
      env: ENV,
    });

    await act(async () => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "visible",
      });
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.getFetchedState().accessTokenEncoded).toBe(
        "access.jwt.refreshed",
      );
    });

    expect(setItems).toHaveBeenCalled();
  });
});
