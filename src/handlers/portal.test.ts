import { describe, it, expect, vi, beforeEach } from "vitest";

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

const { mockConfig } = vi.hoisted(() => ({
  mockConfig: {
    apiPath: "/api/auth",
    redirectURL: undefined as string | undefined,
    issuerURL: "https://example.kinde.com",
    isDebugMode: false,
    postLoginAllowedURLRegex: undefined as string | undefined,
    portalAllowedReturnUrlRegex: undefined as string | undefined,
  },
}));

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
  config: mockConfig,
  routes: {
    login: "login",
  },
}));

import { generatePortalUrl } from "@kinde-oss/kinde-auth-react/utils";
import { resetUnvalidatedPortalReturnUrlWarning } from "../utils/resolvePortalReturnUrl";
import { portal } from "./portal";

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const makeRouterClient = (
  siteUrl: string,
  accessToken: string | null,
  searchParams: Record<string, string | null> = {},
) => ({
  clientConfig: { siteUrl },
  sessionManager: {
    getSessionItem: vi.fn().mockResolvedValue(accessToken),
  },
  searchParams: {
    get: vi.fn((key: string) => searchParams[key] ?? null),
  },
  redirect: vi.fn(),
  req: {},
});

const generatePortalUrlMock = vi.mocked(generatePortalUrl);

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe("portal handler — unauthenticated redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.redirectURL = undefined;
    mockConfig.postLoginAllowedURLRegex = undefined;
    mockConfig.portalAllowedReturnUrlRegex = undefined;
    resetUnvalidatedPortalReturnUrlWarning();
  });

  it("uses routerClient.clientConfig.siteUrl for the login redirect when there is no access token", async () => {
    const routerClient = makeRouterClient("https://preview.example.com", null);

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

describe("portal handler — returnUrl allowlist", () => {
  const siteUrl = "https://app.example.com";
  const redirectURL = "https://app.example.com";
  const accessToken = "valid.access.token";
  const portalAllowedReturnUrlRegex = "^https://app\\.example\\.com(?:/|$)";

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.redirectURL = redirectURL;
    mockConfig.postLoginAllowedURLRegex = undefined;
    mockConfig.portalAllowedReturnUrlRegex = undefined;
    generatePortalUrlMock.mockResolvedValue({ url: null });
    resetUnvalidatedPortalReturnUrlWarning();
  });

  it("passes config.redirectURL when returnUrl is omitted", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const routerClient = makeRouterClient(siteUrl, accessToken);

    await portal(routerClient as any);

    expect(generatePortalUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: redirectURL }),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("passes query returnUrl through when no portal regex is configured", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const queryReturnUrl = "https://app.example.com/settings";
    const routerClient = makeRouterClient(siteUrl, accessToken, {
      returnUrl: queryReturnUrl,
    });

    await portal(routerClient as any);
    await portal(
      makeRouterClient(siteUrl, accessToken, {
        returnUrl: "https://untrusted.example.net/path",
      }) as any,
    );

    expect(generatePortalUrlMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ returnUrl: queryReturnUrl }),
    );
    expect(generatePortalUrlMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        returnUrl: "https://untrusted.example.net/path",
      }),
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("passes a query returnUrl that matches the portal regex", async () => {
    mockConfig.portalAllowedReturnUrlRegex = portalAllowedReturnUrlRegex;
    const allowedReturnUrl = "https://app.example.com/account";
    const routerClient = makeRouterClient(siteUrl, accessToken, {
      returnUrl: allowedReturnUrl,
    });

    await portal(routerClient as any);

    expect(generatePortalUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: allowedReturnUrl }),
    );
  });

  it("does not pass a rejected returnUrl to generatePortalUrl", async () => {
    mockConfig.portalAllowedReturnUrlRegex = portalAllowedReturnUrlRegex;
    const disallowedReturnUrl = "https://untrusted.example.net/path";
    const routerClient = makeRouterClient(siteUrl, accessToken, {
      returnUrl: disallowedReturnUrl,
    });

    await portal(routerClient as any);

    expect(generatePortalUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: redirectURL }),
    );
    expect(generatePortalUrlMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: disallowedReturnUrl }),
    );
  });
});
