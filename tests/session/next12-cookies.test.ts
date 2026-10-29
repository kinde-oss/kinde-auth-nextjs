import { describe, it, expect, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

vi.mock("next/headers", () => {
  throw new Error("Cannot find module 'next/headers'");
});

import { sessionManager } from "../../src/session/sessionManager";
import { CookieStorage } from "../../src/session/sessionManager/cookieManager";

describe("Next 12 cookie loading", () => {
  it("builds a pages-router session without loading next/headers", async () => {
    const req = {
      cookies: { access_token: "token-value" },
    } as unknown as NextApiRequest;
    const res = {
      getHeader: () => [],
      setHeader: () => undefined,
    } as unknown as NextApiResponse;
    const session = await sessionManager(req, res);

    expect(await session.getSessionItem("access_token")).toBe("token-value");
  });

  it("explains when sessionManager needs next/headers and it is missing", async () => {
    await expect(sessionManager()).rejects.toThrow(/prior to 13/);
  });

  it("explains when CookieStorage needs next/headers and it is missing", async () => {
    const storage = new CookieStorage(undefined, undefined);
    await expect(storage.getSessionItem("accessToken")).rejects.toThrow(
      /prior to 13/,
    );
  });
});
