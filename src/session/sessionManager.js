import { cookies } from "next/headers";
import { isAppRouter } from "../utils/isAppRouter";
import { config } from "../config/index";
import {
  TWENTY_NINE_DAYS,
  MAX_COOKIE_LENGTH,
  GLOBAL_COOKIE_OPTIONS,
  COOKIE_LIST,
} from "../utils/constants";
import { splitString } from "../utils/splitString";
import cookie from "cookie";

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse | import('next').NextResponse} [res]
 * @returns {Promise<import('@kinde-oss/kinde-typescript-sdk').SessionManager>}
 */
export const sessionManager = async (req, res) => {
  try {
    if (!req) {
      const cookieStore = await cookies();
      return appRouterSessionManager(cookieStore);
    }

    if (isAppRouter(req)) {
      const cookieStore = await cookies(req, res);
      return appRouterSessionManager(cookieStore);
    } else {
      return pageRouterSessionManager(req, res);
    }
  } catch (error) {
    throw error;
  }
};

/**
 *
 * @param {import("next/dist/server/web/spec-extension/adapters/request-cookies").ReadonlyRequestCookies} cookieStore
 * @returns {import('@kinde-oss/kinde-typescript-sdk').SessionManager}
 */
export const appRouterSessionManager = (cookieStore) => ({
  /**
   *
   * @param {string} itemKey
   * @returns {Promise<string | object | null>}
   */
  getSessionItem: (itemKey) => {
    const item = cookieStore.get(itemKey);
    if (!item) return null;
    try {
      let itemValue = "";
      let index = 0;
      let key = `${String(itemKey)}${index === 0 ? "" : index}`;
      while (cookieStore.has(key)) {
        itemValue += cookieStore.get(key).value;
        index++;
        key = `${String(itemKey)}${index === 0 ? "" : index}`;
      }
      try {
        const jsonValue = JSON.parse(itemValue);
        if (typeof jsonValue === "object") {
          return jsonValue;
        }
      } catch (err) {}
      return itemValue;
    } catch (error) {
      if (config.isDebugMode)
        console.error("Failed to parse session item app router:", error);
      return item.value;
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
            maxAge: TWENTY_NINE_DAYS,
            domain: config.cookieDomain ? config.cookieDomain : undefined,
            ...GLOBAL_COOKIE_OPTIONS,
          });
        },
      );
    }
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
  },
});

/**
 *
 * @param {import('next/types').NextApiRequest} req
 * @param {import('next').NextApiResponse} [res]
 * @returns {import('@kinde-oss/kinde-typescript-sdk').SessionManager}
 */
export const pageRouterSessionManager = (req, res) => {
  return {
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
            return jsonValue;
          }
        } catch (err) {
          if (config.isDebugMode)
            console.error("Failed to parse session item:", err);
        }
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
    setSessionItem: (itemKey, itemValue) => {
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
                    maxAge: TWENTY_NINE_DAYS,
                  },
                );
              },
            ),
          ],
          {
            domain: config.cookieDomain ? config.cookieDomain : undefined,
            ...GLOBAL_COOKIE_OPTIONS,
            maxAge: TWENTY_NINE_DAYS,
          },
        );
      }
    },
    /**
     *
     * @param {string} itemKey
     * @returns {Promise<void>}
     */
    removeSessionItem: (itemKey) => {
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
    },

    destroySession: () => {
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
      ]);
    },
  };
};
