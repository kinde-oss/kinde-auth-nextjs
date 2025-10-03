import { SessionBase, StorageKeys, type SessionManager } from "./types.js";
import { splitString } from "@kinde/js-utils";
import {
  COOKIE_LIST,
  GLOBAL_COOKIE_OPTIONS,
  MAX_COOKIE_LENGTH,
  TWENTY_NINE_DAYS,
} from "../../utils/constants";
import { CookieStorageSettings, storageSettings } from "./settings";
import { NextApiRequest, NextApiResponse } from "next";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies.js";
import { cookies } from "next/headers.js";
import destr from "destr";
import { isAppRouter } from "../../utils/isAppRouter.js";
import { config } from "../../config/index";

export const cookieStorageSettings: CookieStorageSettings = {
  keyPrefix: "kinde-",
  maxLength: MAX_COOKIE_LENGTH, // stay under common cookie size limits per chunk
  useInsecureForRefreshToken: false,
};

export class CookieStorage<V extends string = StorageKeys>
  extends SessionBase<V>
  implements SessionManager<V>
{
  public req: NextApiRequest | undefined;
  public resp: NextApiResponse | undefined;
  private _cookieStore: ReadonlyRequestCookies | undefined;

  sessionState = { persistent: true };

  constructor(
    req: NextApiRequest | undefined,
    resp: NextApiResponse | undefined,
    options: { persistent: boolean } = { persistent: true },
  ) {
    super();
    this.req = req;
    this.resp = resp;
    this.sessionState = options;
  }

  /**
   * Lazy initialization of cookie store - only called when needed during request context
   */
  private async ensureCookieStore(): Promise<ReadonlyRequestCookies> {
    if (this._cookieStore) {
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
      throw new Error("This store is to be used for App Router.");
    }
  }

  /**
   * Clears all tracked items from the cookie store.
   * @returns {void}
   */
  async destroySession(): Promise<void> {
    const cookieStore = await this.ensureCookieStore();
    cookieStore
      .getAll()
      .map((c) => c.name)
      .forEach((key) => {
        if (COOKIE_LIST.some((substr) => key.startsWith(substr))) {
          cookieStore.set(key, "", {
            domain: config.cookieDomain ? config.cookieDomain : undefined,
            maxAge: 0,
            ...GLOBAL_COOKIE_OPTIONS,
          });
        }
      });
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
    
    cookieStore
      .getAll()
      .map((c) => c.name)
      .forEach((key) => {
        if (key.startsWith(prefixedKey)) {
          cookieStore.delete(key);
        }
      });
    if (itemValue !== undefined) {
      const itemValueString =
        typeof itemValue === "object"
          ? JSON.stringify(itemValue)
          : String(itemValue);
      splitString(itemValueString, MAX_COOKIE_LENGTH).forEach(
        (value, index) => {
          cookieStore.set(prefixedKey + (index === 0 ? "" : index), value, {
            maxAge: this.sessionState.persistent ? TWENTY_NINE_DAYS : undefined,
            domain: config.cookieDomain ? config.cookieDomain : undefined,
            ...GLOBAL_COOKIE_OPTIONS,
          });
        },
      );
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
    cookieStore
      .getAll()
      .map((c) => c.name)
      .forEach((key) => {
        if (key.startsWith(prefixedKey)) {
          cookieStore.delete(key);
        }
      });
  }
}
