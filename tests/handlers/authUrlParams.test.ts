import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/utils/getHeaders", () => ({
  getHeaders: vi.fn(),
}));

vi.mock("../../src/utils/isPreFetch", () => ({
  isPreFetch: vi.fn(),
}));

vi.mock("../../src/config/index", () => ({
  config: {
    postLoginRedirectURL: undefined,
  },
}));

import { login } from "../../src/handlers/login";
import { register } from "../../src/handlers/register";
import { getHeaders } from "../../src/utils/getHeaders";
import { isPreFetch } from "../../src/utils/isPreFetch";

const mockGetHeaders = vi.mocked(getHeaders);
const mockIsPreFetch = vi.mocked(isPreFetch);

const createRouterClient = (search: string) => {
  const searchParams = new URLSearchParams(search);
  return {
    req: {},
    noContent: vi.fn(),
    searchParams,
    getSearchParam: (key: string) => searchParams.get(key),
    sessionManager: { setSessionItem: vi.fn() },
    kindeClient: {
      login: vi
        .fn()
        .mockResolvedValue(new URL("https://example.kinde.com/oauth2/auth")),
      register: vi
        .fn()
        .mockResolvedValue(new URL("https://example.kinde.com/oauth2/auth")),
    },
    redirect: vi.fn((url: string) => url),
  };
};

describe("login and register — auth URL param allowlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetHeaders.mockResolvedValue(new Headers());
    mockIsPreFetch.mockReturnValue(false);
  });

  it("forwards allowlisted params and drops protocol params on login", async () => {
    const routerClient = createRouterClient(
      "org_code=org_123&login_hint=user@example.com&code_challenge=attacker&code_challenge_method=plain&response_mode=fragment&prompt=none",
    );

    await login(routerClient as never);

    expect(routerClient.kindeClient.login).toHaveBeenCalledWith(
      routerClient.sessionManager,
      {
        authUrlParams: {
          org_code: "org_123",
          login_hint: "user@example.com",
          supports_reauth: "true",
        },
      },
    );
  });

  it("forwards allowlisted params and drops protocol params on register", async () => {
    const routerClient = createRouterClient(
      "org_code=org_123&code_challenge=attacker&response_mode=fragment",
    );

    await register(routerClient as never);

    expect(routerClient.kindeClient.register).toHaveBeenCalledWith(
      routerClient.sessionManager,
      {
        authUrlParams: {
          org_code: "org_123",
          supports_reauth: "true",
        },
      },
    );
  });
});
