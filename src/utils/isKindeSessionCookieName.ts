import { COOKIE_LIST } from "./constants";

/**
 * Match a Kinde session cookie exactly, or a chunked variant (`access_token1`).
 * Avoids `startsWith("user")` wiping host cookies like `user_prefs`.
 */
export const isKindeSessionCookieName = (cookieName: string): boolean =>
  COOKIE_LIST.some(
    (name) =>
      cookieName === name || new RegExp(`^${name}\\d+$`).test(cookieName),
  );
