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
import { getHeaders } from "../../src/utils/getHeaders";
import { isPreFetch } from "../../src/utils/isPreFetch";

const mockGetHeaders = vi.mocked(getHeaders);
const mockIsPreFetch = vi.mocked(isPreFetch);

describe("login handler — prefetch requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns noContent Response instead of null for prefetch requests", async () => {
    const prefetchResponse = new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
    const noContent = vi.fn().mockReturnValue(prefetchResponse);
    const routerClient = {
      req: {},
      noContent,
      searchParams: new URLSearchParams(),
      getSearchParam: vi.fn(),
      sessionManager: { setSessionItem: vi.fn() },
      kindeClient: { login: vi.fn() },
      redirect: vi.fn(),
    };

    mockGetHeaders.mockResolvedValue(new Headers());
    mockIsPreFetch.mockReturnValue(true);

    const result = await login(routerClient as never);

    expect(noContent).toHaveBeenCalledOnce();
    expect(result).toBe(prefetchResponse);
    expect(result).toBeInstanceOf(Response);
    expect(result!.status).toBe(204);
    expect(result!.headers.get("Cache-Control")).toBe("no-store");
    expect(routerClient.kindeClient.login).not.toHaveBeenCalled();
  });
});
