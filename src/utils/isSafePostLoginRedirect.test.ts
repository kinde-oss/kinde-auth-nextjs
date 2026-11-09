import { describe, expect, it } from "vitest";
import { isSafePostLoginRedirect } from "./isSafePostLoginRedirect";

const siteUrl = "https://app.example";

const check = (
  raw: string,
  extras: Partial<Parameters<typeof isSafePostLoginRedirect>[0]> = {},
) =>
  isSafePostLoginRedirect({
    raw,
    siteUrl,
    allowedURLRegex: undefined,
    isServerConfiguredDefault: false,
    ...extras,
  });

describe("isSafePostLoginRedirect", () => {
  it("allows a relative path", () => {
    expect(check("/dashboard")).toBe(true);
  });

  it("allows an absolute URL on the site origin", () => {
    expect(check("https://app.example/welcome")).toBe(true);
  });

  it("rejects another origin when no allowlist is set", () => {
    expect(check("https://attacker.example/continue")).toBe(false);
  });

  it("allows another origin when it matches the allowlist", () => {
    expect(
      check("https://cdn.example/continue", {
        allowedURLRegex: "^https://cdn\\.example",
      }),
    ).toBe(true);
  });

  it("rejects another origin that does not match the allowlist", () => {
    expect(
      check("https://attacker.example/continue", {
        allowedURLRegex: "^https://cdn\\.example",
      }),
    ).toBe(false);
  });

  it("rejects a protocol-relative URL", () => {
    expect(check("//attacker.example/continue")).toBe(false);
  });

  it("rejects a javascript URL", () => {
    expect(check("javascript:alert(1)")).toBe(false);
  });

  it("trusts the server-configured default even on another origin", () => {
    expect(
      check("https://other.example/from-env", {
        isServerConfiguredDefault: true,
      }),
    ).toBe(true);
  });

  it("throws when the allowlist pattern is invalid", () => {
    expect(() => check("/dashboard", { allowedURLRegex: "(" })).toThrow(
      /Invalid postLoginAllowedURLRegex pattern/,
    );
  });
});
