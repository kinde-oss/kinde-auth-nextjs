import { NextResponse } from "next/server";
import { COOKIE_LIST, GLOBAL_COOKIE_OPTIONS } from "./constants";
import { config } from "../config";

/**
 * Emit Max-Age=0 clearing cookies on a middleware/App Router response.
 * Use only for confirmed-terminal auth failures — never for STALE_REFRESH_TOKEN.
 */
export const clearSessionCookiesOnResponse = (
  response: NextResponse,
  req: { cookies?: { getAll?: () => { name: string }[] } },
): void => {
  const cookieNames = new Set<string>();

  try {
    const fromRequest = req.cookies?.getAll?.() ?? [];
    fromRequest.forEach((cookie) => {
      if (COOKIE_LIST.some((prefix) => cookie.name.startsWith(prefix))) {
        cookieNames.add(cookie.name);
      }
    });
  } catch {
    // Request cookies unavailable — still clear well-known names below.
  }

  COOKIE_LIST.forEach((name) => cookieNames.add(name));

  cookieNames.forEach((name) => {
    response.cookies.set(name, "", {
      ...GLOBAL_COOKIE_OPTIONS,
      domain: config.cookieDomain ? config.cookieDomain : undefined,
      maxAge: 0,
    });
  });
};
