import { StorageKeys } from "@kinde/js-utils";
import { type SessionManager, splitString, SessionBase } from "@kinde/js-utils";
import {
  COOKIE_LIST,
  GLOBAL_COOKIE_OPTIONS,
  MAX_COOKIE_LENGTH,
  TWENTY_NINE_DAYS,
} from "../../utils/constants";
import { CookieStorageSettings } from "./settings";
import { cookies } from "next/headers.js";
import destr from "destr";
import { isAppRouter } from "../../utils/isAppRouter.js";
import { config } from "../../config/index";
import { NextRequest, NextResponse } from "next/server.js";

export const cookieStorageSettings: CookieStorageSettings = {
  keyPrefix: "kinde-",
  maxLength: MAX_COOKIE_LENGTH, // stay under common cookie size limits per chunk
  useInsecureForRefreshToken: false,
};

export class CookieStorage<V extends string = StorageKeys>
  extends SessionBase<V>
  implements SessionManager<V>
{
  asyncStore = true;

  public req: NextRequest | undefined;
  public resp: NextResponse | undefined;
  private _cookieStore: Awaited<ReturnType<typeof cookies>> | undefined;

  sessionState = { persistent: true };

  constructor(
    req: NextRequest | undefined,
    resp: NextResponse | undefined,
    options: { persistent: boolean } = { persistent: true },
  ) {
    super();
    this.req = req;
    this.resp = resp;
    this.sessionState = options;
  }

  /**
   * Check if we're in middleware context (both req and resp provided)
   * In middleware, we must use resp.cookies for mutations (Next.js < 15 requirement)
   */
  private isMiddlewareContext(): boolean {
    return !!(this.req && this.resp);
  }

  private shouldDeleteSessionCookie(name: string): boolean {
    const { keyPrefix } = cookieStorageSettings;
    if (name.startsWith(keyPrefix)) {
      return true;
    }
    return COOKIE_LIST.some((substr) => name.startsWith(substr));
  }

  private prepareChunks(itemValue: unknown): string[] {
    if (itemValue === undefined) {
      return [];
    }
    const itemValueString =
      typeof itemValue === "object"
        ? JSON.stringify(itemValue)
        : String(itemValue);
    return splitString(itemValueString, MAX_COOKIE_LENGTH);
  }

  /**
   * Lazy initialization of cookie store - only called when needed during request context
   */
  private async ensureCookieStore(): Promise<
    Awaited<ReturnType<typeof cookies>>
  > {
    if (this._cookieStore) {
      return this._cookieStore;
    }

    // In middleware context, use request cookies to pick up mutations made via resp.cookies
    // This is required for Next.js < 14.2.8 compatibility
    if (this.isMiddlewareContext() && this.req) {
      this._cookieStore = this.req.cookies as unknown as Awaited<
        ReturnType<typeof cookies>
      >;
      return this._cookieStore;
    }

    if (!this.req) {
      this._cookieStore = await cookies();
      return this._cookieStore;
    }

    if (isAppRouter(this.req)) {
      this._cookieStore = await cookies();
      return this._cookieStore;
    } else {
      throw new Error(
        "This store should make use of the request cookies provided by the middleware.",
      );
    }
  }

  /**
   * Clears all tracked items from the cookie store.
   * @returns {void}
   */
  async destroySession(): Promise<void> {
    const cookieStore = await this.ensureCookieStore();
    const cookiesToDelete = cookieStore
      .getAll()
      .map((c) => c.name)
      .filter((key) => this.shouldDeleteSessionCookie(key));

    // In middleware context, use resp.cookies (Next.js < 15 requirement)
    if (this.isMiddlewareContext() && this.resp) {
      cookiesToDelete.forEach((key) => {
        this.resp!.cookies.set(key, "", {
          domain: config.cookieDomain ? config.cookieDomain : undefined,
          maxAge: 0,
          ...GLOBAL_COOKIE_OPTIONS,
        });
      });
    } else {
      // In Server Actions/Route Handlers, use cookieStore
      cookiesToDelete.forEach((key) => {
        cookieStore.set(key, "", {
          domain: config.cookieDomain ? config.cookieDomain : undefined,
          maxAge: 0,
          ...GLOBAL_COOKIE_OPTIONS,
        });
      });
    }
  }

  /**
   * Sets the provided key-value store into cookies (split into chunks if needed).
   */
  async setSessionItem(
    itemKey: V | StorageKeys,
    itemValue: unknown,
  ): Promise<void> {
    const cookieStore = await this.ensureCookieStore();
    const prefixedKey = `${cookieStorageSettings.keyPrefix}${String(itemKey)}`;

    const keysToDelete: string[] = [];
    for (const { name } of cookieStore.getAll()) {
      if (name.startsWith(prefixedKey)) {
        keysToDelete.push(name);
      }
    }

    const cookieOptions = {
      maxAge: this.sessionState.persistent ? TWENTY_NINE_DAYS : undefined,
      domain: config.cookieDomain ? config.cookieDomain : undefined,
      ...GLOBAL_COOKIE_OPTIONS,
    };

    // In middleware context, use resp.cookies (Next.js < 15 requirement)
    if (this.isMiddlewareContext() && this.resp) {
      for (const key of keysToDelete) {
        this.resp.cookies.delete(key);
      }

      for (const [index, value] of this.prepareChunks(itemValue).entries()) {
        this.resp.cookies.set(
          prefixedKey + (index === 0 ? "" : String(index)),
          value,
          cookieOptions,
        );
      }
    } else {
      for (const key of keysToDelete) {
        cookieStore.delete(key);
      }

      for (const [index, value] of this.prepareChunks(itemValue).entries()) {
        cookieStore.set(
          prefixedKey + (index === 0 ? "" : String(index)),
          value,
          cookieOptions,
        );
      }
    }
  }

  /**
   * Gets the value for the provided key from cookies, reassembling chunks.
   */
  async getSessionItem(itemKey: V | StorageKeys): Promise<unknown | null> {
    const cookieStore = await this.ensureCookieStore();
    const prefixedKey = `${cookieStorageSettings.keyPrefix}${String(itemKey)}`;
    const item = cookieStore.get(prefixedKey);
    if (!item) return null;
    let itemValue = "";
    try {
      let index = 0;
      let key = `${prefixedKey}${index === 0 ? "" : index}`;
      while (cookieStore.has(key)) {
        const chunk = cookieStore.get(key);
        if (!chunk) break;
        itemValue += chunk.value;
        index++;
        key = `${prefixedKey}${index === 0 ? "" : index}`;
      }
      return destr(itemValue);
    } catch (error) {
      if (config.isDebugMode)
        console.error("Failed to parse session item app router:", error);
      return itemValue;
    }
  }

  /**
   * Removes all cookie parts associated with the provided key.
   */
  async removeSessionItem(itemKey: V | StorageKeys): Promise<void> {
    const cookieStore = await this.ensureCookieStore();
    const prefixedKey = `${cookieStorageSettings.keyPrefix}${String(itemKey)}`;
    // In middleware context, use resp.cookies (Next.js < 15 requirement)
    if (this.isMiddlewareContext() && this.resp) {
      for (const { name } of cookieStore.getAll()) {
        if (name.startsWith(prefixedKey)) {
          this.resp.cookies.delete(name);
        }
      }
    } else {
      for (const { name } of cookieStore.getAll()) {
        if (name.startsWith(prefixedKey)) {
          cookieStore.delete(name);
        }
      }
    }
  }

  /**
   * Sets multiple items simultaneously.
   */
  async setItems(items: Partial<Record<V, unknown>>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      await this.setSessionItem(key as V, value);
    }
  }

  /**
   * Removes multiple items simultaneously.
   */
  async removeItems(...items: V[]): Promise<void> {
    for (const item of items) {
      await this.removeSessionItem(item);
    }
  }
}
