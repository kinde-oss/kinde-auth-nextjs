import { describe, it, expect } from "vitest";
import { isKindeSessionCookieName } from "./isKindeSessionCookieName";

describe("isKindeSessionCookieName", () => {
  it("matches exact Kinde cookie names and numeric chunks", () => {
    expect(isKindeSessionCookieName("access_token")).toBe(true);
    expect(isKindeSessionCookieName("access_token1")).toBe(true);
    expect(isKindeSessionCookieName("user")).toBe(true);
    expect(isKindeSessionCookieName("user0")).toBe(true);
    expect(isKindeSessionCookieName("refresh_token")).toBe(true);
  });

  it("does not match host-app cookies that merely share a prefix", () => {
    expect(isKindeSessionCookieName("user_prefs")).toBe(false);
    expect(isKindeSessionCookieName("username")).toBe(false);
    expect(isKindeSessionCookieName("access_token_extra")).toBe(false);
  });
});
