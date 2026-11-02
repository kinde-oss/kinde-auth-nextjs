import { describe, it, expect } from "vitest";
import { isRedirectAllowed } from "./isRedirectAllowed";

describe("isRedirectAllowed", () => {
  it("allows any URL when no regex is configured", () => {
    expect(
      isRedirectAllowed("https://untrusted.example.net/path", undefined),
    ).toBe(true);
  });

  it("allows URLs that match the provided regex", () => {
    expect(
      isRedirectAllowed(
        "https://app.example.com/account",
        "^https://app\\.example\\.com",
      ),
    ).toBe(true);
  });

  it("rejects URLs that do not match the provided regex", () => {
    expect(
      isRedirectAllowed(
        "https://untrusted.example.net/path",
        "^https://app\\.example\\.com",
      ),
    ).toBe(false);
  });

  it("throws the original invalid-pattern error used by callback", () => {
    expect(() => isRedirectAllowed("https://app.example.com", "[")).toThrow(
      "Invalid postLoginAllowedURLRegex pattern:",
    );
  });
});
