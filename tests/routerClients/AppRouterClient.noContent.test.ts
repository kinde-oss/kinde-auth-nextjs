import { describe, it, expect, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("next/server", () => {
  class NextResponse extends Response {
    static json(data: unknown, init?: ResponseInit) {
      return new NextResponse(JSON.stringify(data), {
        ...init,
        headers: {
          "content-type": "application/json",
          ...(init?.headers || {}),
        },
      });
    }
    static redirect(url: string | URL) {
      return new NextResponse(null, {
        status: 307,
        headers: { Location: String(url) },
      });
    }
  }
  return { NextResponse };
});

vi.mock("../../src/config/index", () => ({
  config: {
    clientOptions: {
      authDomain: "https://example.kinde.com",
      clientId: "client_123",
      clientSecret: "secret",
      redirectURL: "http://localhost:3000/api/auth/kinde_callback",
      logoutRedirectURL: "http://localhost:3000",
    },
    grantType: "authorization_code",
    redirectURL: "http://localhost:3000",
    apiPath: "/api/auth",
  },
}));

vi.mock("@kinde-oss/kinde-typescript-sdk", () => ({
  createKindeServerClient: vi.fn(() => ({})),
}));

vi.mock("../../src/session/sessionManager", () => ({
  appRouterSessionManager: vi.fn(),
}));

import AppRouterClient from "../../src/routerClients/AppRouterClient";

describe("AppRouterClient.noContent", () => {
  it("returns a 204 Response with Cache-Control: no-store", () => {
    const req = {
      url: "http://localhost:3000/api/auth/login",
      nextUrl: new URL("http://localhost:3000/api/auth/login"),
    };

    const client = new AppRouterClient(req, {}, {});
    const response = client.noContent();

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(204);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
