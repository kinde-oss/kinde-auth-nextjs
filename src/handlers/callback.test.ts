import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../config/index", () => ({
  config: {
    postLoginAllowedURLRegex: undefined as string | undefined,
    postLoginRedirectURL: "https://other.example/from-env",
    isDebugMode: false,
    redirectURL: "https://app.example",
    apiPath: "/api/auth",
  },
  routes: { login: "login" },
}));

import { config } from "../config/index";
import { callback } from "./callback";

const makeRouterClient = (postLoginRedirectUrl: string | null, state = "") => {
  const session = new Map<string, string>();
  if (postLoginRedirectUrl) {
    session.set("post_login_redirect_url", postLoginRedirectUrl);
  }
  if (state) {
    session.set("state", state);
  }

  return {
    getSearchParam: vi.fn().mockReturnValue(null),
    getUrl: vi
      .fn()
      .mockReturnValue("https://app.example/api/auth/kinde_callback"),
    redirect: vi.fn(),
    json: vi.fn(),
    clientConfig: { siteUrl: "https://app.example" },
    kindeClient: {
      handleRedirectToApp: vi.fn().mockResolvedValue(undefined),
    },
    sessionManager: {
      getSessionItem: vi.fn(async (key: string) => session.get(key)),
      removeSessionItem: vi.fn(async (key: string) => {
        session.delete(key);
      }),
    },
  };
};

describe("callback post-login redirect", () => {
  beforeEach(() => {
    config.postLoginAllowedURLRegex = undefined;
    config.isDebugMode = false;
    vi.restoreAllMocks();
  });

  it("follows a relative post_login_redirect_url", async () => {
    const routerClient = makeRouterClient("/dashboard");

    await callback(routerClient as any);

    expect(routerClient.redirect).toHaveBeenCalledWith(
      "https://app.example/dashboard",
    );
  });

  it("follows an absolute URL on the site origin", async () => {
    const routerClient = makeRouterClient("https://app.example/welcome");

    await callback(routerClient as any);

    expect(routerClient.redirect).toHaveBeenCalledWith(
      "https://app.example/welcome",
    );
  });

  it("falls back to the site URL for another origin when no allowlist is set", async () => {
    const routerClient = makeRouterClient("https://attacker.example/continue");

    await callback(routerClient as any);

    expect(routerClient.redirect).toHaveBeenCalledWith("https://app.example/");
  });

  it("follows another origin when it matches the allowlist", async () => {
    config.postLoginAllowedURLRegex = "^https://cdn\\.example";
    const routerClient = makeRouterClient("https://cdn.example/continue");

    await callback(routerClient as any);

    expect(routerClient.redirect).toHaveBeenCalledWith(
      "https://cdn.example/continue",
    );
  });

  it("falls back to the site URL for a protocol-relative URL", async () => {
    const routerClient = makeRouterClient("//attacker.example/continue");

    await callback(routerClient as any);

    expect(routerClient.redirect).toHaveBeenCalledWith("https://app.example/");
  });

  it("uses the server-configured URL when the query value was not set", async () => {
    const routerClient = makeRouterClient(null);

    await callback(routerClient as any);

    expect(routerClient.redirect).toHaveBeenCalledWith(
      "https://other.example/from-env",
    );
  });
});
