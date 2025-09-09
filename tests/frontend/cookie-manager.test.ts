import { describe, it, expect, beforeEach } from "vitest";
import { CookieStorage, storageSettings } from "../../src/session/sessionManager/index.ts";
import { StorageKeys } from "../../src/session/sessionManager/types";
import { MAX_COOKIE_LENGTH } from "../../src/utils/constants";

// Direct import to tweak settings in a controlled way in a few tests
// no direct cookieManager imports to avoid circular init issues in tests

const clearAllCookies = () => {
  const cookieString = document.cookie || "";
  if (!cookieString) return;
  const names = cookieString.split("; ").map((part) => part.split("=")[0]);
  for (const name of names) {
    // expire cookie immediately
    document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0`;
  }
};

describe("CookieStorage", () => {
  beforeEach(() => {
    clearAllCookies();
    // reset any custom settings we might toggle in tests
    // reset storageSettings to sensible defaults for tests
    storageSettings.keyPrefix = "kinde-"; // match index.ts default
    storageSettings.maxLength = 2000; // not used by cookie manager directly
    storageSettings.useInsecureForRefreshToken = false;
  });

  it("sets and gets a short string value", async () => {
    const storage = new CookieStorage();
    const value = "abc123";
    await storage.setSessionItem(StorageKeys.accessToken, value);

    const result = await storage.getSessionItem(StorageKeys.accessToken);
    expect(result).toBe(value);

    // sanity: cookie key shape matches storage key prefix
    const baseKey = `${storageSettings.keyPrefix}${StorageKeys.accessToken}`;
    expect(document.cookie.includes(`${encodeURIComponent(baseKey)}0=`)).toBe(true);
  });

  it("returns null when key is not present", async () => {
    const storage = new CookieStorage();
    const result = await storage.getSessionItem(StorageKeys.idToken);
    expect(result).toBeNull();
  });

  it("splits and reassembles long string values across multiple cookies", async () => {
    const storage = new CookieStorage();
    const longValue = "x".repeat(MAX_COOKIE_LENGTH * 2 + 137); // 3 chunks: 3000, 3000, 137
    await storage.setSessionItem(StorageKeys.accessToken, longValue);

    const baseKey = `${storageSettings.keyPrefix}${StorageKeys.accessToken}`;
    const names = (document.cookie || "").split("; ").map((p) => p.split("=")[0]);
    const matching = names.filter((n) => decodeURIComponent(n).startsWith(`${baseKey}`));
    expect(matching).toEqual([
      `${encodeURIComponent(`${baseKey}0`)}`,
      `${encodeURIComponent(`${baseKey}1`)}`,
      `${encodeURIComponent(`${baseKey}2`)}`,
    ]);

    const reassembled = await storage.getSessionItem(StorageKeys.accessToken);
    expect(String(reassembled).length).toBe(longValue.length);
    expect(reassembled).toBe(longValue);
  });

  it("stores non-string values as stringified primitives in a single chunk", async () => {
    const storage = new CookieStorage();

    await storage.setSessionItem(StorageKeys.state, 42 as unknown as string);
    const gotNumber = await storage.getSessionItem(StorageKeys.state);
    expect(gotNumber).toBe("42");

    await storage.setSessionItem(StorageKeys.nonce, true as unknown as string);
    const gotBool = await storage.getSessionItem(StorageKeys.nonce);
    expect(gotBool).toBe("true");
  });

  it("removes all cookie chunks for a key", async () => {
    const storage = new CookieStorage();
    const longValue = "y".repeat(MAX_COOKIE_LENGTH + 10); // 2 chunks
    await storage.setSessionItem(StorageKeys.idToken, longValue);

    await storage.removeSessionItem(StorageKeys.idToken);

    const result = await storage.getSessionItem(StorageKeys.idToken);
    expect(result).toBeNull();
  });

  it("destroySession clears all tracked items", async () => {
    const storage = new CookieStorage();
    await storage.setSessionItem(StorageKeys.accessToken, "v1");
    await storage.setSessionItem(StorageKeys.idToken, "v2");

    await storage.destroySession();

    expect(await storage.getSessionItem(StorageKeys.accessToken)).toBeNull();
    expect(await storage.getSessionItem(StorageKeys.idToken)).toBeNull();
  });
});


