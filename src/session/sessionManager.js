import { cookies } from "next/headers";
import { isAppRouter } from "../utils/isAppRouter";
import { config, activityConfig } from "../config/index";
import {
  TWENTY_NINE_DAYS,
  MAX_COOKIE_LENGTH,
  GLOBAL_COOKIE_OPTIONS,
  COOKIE_LIST,
} from "../utils/constants";
import { splitString } from "@kinde/js-utils";
import { destr } from "destr";
import * as cookie from "cookie";

// Activity tracking cookie name
const ACTIVITY_COOKIE_NAME = "kinde_activity_ts";

/**
 * Check if activity cookie is expired
 * @param {string | undefined} existingCookieValue - The existing activity cookie value
 * @returns {boolean} True if expired, false otherwise
 */
const isActivityCookieExpired = (existingCookieValue) => {
  if (!existingCookieValue || !activityConfig.timeoutMinutes) {
    return false;
  }

  const lastActivityTimestamp = parseInt(existingCookieValue, 10);
  const now = Date.now();
  const timeoutMs = activityConfig.timeoutMinutes * 60 * 1000;
  const timeSinceLastActivity = now - lastActivityTimestamp;

  return timeSinceLastActivity >= timeoutMs;
};

/**
 * Helper to set activity timestamp cookie for app router
 * @param {import("next/dist/server/web/spec-extension/adapters/request-cookies").ReadonlyRequestCookies} cookieStore
 */
const setActivityCookieAppRouter = (cookieStore) => {
  try {
    const existingCookie = cookieStore.get(ACTIVITY_COOKIE_NAME);

    // If expired, don't update the cookie - preserve expired state for client detection
    if (isActivityCookieExpired(existingCookie?.value)) {
      if (config.isDebugMode) {
        console.log("[Kinde Activity] Activity cookie expired, not updating");
      }
      return;
    }

    cookieStore.set(ACTIVITY_COOKIE_NAME, Date.now().toString(), {
      maxAge: TWENTY_NINE_DAYS,
      domain: config.cookieDomain ? config.cookieDomain : undefined,
      sameSite: "lax",
      httpOnly: false, // Must be false so client-side JS can read it
      path: "/",
    });
  } catch (error) {
    // Silently fail - activity tracking is not critical
    if (config.isDebugMode) {
      console.error("Failed to set activity cookie:", error);
    }
  }
};

/**
 * Helper to set activity timestamp cookie for page router
 * @param {import('next').NextApiResponse} res
 * @param {import('next').NextApiRequest} req
 */
const setActivityCookiePageRouter = (res, req) => {
  try {
    if (!res) return;

    const existingCookie = req?.cookies[ACTIVITY_COOKIE_NAME];

    // If expired, don't update the cookie - preserve expired state for client detection
    if (isActivityCookieExpired(existingCookie)) {
      if (config.isDebugMode) {
        console.log("[Kinde Activity] Activity cookie expired, not updating");
      }
      return;
    }

    let cookies = res.getHeader("Set-Cookie") || [];
    if (!Array.isArray(cookies)) {
      cookies = [cookies.toString()];
    }

    const activityCookie = cookie.serialize(
      ACTIVITY_COOKIE_NAME,
      Date.now().toString(),
      {
        maxAge: TWENTY_NINE_DAYS,
        domain: config.cookieDomain ? config.cookieDomain : undefined,
        sameSite: "lax",
        httpOnly: false, // Must be false so client-side JS can read it
        path: "/",
      },
    );

    res.setHeader("Set-Cookie", [
      ...cookies.filter((c) => !c.startsWith(`${ACTIVITY_COOKIE_NAME}=`)),
      activityCookie,
    ]);
  } catch (error) {
    // Silently fail - activity tracking is not critical
    if (config.isDebugMode) {
      console.error("Failed to set activity cookie:", error);
    }
  }
};

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse | import('next').NextResponse} [res]
 * @param {Object} [options]
 * @param {boolean} [options.persistent=true]
 * @returns {Promise<import('@kinde-oss/kinde-typescript-sdk').SessionManager>}
 */
export const sessionManager = async (
  req,
  res,
  options = { persistent: true },
) => {
  const { persistent = true } = options;

  if (!req) {
    const cookieStore = await cookies();
    return appRouterSessionManager(cookieStore, persistent);
  }

  if (isAppRouter(req)) {
    const cookieStore = await cookies(req, res);
    return appRouterSessionManager(cookieStore, persistent);
  } else {
    return pageRouterSessionManager(req, res, persistent);
  }
};

/**
 *
 * @param {import("next/dist/server/web/spec-extension/adapters/request-cookies").ReadonlyRequestCookies} cookieStore
 * @param {boolean} [persistent=true]
 * @returns {import('@kinde-oss/kinde-typescript-sdk').SessionManager}
 */
export const appRouterSessionManager = (cookieStore, persistent = true) => {
  const sessionState = { persistent };

  return {
    get persistent() {
      return sessionState.persistent;
    },
    set persistent(value) {
      sessionState.persistent = value;
    },
    /**
     *
     * @param {string} itemKey
     * @returns {Promise<string | object | null>}
     */
    getSessionItem: (itemKey) => {
      const item = cookieStore.get(itemKey);
      if (!item) return null;
      let itemValue = "";
      try {
        let index = 0;
        let key = `${String(itemKey)}${index === 0 ? "" : index}`;
        while (cookieStore.has(key)) {
          itemValue += cookieStore.get(key).value;
          index++;
          key = `${String(itemKey)}${index === 0 ? "" : index}`;
        }
        const result = destr(itemValue);
        return result;
      } catch (error) {
        if (config.isDebugMode)
          console.error("Failed to parse session item app router:", error);
        return itemValue || item.value;
      } finally {
        // Signal activity after session item retrieval (success or error)
        setActivityCookieAppRouter(cookieStore);
      }
    },
    /**
     *
     * @param {string} itemKey
     * @param {any} itemValue
     * @returns {Promise<void>}
     */
    setSessionItem: (itemKey, itemValue) => {
      cookieStore
        .getAll()
        .map((c) => c.name)
        .forEach((key) => {
          if (key.startsWith(`${String(itemKey)}`)) {
            cookieStore.delete(key);
          }
        });
      if (itemValue !== undefined) {
        const itemValueString =
          typeof itemValue === "object" ? JSON.stringify(itemValue) : itemValue;
        splitString(itemValueString, MAX_COOKIE_LENGTH).forEach(
          (value, index) => {
            cookieStore.set(itemKey + (index === 0 ? "" : index), value, {
              maxAge: sessionState.persistent ? TWENTY_NINE_DAYS : undefined,
              domain: config.cookieDomain ? config.cookieDomain : undefined,
              ...GLOBAL_COOKIE_OPTIONS,
            });
          },
        );
      }
      // Signal activity after session item update
      setActivityCookieAppRouter(cookieStore);
    },
    /**
     *
     * @param {string} itemKey
     * @returns {Promise<void>}
     */
    removeSessionItem: (itemKey) => {
      cookieStore
        .getAll()
        .map((c) => c.name)
        .forEach((key) => {
          if (key.startsWith(`${String(itemKey)}`)) {
            cookieStore.delete(key);
          }
        });
      // Signal activity after session item removal
      setActivityCookieAppRouter(cookieStore);
    },
    /**
     * @returns {Promise<void>}
     */
    destroySession: () => {
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
      // Clear activity tracking cookie to prevent infinite timeout loop
      cookieStore.set(ACTIVITY_COOKIE_NAME, "", {
        domain: config.cookieDomain ? config.cookieDomain : undefined,
        maxAge: 0,
        sameSite: "lax",
        httpOnly: false,
        path: "/",
      });
    },
  };
};

/**
 *
 * @param {import('next/types').NextApiRequest} req
 * @param {import('next').NextApiResponse} [res]
 * @param {boolean} [persistent=true]
 * @returns {import('@kinde-oss/kinde-typescript-sdk').SessionManager}
 */
export const pageRouterSessionManager = (req, res, persistent = true) => {
  const sessionState = { persistent };

  return {
    get persistent() {
      return sessionState.persistent;
    },
    set persistent(value) {
      sessionState.persistent = value;
    },
    /**
     *
     * @param {string} itemKey
     * @returns {Promise<string | undefined>}
     */
    getSessionItem: (itemKey) => {
      const itemValue = req.cookies[itemKey];
      if (!itemValue) return undefined;
      try {
        let itemValueString = "";
        let index = 0;
        let key = `${String(itemKey)}${index === 0 ? "" : index}`;
        while (req.cookies[key]) {
          itemValueString += req.cookies[key];
          index++;
          key = `${String(itemKey)}${index === 0 ? "" : index}`;
        }
        try {
          const jsonValue = JSON.parse(itemValueString);
          if (typeof jsonValue === "object") {
            // Signal activity after successful session item retrieval
            setActivityCookiePageRouter(res);
            return jsonValue;
          }
        } catch (err) {
          if (config.isDebugMode)
            console.error("Failed to parse session item:", err);
        }
        // Signal activity after successful session item retrieval
        setActivityCookiePageRouter(res);
        return itemValueString;
      } catch (error) {
        if (config.isDebugMode)
          console.error("Failed to read session item:", error);
        return itemValue;
      }
    },

    /**
     *
     * @param {string} itemKey
     * @param {any} itemValue
     * @returns {Promise<void>}
     */
    setSessionItem: async (itemKey, itemValue) => {
      let cookies = res?.getHeader("Set-Cookie") || [];

      if (!Array.isArray(cookies)) {
        cookies = [cookies.toString()];
      }

      if (req.cookies[itemKey] !== undefined) {
        cookies.push(
          cookie.serialize(itemKey, "", {
            domain: config.cookieDomain ? config.cookieDomain : undefined,
            maxAge: -1,
            ...GLOBAL_COOKIE_OPTIONS,
          }),
        );
      }

      if (itemValue !== undefined) {
        const itemValueString =
          typeof itemValue === "object" ? JSON.stringify(itemValue) : itemValue;

        res?.setHeader(
          "Set-Cookie",
          [
            ...(cookies.filter((cookie) => !cookie.startsWith(`${itemKey}`)) ||
              []),
            ...splitString(itemValueString, MAX_COOKIE_LENGTH).map(
              (value, index) => {
                return cookie.serialize(
                  itemKey + (index === 0 ? "" : index),
                  value,
                  {
                    domain: config.cookieDomain
                      ? config.cookieDomain
                      : undefined,
                    ...GLOBAL_COOKIE_OPTIONS,
                    maxAge: sessionState.persistent
                      ? TWENTY_NINE_DAYS
                      : undefined,
                  },
                );
              },
            ),
          ],
          {
            domain: config.cookieDomain ? config.cookieDomain : undefined,
            ...GLOBAL_COOKIE_OPTIONS,
            maxAge: sessionState.persistent ? TWENTY_NINE_DAYS : undefined,
          },
        );
      }
      // Signal activity after session item update
      setActivityCookiePageRouter(res);
    },
    /**
     *
     * @param {string} itemKey
     * @returns {Promise<void>}
     */
    removeSessionItem: async (itemKey) => {
      let cookies = res?.getHeader("Set-Cookie") || [];
      if (!Array.isArray(cookies)) {
        cookies = [cookies.toString()];
      }

      if (req.cookies[itemKey] !== undefined) {
        cookies.push(
          cookie.serialize(itemKey, "", {
            domain: config.cookieDomain ? config.cookieDomain : undefined,
            maxAge: -1,
            ...GLOBAL_COOKIE_OPTIONS,
          }),
        );
      }

      res?.setHeader("Set-Cookie", [
        ...cookies.map((c) => {
          if (c.startsWith(`${itemKey}`)) {
            return cookie.serialize(c.split("=")[0], "", {
              domain: config.cookieDomain ? config.cookieDomain : undefined,
              maxAge: -1,
              ...GLOBAL_COOKIE_OPTIONS,
            });
          } else {
            return c;
          }
        }),
      ]);
      // Signal activity after session item removal
      setActivityCookiePageRouter(res);
    },

    destroySession: async () => {
      let cookies = res?.getHeader("Set-Cookie") || [];
      if (!Array.isArray(cookies)) {
        cookies = [cookies.toString()];
      }

      res?.setHeader("Set-Cookie", [
        ...Object.keys(req.cookies).map((c) => {
          if (COOKIE_LIST.some((substr) => c.startsWith(substr))) {
            return cookie.serialize(c.split("=")[0], "", {
              domain: config.cookieDomain ? config.cookieDomain : undefined,
              maxAge: -1,
              ...GLOBAL_COOKIE_OPTIONS,
            });
          }
        }),
        // Clear activity tracking cookie to prevent infinite timeout loop
        cookie.serialize(ACTIVITY_COOKIE_NAME, "", {
          domain: config.cookieDomain ? config.cookieDomain : undefined,
          maxAge: -1,
          sameSite: "lax",
          httpOnly: false,
          path: "/",
        }),
      ]);
    },
  };
};
