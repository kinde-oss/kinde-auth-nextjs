import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/config/index", () => ({
  config: {
    redirectURL: "https://app.example",
    apiPath: "/api/auth",
    postLoginRedirectURL: undefined,
    postLoginAllowedURLRegex: undefined,
    isDebugMode: false,
  },
  routes: {
    login: "login",
  },
}));

import { callback } from "../../src/handlers/callback";

const createRouterClient = (search: string) => {
  const searchParams = new URLSearchParams(search);
  return {
    req: {},
    searchParams,
    getSearchParam: (key: string) => searchParams.get(key),
    sessionManager: {
      getSessionItem: vi.fn(),
      setSessionItem: vi.fn(),
      removeSessionItem: vi.fn(),
    },
    kindeClient: {
      handleRedirectToApp: vi.fn(),
    },
    getUrl: vi.fn(),
    clientConfig: { siteUrl: "https://app.example" },
    json: vi.fn(),
    redirect: vi.fn((url: string) => url),
  };
};

describe("callback — reauth_state allowlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards only allowlisted fields from unsigned reauth_state", async () => {
    const reauthState = btoa(
      JSON.stringify({
        org_code: "org_123",
        client_id: "spoofed_client",
        code_challenge: "attacker",
        response_mode: "fragment",
        prompt: "none",
      }),
    );
    const routerClient = createRouterClient(
      `error=login_link_expired&reauth_state=${encodeURIComponent(reauthState)}`,
    );

    const result = await callback(routerClient as never);

    expect(routerClient.redirect).toHaveBeenCalledOnce();
    const redirected = new URL(String(result));
    expect(redirected.pathname).toBe("/api/auth/login");
    expect(redirected.searchParams.get("org_code")).toBe("org_123");
    expect(redirected.searchParams.get("client_id")).toBeNull();
    expect(redirected.searchParams.get("code_challenge")).toBeNull();
    expect(redirected.searchParams.get("response_mode")).toBeNull();
    expect(redirected.searchParams.get("prompt")).toBeNull();
  });
});
