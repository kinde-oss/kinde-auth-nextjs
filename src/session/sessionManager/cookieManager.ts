import { SessionBase, StorageKeys, type SessionManager } from "./types.js";
import { splitString } from "@kinde/js-utils";
import {
    MAX_COOKIE_LENGTH,
  } from "../../utils/constants";
import { CookieStorageSettings, storageSettings } from "./settings";


export const cookieStorageSettings: CookieStorageSettings = {
  keyPrefix: "kinde_",
  maxLength: MAX_COOKIE_LENGTH, // stay under common cookie size limits per chunk
  useInsecureForRefreshToken: false
};



export class CookieStorage<V extends string = StorageKeys> extends SessionBase<V> implements SessionManager<V> {
  private internalItems: Set<V | StorageKeys> = new Set<V>();

  /**
   * Clears all tracked items from the cookie store.
   * @returns {void}
   */
  async destroySession(): Promise<void> {
    await Promise.all(
      Array.from(this.internalItems).map((key) => this.removeSessionItem(key))
    );
  }

  /**
   * Sets the provided key-value store into cookies (split into chunks if needed).
   */
  async setSessionItem(
    itemKey: V | StorageKeys,
    itemValue: unknown,
  ): Promise<void> {
    // clear existing parts first
    await this.removeSessionItem(itemKey);
    this.internalItems.add(itemKey);

    const baseKey = `${storageSettings.keyPrefix}${itemKey}`;

    if (typeof itemValue === "string") {
      splitString(itemValue, MAX_COOKIE_LENGTH).forEach(
        (splitValue:string, index:number) => {
          this.setCookie(`${baseKey}${index}`, splitValue);
        },
      );
      return;
    }
    this.setCookie(`${baseKey}0`, String(itemValue));
  }

  /**
   * Gets the value for the provided key from cookies, reassembling chunks.
   */
  async getSessionItem(itemKey: V | StorageKeys): Promise<unknown | null> {
    const baseKey = `${storageSettings.keyPrefix}${itemKey}`;

    if (this.getCookie(`${baseKey}0`) === null) {
      return null;
    }

    let itemValue = "";
    let index = 0;
    let key = `${baseKey}${index}`;
    while (this.getCookie(key) !== null) {
      itemValue += this.getCookie(key);
      index++;
      key = `${baseKey}${index}`;
    }

    return itemValue;
  }

  /**
   * Removes all cookie parts associated with the provided key.
   */
  async removeSessionItem(itemKey: V | StorageKeys): Promise<void> {
    const baseKey = `${storageSettings.keyPrefix}${String(itemKey)}`;
    let index = 0;
    while (this.getCookie(`${baseKey}${index}`) !== null) {
      this.deleteCookie(`${baseKey}${index}`);
      index++;
    }
    this.internalItems.delete(itemKey);
  }

  private setCookie(name: string, value: string): void {
    const attrs = this.buildCookieAttributes();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value,
    )}${attrs}`;
  }

  private deleteCookie(name: string): void {
    const attrs = this.buildCookieAttributes({ maxAge: -1 });
    document.cookie = `${encodeURIComponent(name)}=;${attrs}`;
  }

  private getCookie(name: string): string | null {
    const decoded = decodeURIComponent(document.cookie || "");
    const parts = decoded.split("; ");
    const prefix = `${name}=`;
    for (const part of parts) {
      if (part.startsWith(prefix)) {
        return part.substring(prefix.length);
      }
    }
    return null;
  }

  private buildCookieAttributes(options?: { maxAge?: number }): string {
    const segments: string[] = [];
    // Always default to path=/ to ensure availability across the app
    segments.push("Path=/");

    if (typeof options?.maxAge === "number") {
      segments.push(`Max-Age=${options.maxAge}`);
    }

    // Best-effort application of common settings from cookieStorageSettings if present
    if (cookieStorageSettings.domain)
      segments.push(`Domain=${cookieStorageSettings.domain}`);
    if (cookieStorageSettings.sameSite)
      segments.push(`SameSite=${cookieStorageSettings.sameSite}`);
    if (cookieStorageSettings.secure) segments.push("Secure");
    if (cookieStorageSettings.httpOnly) segments.push("HttpOnly");

    return segments.length ? `; ${segments.join("; ")}` : "";
  }
}


