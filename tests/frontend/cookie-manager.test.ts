import { describe, it, expect, beforeEach } from "vitest";
import { CookieStorage } from "../../src/session/sessionManager/index.ts";
import { MAX_COOKIE_LENGTH, COOKIE_LIST } from "../../src/utils/constants";
import { StorageKeys } from "@kinde/js-utils";

class FakeCookieStore {
  private store = new Map<string, string>();

  getAll() {
    return Array.from(this.store.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }

  get(name: string) {
    const value = this.store.get(name);
    return value ? { name, value } : undefined;
  }

  has(name: string) {
    return this.store.has(name);
  }

  set(name: string, value: string, options?: { maxAge?: number }) {
    if (options && typeof options.maxAge === "number" && options.maxAge <= 0) {
      this.store.delete(name);
      return;
    }
    this.store.set(name, value);
  }

  delete(name: string) {
    this.store.delete(name);
  }
}

describe("CookieStorage", () => {
  let storage: CookieStorage;
  let fake: FakeCookieStore;

  beforeEach(() => {
    fake = new FakeCookieStore();
    storage = new CookieStorage<any>(undefined as any, undefined as any, {
      persistent: true,
    });
    // inject our fake cookie store (bypass lazy initialization for testing)
    // @ts-ignore accessing private field
    storage._cookieStore = fake as any;
  });

  it("sets and gets a short string value", async () => {
    const value = "abc123";
    await storage.setSessionItem(StorageKeys.accessToken, value);

    const result = await storage.getSessionItem(StorageKeys.accessToken);
    expect(result).toBe(value);

    // chunking: first chunk has no index suffix, but has prefix
    const names = fake.getAll().map((c) => c.name);
    expect(names).toContain(`kinde-${StorageKeys.accessToken}`);
  });

  it("returns null when key is not present", async () => {
    const result = await storage.getSessionItem(StorageKeys.idToken);
    expect(result).toBeNull();
  });

  it("splits and reassembles long string values across multiple cookies", async () => {
    const longValue = "x".repeat(MAX_COOKIE_LENGTH * 2 + 137); // 3 chunks
    await storage.setSessionItem(StorageKeys.accessToken, longValue);

    const names = fake
      .getAll()
      .map((c) => c.name)
      .filter((n) => n.startsWith(`kinde-${StorageKeys.accessToken}`));
    expect(names.sort()).toEqual([
      `kinde-${StorageKeys.accessToken}`,
      `kinde-${StorageKeys.accessToken}1`,
      `kinde-${StorageKeys.accessToken}2`,
    ]);

    const reassembled = await storage.getSessionItem(StorageKeys.accessToken);
    expect(String(reassembled).length).toBe(longValue.length);
    expect(reassembled).toBe(longValue);
  });

  it("parses non-string primitives via destr", async () => {
    await storage.setSessionItem(StorageKeys.state, "42");
    const gotNumber = await storage.getSessionItem(StorageKeys.state);
    expect(gotNumber).toBe(42);

    await storage.setSessionItem(StorageKeys.nonce, "true");
    const gotBool = await storage.getSessionItem(StorageKeys.nonce);
    expect(gotBool).toBe(true);
  });

  it("removes all cookie chunks for a key", async () => {
    const longValue = "y".repeat(MAX_COOKIE_LENGTH + 10); // 2 chunks
    await storage.setSessionItem(StorageKeys.idToken, longValue);

    await storage.removeSessionItem(StorageKeys.idToken);

    const result = await storage.getSessionItem(StorageKeys.idToken);
    expect(result).toBeNull();
  });

  it("destroySession clears cookies that match known prefixes", async () => {
    // seed some cookies that match COOKIE_LIST and some that don't
    for (const prefix of COOKIE_LIST) {
      fake.set(prefix, "1");
      fake.set(`${prefix}1`, "2");
    }
    fake.set("unrelated", "x");
    await storage.destroySession();

    const remaining = fake.getAll().map((c) => c.name);
    // all COOKIE_LIST-prefixed cookies should be gone
    for (const prefix of COOKIE_LIST) {
      expect(remaining.find((n) => n.startsWith(prefix))).toBeUndefined();
    }
    // unrelated cookie should remain
    expect(remaining).toContain("unrelated");
  });

  it("stores and retrieves objects correctly", async () => {
    const obj = { foo: "bar", nested: { value: 42 } };
    await storage.setSessionItem(StorageKeys.state, obj);

    const result = await storage.getSessionItem(StorageKeys.state);
    expect(result).toEqual(obj);
  });

  it("handles undefined values by not setting cookies", async () => {
    await storage.setSessionItem(StorageKeys.nonce, undefined);

    const result = await storage.getSessionItem(StorageKeys.nonce);
    expect(result).toBeNull();

    const cookies = fake.getAll().map((c) => c.name);
    expect(
      cookies.find((n) => n.startsWith(`kinde-${StorageKeys.nonce}`)),
    ).toBeUndefined();
  });

  it("handles number and boolean values correctly", async () => {
    await storage.setSessionItem(StorageKeys.state, 123);
    const num = await storage.getSessionItem(StorageKeys.state);
    expect(num).toBe(123);

    await storage.setSessionItem(StorageKeys.nonce, false);
    const bool = await storage.getSessionItem(StorageKeys.nonce);
    expect(bool).toBe(false);
  });

  it("prepends keyPrefix to all cookie names", async () => {
    await storage.setSessionItem(StorageKeys.accessToken, "token123");
    await storage.setSessionItem(StorageKeys.idToken, "id456");

    const allCookies = fake.getAll();
    const cookieNames = allCookies.map((c) => c.name);

    // All cookies should have the "kinde-" prefix
    expect(cookieNames).toContain("kinde-accessToken");
    expect(cookieNames).toContain("kinde-idToken");

    // Should NOT have unprefixed cookies
    expect(cookieNames).not.toContain("accessToken");
    expect(cookieNames).not.toContain("idToken");
  });
});
