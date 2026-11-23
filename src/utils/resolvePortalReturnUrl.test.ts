import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  resetUnvalidatedPortalReturnUrlWarning,
  resolvePortalReturnUrl,
} from "./resolvePortalReturnUrl";

const fallbackReturnUrl = "https://app.example.com";
const portalAllowedReturnUrlRegex = "^https://app\\.example\\.com(?:/|$)";

describe("resolvePortalReturnUrl", () => {
  beforeEach(() => {
    resetUnvalidatedPortalReturnUrlWarning();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    resetUnvalidatedPortalReturnUrlWarning();
  });

  it("returns the fallback when returnUrl is omitted and does not warn", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(resolvePortalReturnUrl(null, fallbackReturnUrl, undefined)).toBe(
      fallbackReturnUrl,
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("passes returnUrl through unchanged and warns once when no regex is set", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const requestedReturnUrl = "https://app.example.com/settings";

    expect(
      resolvePortalReturnUrl(requestedReturnUrl, fallbackReturnUrl, undefined),
    ).toBe(requestedReturnUrl);
    expect(
      resolvePortalReturnUrl(
        "https://untrusted.example.net/path",
        fallbackReturnUrl,
        undefined,
      ),
    ).toBe("https://untrusted.example.net/path");

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("KINDE_PORTAL_ALLOWED_RETURN_URL_REGEX"),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "https://docs.kinde.com/developer-tools/sdks/backend/nextjs-sdk/#portal-return-url",
      ),
    );
  });

  it("passes returnUrl through when the portal regex matches", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const requestedReturnUrl = "https://app.example.com/account";

    expect(
      resolvePortalReturnUrl(
        requestedReturnUrl,
        fallbackReturnUrl,
        portalAllowedReturnUrlRegex,
      ),
    ).toBe(requestedReturnUrl);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("falls back when the portal regex does not match", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const requestedReturnUrl = "https://untrusted.example.net/path";

    expect(
      resolvePortalReturnUrl(
        requestedReturnUrl,
        fallbackReturnUrl,
        portalAllowedReturnUrlRegex,
      ),
    ).toBe(fallbackReturnUrl);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
