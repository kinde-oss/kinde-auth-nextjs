import { describe, it, expect } from "vitest";
import {
  isNonTerminalRefreshError,
  isTerminalRefreshError,
  isStaleRefreshError,
  shouldDestroySessionManagerForRefreshError,
} from "./isTerminalRefreshError";
import {
  KindeSDKError,
  KindeSDKErrorCode,
} from "@kinde-oss/kinde-typescript-sdk";

describe("isTerminalRefreshError / isNonTerminalRefreshError", () => {
  it("treats STALE_REFRESH_TOKEN as non-terminal (repeat handled by guard)", () => {
    const stale = {
      name: "KindeSDKError",
      errorCode: "STALE_REFRESH_TOKEN",
      message: "Refresh token is invalid or expired",
    };
    expect(isStaleRefreshError(stale)).toBe(true);
    expect(isTerminalRefreshError(stale)).toBe(false);
    expect(isNonTerminalRefreshError(stale)).toBe(true);
  });

  it("treats transient transport / parse errors as non-terminal", () => {
    expect(isTerminalRefreshError(new TypeError("fetch failed"))).toBe(false);
    expect(isNonTerminalRefreshError(new TypeError("fetch failed"))).toBe(true);
    expect(isTerminalRefreshError(new SyntaxError("Unexpected token"))).toBe(
      false,
    );
  });

  it("treats INVALID_TOKEN_MEMORY_COMMIT as non-terminal", () => {
    const error = new KindeSDKError(
      KindeSDKErrorCode.INVALID_TOKEN_MEMORY_COMMIT,
      "bad",
    );
    expect(isTerminalRefreshError(error)).toBe(false);
  });

  it("treats plain Error OAuth failures as terminal", () => {
    expect(isTerminalRefreshError(new Error("invalid_client"))).toBe(true);
    expect(isNonTerminalRefreshError(new Error("invalid_client"))).toBe(false);
  });

  it("treats FAILED_TOKENS_REFRESH_ATTEMPT as terminal", () => {
    expect(
      isTerminalRefreshError({
        errorCode: "FAILED_TOKENS_REFRESH_ATTEMPT",
      }),
    ).toBe(true);
  });

  it("defaults unknown values to non-terminal (preserve session)", () => {
    expect(isTerminalRefreshError(null)).toBe(false);
    expect(isTerminalRefreshError(undefined)).toBe(false);
    expect(isTerminalRefreshError("STALE_REFRESH_TOKEN")).toBe(false);
  });

  it("skips re-destroy for plain OAuth Error (SDK already destroyed)", async () => {
    await expect(
      shouldDestroySessionManagerForRefreshError(
        true,
        new Error("invalid_client"),
      ),
    ).resolves.toBe(false);
  });

  it("still destroys for repeat-stale clear decisions", async () => {
    await expect(
      shouldDestroySessionManagerForRefreshError(true, {
        errorCode: "STALE_REFRESH_TOKEN",
      }),
    ).resolves.toBe(true);
  });
});
