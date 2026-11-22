import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config", () => ({
  config: { cookieDomain: undefined },
}));

import { clearSessionCookiesOnResponse } from "./clearSessionCookiesOnResponse";

describe("clearSessionCookiesOnResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets Max-Age=0 clearing cookies on the response", () => {
    const set = vi.fn();
    const response = { cookies: { set } } as any;
    const req = {
      cookies: {
        getAll: () => [
          { name: "access_token" },
          { name: "refresh_token" },
          { name: "unrelated" },
        ],
      },
    };

    clearSessionCookiesOnResponse(response, req);

    expect(set).toHaveBeenCalledWith(
      "access_token",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
    expect(set).toHaveBeenCalledWith(
      "refresh_token",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
    expect(
      set.mock.calls.some((call) => call[0] === "unrelated"),
    ).toBe(false);
  });

  it("still clears well-known cookie names when request cookies are unavailable", () => {
    const set = vi.fn();
    const response = { cookies: { set } } as any;

    clearSessionCookiesOnResponse(response, {});

    expect(set).toHaveBeenCalledWith(
      "refresh_token",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
    expect(set).toHaveBeenCalledWith(
      "access_token",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
    expect(set).toHaveBeenCalledWith(
      "id_token",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
  });
});
