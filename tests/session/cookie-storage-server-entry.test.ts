import { describe, it, expect } from "vitest";
import { StorageKeys } from "@kinde/js-utils";
import { CookieStorage } from "../../src/server/index.js";

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

describe("CookieStorage server entry", () => {
  it("sets and gets a session item through the server export", async () => {
    const fake = new FakeCookieStore();
    const storage = new CookieStorage(undefined, undefined, {
      persistent: true,
    });
    // @ts-ignore accessing private field
    storage._cookieStore = fake;

    await storage.setSessionItem(StorageKeys.accessToken, "abc123");

    expect(await storage.getSessionItem(StorageKeys.accessToken)).toBe(
      "abc123",
    );
    expect(fake.getAll().map((cookie) => cookie.name)).toContain(
      `kinde-${StorageKeys.accessToken}`,
    );
  });
});
