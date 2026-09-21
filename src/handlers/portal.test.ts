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
    portalAllowedURLRegex: undefined as string | undefined,
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
import { MAX_ALLOWED_REDIRECT_URL_LENGTH } from "../utils/isRedirectAllowed";
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
    mockConfig.portalAllowedURLRegex = undefined;
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
  const portalAllowedURLRegex = "^https://app\\.example\\.com(?:/|$)";

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.redirectURL = redirectURL;
    mockConfig.postLoginAllowedURLRegex = undefined;
    mockConfig.portalAllowedURLRegex = undefined;
    generatePortalUrlMock.mockResolvedValue({ url: null });
  });

  it("passes config.redirectURL when returnUrl is omitted", async () => {
    const routerClient = makeRouterClient(siteUrl, accessToken);

    await portal(routerClient as any);

    expect(generatePortalUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: redirectURL }),
    );
  });

  it("passes config.redirectURL when no portal regex is configured", async () => {
    const queryReturnUrl = "https://app.example.com/settings";
    const routerClient = makeRouterClient(siteUrl, accessToken, {
      returnUrl: queryReturnUrl,
    });

    await portal(routerClient as any);

    expect(generatePortalUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: redirectURL }),
    );
    expect(generatePortalUrlMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: queryReturnUrl }),
    );
  });

  it("does not use postLoginAllowedURLRegex for portal returnUrl", async () => {
    mockConfig.postLoginAllowedURLRegex = "^https://app\\.example\\.com(?:/|$)";
    const queryReturnUrl = "https://app.example.com/path";
    const routerClient = makeRouterClient(siteUrl, accessToken, {
      returnUrl: queryReturnUrl,
    });

    await portal(routerClient as any);

    expect(generatePortalUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: redirectURL }),
    );
    expect(generatePortalUrlMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: queryReturnUrl }),
    );
  });

  it("passes a query returnUrl that matches the portal regex", async () => {
    mockConfig.portalAllowedURLRegex = portalAllowedURLRegex;
    const allowedReturnUrl = "https://app.example.com/account";
    const routerClient = makeRouterClient(siteUrl, accessToken, {
      returnUrl: allowedReturnUrl,
    });

    await portal(routerClient as any);

    expect(generatePortalUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: allowedReturnUrl }),
    );
  });

  it("passes config.redirectURL when query returnUrl fails the portal regex", async () => {
    mockConfig.portalAllowedURLRegex = portalAllowedURLRegex;
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

  it("passes config.redirectURL when query returnUrl looks similar to an allowed host", async () => {
    mockConfig.portalAllowedURLRegex = portalAllowedURLRegex;
    const lookalikeReturnUrl =
      "https://app.example.com.untrusted.example.net/account";
    const routerClient = makeRouterClient(siteUrl, accessToken, {
      returnUrl: lookalikeReturnUrl,
    });

    await portal(routerClient as any);

    expect(generatePortalUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: redirectURL }),
    );
    expect(generatePortalUrlMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: lookalikeReturnUrl }),
    );
  });

  it("passes config.redirectURL when query returnUrl exceeds the length bound", async () => {
    mockConfig.portalAllowedURLRegex = portalAllowedURLRegex;
    const overlongReturnUrl = `https://app.example.com/${"a".repeat(MAX_ALLOWED_REDIRECT_URL_LENGTH)}`;
    const routerClient = makeRouterClient(siteUrl, accessToken, {
      returnUrl: overlongReturnUrl,
    });

    await portal(routerClient as any);

    expect(generatePortalUrlMock).toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: redirectURL }),
    );
    expect(generatePortalUrlMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ returnUrl: overlongReturnUrl }),
    );
  });
});
