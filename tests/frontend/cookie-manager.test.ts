import { describe, it, expect, beforeEach } from "vitest";
import { CookieStorage } from "../../src/session/sessionManager/index.ts";
import { StorageKeys } from "../../src/session/sessionManager/types";
import { MAX_COOKIE_LENGTH, COOKIE_LIST } from "../../src/utils/constants";

class FakeCookieStore {
  private store = new Map<string, string>();

  getAll() {
    return Array.from(this.store.entries()).map(([name, value]) => ({ name, value }));
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
    storage = new CookieStorage<any>(undefined as any, undefined as any, { persistent: true });
    // inject our fake cookie store
    // @ts-ignore accessing otherwise public field
    storage.cookieStore = fake as any;
  });

  it("sets and gets a short string value", async () => {
    const value = "abc123";
    await storage.setSessionItem(StorageKeys.accessToken, value);

    const result = await storage.getSessionItem(StorageKeys.accessToken);
    expect(result).toBe(value);

    // chunking: first chunk has no index suffix
    const names = fake.getAll().map((c) => c.name);
    expect(names).toContain(StorageKeys.accessToken);
  });

  it("returns null when key is not present", async () => {
    const result = await storage.getSessionItem(StorageKeys.idToken);
    expect(result).toBeNull();
  });

  it("splits and reassembles long string values across multiple cookies", async () => {
    const longValue = "x".repeat(MAX_COOKIE_LENGTH * 2 + 137); // 3 chunks
    await storage.setSessionItem(StorageKeys.accessToken, longValue);

    const names = fake.getAll().map((c) => c.name).filter((n) => n.startsWith(StorageKeys.accessToken));
    expect(names.sort()).toEqual([
      `${StorageKeys.accessToken}`,
      `${StorageKeys.accessToken}1`,
      `${StorageKeys.accessToken}2`,
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
});


