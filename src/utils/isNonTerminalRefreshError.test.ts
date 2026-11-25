import { describe, it, expect } from "vitest";
import { isNonTerminalRefreshError } from "./isNonTerminalRefreshError";

describe("isNonTerminalRefreshError", () => {
  it("returns true for STALE_REFRESH_TOKEN", () => {
    expect(
      isNonTerminalRefreshError({
        name: "KindeSDKError",
        errorCode: "STALE_REFRESH_TOKEN",
        message: "Refresh token is invalid or expired",
      }),
    ).toBe(true);
  });

  it("returns true for transient transport / parse errors", () => {
    expect(isNonTerminalRefreshError(new TypeError("fetch failed"))).toBe(true);
    expect(isNonTerminalRefreshError(new SyntaxError("Unexpected token"))).toBe(
      true,
    );
    expect(
      isNonTerminalRefreshError(
        Object.assign(new Error("aborted"), { name: "DOMException" }),
      ),
    ).toBe(true);
    if (typeof AggregateError !== "undefined") {
      expect(isNonTerminalRefreshError(new AggregateError([], "network"))).toBe(
        true,
      );
    }
  });

  it("returns false for other credential / generic errors", () => {
    expect(isNonTerminalRefreshError(new Error("invalid_client"))).toBe(false);
    expect(
      isNonTerminalRefreshError({
        errorCode: "FAILED_TOKENS_REFRESH_ATTEMPT",
      }),
    ).toBe(false);
    expect(isNonTerminalRefreshError(null)).toBe(false);
    expect(isNonTerminalRefreshError(undefined)).toBe(false);
    expect(isNonTerminalRefreshError("STALE_REFRESH_TOKEN")).toBe(false);
    expect(
      isNonTerminalRefreshError({
        message: "STALE_REFRESH_TOKEN",
      }),
    ).toBe(false);
  });

  it("matches KindeSDKError instances by errorCode", () => {
    const error = Object.assign(new Error("stale"), {
      name: "KindeSDKError",
      errorCode: "STALE_REFRESH_TOKEN",
    });
    expect(isNonTerminalRefreshError(error)).toBe(true);
  });
});
