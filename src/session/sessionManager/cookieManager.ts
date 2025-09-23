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
  keyPrefix: "kinde_",
  maxLength: MAX_COOKIE_LENGTH, // stay under common cookie size limits per chunk
  useInsecureForRefreshToken: false
};

export class CookieStorage<V extends string = StorageKeys> extends SessionBase<V> implements SessionManager<V> {
  public req: NextApiRequest|undefined;
  public resp: NextApiResponse|undefined;
  public cookieStore: ReadonlyRequestCookies;

  sessionState = {persistent:true};

  constructor(req:NextApiRequest, resp: NextApiResponse, options: { persistent: true }) {
    super();
    this.req = req
    this.resp = resp;
    this.sessionState = options;
  }

  async initCookieStore() {

    if (!this.req) {
      this.cookieStore = await cookies();
    }
  
    if (isAppRouter(this.req)) {
      this.cookieStore = await cookies();
    } else {
      throw new Error("This store is to be used for App Router.")
    }
  }

  /**
   * Clears all tracked items from the cookie store.
   * @returns {void}
   */
  async destroySession(): Promise<void> {
    this.cookieStore
    .getAll()
    .map((c) => c.name)
    .forEach((key) => {
      if (COOKIE_LIST.some((substr) => key.startsWith(substr))) {
        this.cookieStore.set(key, "", {
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
    this.cookieStore.getAll().map((c) => c.name)
    .forEach((key) => {
      if (key.startsWith(`${String(itemKey)}`)) {
        this.cookieStore.delete(key);
      }
    });
  if (itemValue !== undefined) {
    const itemValueString = 
      typeof itemValue === "object" ? JSON.stringify(itemValue) : itemValue;
    splitString(itemValueString as string, MAX_COOKIE_LENGTH).forEach(
      (value, index) => {
        this.cookieStore.set(itemKey + (index === 0 ? "" : index), value, {
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
    const item = this.cookieStore.get(itemKey);
    if (!item) return null;
    let itemValue = "";
    try {
      let index = 0;
      let key = `${String(itemKey)}${index === 0 ? "" : index}`;
      while (this.cookieStore.has(key)) {
        itemValue += this.cookieStore.get(key).value;
        index++;
        key = `${String(itemKey)}${index === 0 ? "" : index}`;
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
    this.cookieStore
    .getAll()
    .map((c) => c.name)
    .forEach((key) => {
      if (key.startsWith(`${String(itemKey)}`)) {
        this.cookieStore.delete(key);
      }
    });
  }
}


