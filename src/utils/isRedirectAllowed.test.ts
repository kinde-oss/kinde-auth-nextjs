import { describe, it, expect } from "vitest";
import {
  isRedirectAllowed,
  MAX_ALLOWED_REDIRECT_URL_LENGTH,
} from "./isRedirectAllowed";

describe("isRedirectAllowed", () => {
  it("allows any URL when no regex is configured", () => {
    expect(isRedirectAllowed("https://untrusted.example/path")).toBe(true);
    expect(isRedirectAllowed("https://untrusted.example/path", undefined)).toBe(
      true,
    );
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
        "https://untrusted.example/path",
        "^https://app\\.example\\.com",
      ),
    ).toBe(false);
  });

  it("uses the supplied regex name in invalid-pattern errors", () => {
    expect(() =>
      isRedirectAllowed(
        "https://app.example.com",
        "[",
        undefined,
        "postLoginAllowedURLRegex",
      ),
    ).toThrow("Invalid postLoginAllowedURLRegex pattern:");
  });

  it("rejects overlong URLs before testing the regex when a max length is set", () => {
    const overlongUrl = `https://app.example.com/${"a".repeat(MAX_ALLOWED_REDIRECT_URL_LENGTH)}`;
    expect(
      isRedirectAllowed(
        overlongUrl,
        "^https://app\\.example\\.com",
        MAX_ALLOWED_REDIRECT_URL_LENGTH,
      ),
    ).toBe(false);
  });

  it("rejects overlong URLs when no regex is configured and a max length is set", () => {
    const overlongUrl = `https://app.example.com/${"a".repeat(MAX_ALLOWED_REDIRECT_URL_LENGTH)}`;
    expect(
      isRedirectAllowed(
        overlongUrl,
        undefined,
        MAX_ALLOWED_REDIRECT_URL_LENGTH,
      ),
    ).toBe(false);
  });

  it("does not apply a length bound when maxLength is omitted", () => {
    const overlongUrl = `https://app.example.com/${"a".repeat(MAX_ALLOWED_REDIRECT_URL_LENGTH)}`;
    expect(isRedirectAllowed(overlongUrl, "^https://app\\.example\\.com")).toBe(
      true,
    );
  });
});
