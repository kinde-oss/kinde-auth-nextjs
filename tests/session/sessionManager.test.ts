import { ServerResponse, type IncomingMessage } from "node:http";
import { describe, expect, it, vi } from "vitest";
import {
  appRouterSessionManager,
  pageRouterSessionManager,
} from "../../src/session/sessionManager";

vi.mock("../../src/config/index", () => ({
  config: { cookieDomain: "example.com" },
}));

const requestCookies = {
  refresh_token: "refresh",
  access_token1: "chunk",
  user_prefs: "dark",
  access_token_backup: "keep",
  theme: "dark",
};

describe("destroySession", () => {
  it("expires only Kinde cookies in the App Router", async () => {
    const cookieStore = {
      getAll: () => Object.keys(requestCookies).map((name) => ({ name })),
      set: vi.fn(),
    };

    await appRouterSessionManager(cookieStore).destroySession();

    const expire = expect.objectContaining({
      domain: "example.com",
      maxAge: 0,
      path: "/",
    });
    expect(cookieStore.set.mock.calls).toEqual([
      ["refresh_token", "", expire],
      ["access_token1", "", expire],
    ]);
  });

  it.each([
    { existing: "theme=dark; Path=/" },
    { existing: ["theme=dark; Path=/", "locale=en; Path=/"] },
  ])(
    "preserves existing Pages Router Set-Cookie headers ($existing)",
    async ({ existing }) => {
      const req = { method: "GET", cookies: requestCookies };
      const res = new ServerResponse(req as IncomingMessage);
      res.setHeader("Set-Cookie", existing);

      await pageRouterSessionManager(req, res).destroySession();

      const headers = res.getHeader("Set-Cookie") as string[];
      const previous = [existing].flat();
      expect(headers.slice(0, previous.length)).toEqual(previous);
      const cleared = headers.slice(previous.length);
      expect(cleared.map((value) => value.split(";")[0])).toEqual([
        "refresh_token=",
        "access_token1=",
      ]);
      for (const header of cleared) {
        expect(header).toContain("Max-Age=-1");
        expect(header).toContain("Domain=example.com");
        expect(header).toContain("Path=/");
      }
    },
  );
});
