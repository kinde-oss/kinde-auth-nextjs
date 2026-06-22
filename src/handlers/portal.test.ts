import { describe, it, expect, vi, beforeEach } from "vitest";

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

vi.mock("../utils/getHeaders", () => ({
  getHeaders: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("../utils/isPreFetch", () => ({
  isPreFetch: vi.fn().mockReturnValue(false),
}));

vi.mock("@kinde-oss/kinde-auth-react/utils", () => ({
  MemoryStorage: class {
    setSessionItem = vi.fn();
  },
  setActiveStorage: vi.fn(),
  StorageKeys: { accessToken: "access_token" },
  generatePortalUrl: vi.fn().mockResolvedValue({ url: null }),
  PortalPage: {},
}));

vi.mock("../utils/isValidEnumValue", () => ({
  isValidEnumValue: vi.fn().mockReturnValue(false),
}));

vi.mock("../config", () => ({
  config: {
    apiPath: "/api/auth",
    redirectURL: undefined, // KINDE_SITE_URL not set — exercises the siteUrl override path
    issuerURL: "https://example.kinde.com",
    isDebugMode: false,
  },
  routes: {
    login: "login",
  },
}));

import { portal } from "./portal";

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const makeRouterClient = (siteUrl: string, accessToken: string | null) => ({
  clientConfig: { siteUrl },
  sessionManager: {
    getSessionItem: vi.fn().mockResolvedValue(accessToken),
  },
  searchParams: { get: vi.fn().mockReturnValue(null) },
  redirect: vi.fn(),
  req: {},
});

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("portal handler — unauthenticated redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses routerClient.clientConfig.siteUrl for the login redirect when there is no access token", async () => {
    const routerClient = makeRouterClient(
      "https://preview.example.com",
      null,
    );

    await portal(routerClient as any);

    expect(routerClient.redirect).toHaveBeenCalledWith(
      "https://preview.example.com/api/auth/login",
    );
  });

  it("produces an absolute URL (not a relative path) when redirecting to login", async () => {
    const routerClient = makeRouterClient("https://preview.example.com", null);

    await portal(routerClient as any);

    const [redirectUrl] = (routerClient.redirect as ReturnType<typeof vi.fn>)
      .mock.calls[0];
    expect(redirectUrl).toMatch(/^https?:\/\//);
  });

  it("does not redirect to login when access token is present", async () => {
    const routerClient = makeRouterClient(
      "https://preview.example.com",
      "valid.access.token",
    );

    await portal(routerClient as any);

    // redirect may or may not be called for portal URL generation, but never
    // with the login path
    const calls = (routerClient.redirect as ReturnType<typeof vi.fn>).mock
      .calls;
    const loginCalls = calls.filter(([url]: [string]) =>
      url.includes("/login"),
    );
    expect(loginCalls).toHaveLength(0);
  });
});
