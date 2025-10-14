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
  public req: NextRequest | undefined;
  public resp: NextResponse | undefined;
  private _cookieStore: ReturnType<typeof cookies> | undefined;

  sessionState = { persistent: true };

  constructor(
    req: NextRequest | undefined,
    resp: NextResponse | undefined,
    options: { persistent: boolean } = { persistent: true }
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

  /**
   * Lazy initialization of cookie store - only called when needed during request context
   */
  private async ensureCookieStore(): Promise<ReturnType<typeof cookies>> {
    if (this._cookieStore) {
      return this._cookieStore;
    }

    // In middleware context, use request cookies to pick up mutations made via resp.cookies
    // This is required for Next.js < 14.2.8 compatibility
    if (this.isMiddlewareContext() && this.req) {
      this._cookieStore = this.req.cookies as unknown as ReturnType<
        typeof cookies
      >;
      return this._cookieStore;
    }

    if (!this.req) {
      this._cookieStore = cookies();
      return this._cookieStore;
    }

    if (isAppRouter(this.req)) {
      this._cookieStore = cookies();
      return this._cookieStore;
    } else {
      throw new Error(
        "This store should make use of the request cookies provided by the middleware."
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
      .filter((key) => COOKIE_LIST.some((substr) => key.startsWith(substr)));

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
    itemValue: unknown
  ): Promise<void> {
    const cookieStore = await this.ensureCookieStore();
    const prefixedKey = `${cookieStorageSettings.keyPrefix}${String(itemKey)}`;

    // Get list of keys to delete
    const keysToDelete = cookieStore
      .getAll()
      .map((c) => c.name)
      .filter((key) => key.startsWith(prefixedKey));

    // In middleware context, use resp.cookies (Next.js < 15 requirement)
    if (this.isMiddlewareContext() && this.resp) {
      // Delete old chunks
      keysToDelete.forEach((key) => {
        this.resp!.cookies.delete(key);
      });

      // Set new value (potentially chunked)
      if (itemValue !== undefined) {
        const itemValueString =
          typeof itemValue === "object"
            ? JSON.stringify(itemValue)
            : String(itemValue);
        splitString(itemValueString, MAX_COOKIE_LENGTH).forEach(
          (value, index) => {
            this.resp!.cookies.set(
              prefixedKey + (index === 0 ? "" : index),
              value,
              {
                maxAge: this.sessionState.persistent
                  ? TWENTY_NINE_DAYS
                  : undefined,
                domain: config.cookieDomain ? config.cookieDomain : undefined,
                ...GLOBAL_COOKIE_OPTIONS,
              }
            );
          }
        );
      }
    } else {
      // In Server Actions/Route Handlers, use cookieStore
      keysToDelete.forEach((key) => {
        cookieStore.delete(key);
      });

      if (itemValue !== undefined) {
        const itemValueString =
          typeof itemValue === "object"
            ? JSON.stringify(itemValue)
            : String(itemValue);
        splitString(itemValueString, MAX_COOKIE_LENGTH).forEach(
          (value, index) => {
            cookieStore.set(prefixedKey + (index === 0 ? "" : index), value, {
              maxAge: this.sessionState.persistent
                ? TWENTY_NINE_DAYS
                : undefined,
              domain: config.cookieDomain ? config.cookieDomain : undefined,
              ...GLOBAL_COOKIE_OPTIONS,
            });
          }
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
      return itemValue || item.value;
    }
  }

  /**
   * Removes all cookie parts associated with the provided key.
   */
  async removeSessionItem(itemKey: V | StorageKeys): Promise<void> {
    const cookieStore = await this.ensureCookieStore();
    const prefixedKey = `${cookieStorageSettings.keyPrefix}${String(itemKey)}`;
    const keysToDelete = cookieStore
      .getAll()
      .map((c) => c.name)
      .filter((key) => key.startsWith(prefixedKey));

    // In middleware context, use resp.cookies (Next.js < 15 requirement)
    if (this.isMiddlewareContext() && this.resp) {
      keysToDelete.forEach((key) => {
        this.resp!.cookies.delete(key);
      });
    } else {
      // In Server Actions/Route Handlers, use cookieStore
      keysToDelete.forEach((key) => {
        cookieStore.delete(key);
      });
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
