import {cookies} from 'next/headers';
import {isAppRouter} from '../utils/isAppRouter';
import {config} from '../config/index';

var cookie = require('cookie');

const cookieSecurity = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
};

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {import('@kinde-oss/kinde-typescript-sdk').SessionManager}
 */
export const sessionManager = (req, res) => {
  if (!req) return appRouterSessionManager(cookies());
  return isAppRouter(req)
    ? appRouterSessionManager(cookies())
    : pageRouterSessionManager(req, res);
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
    if (item) {
      try {
        const jsonValue = JSON.parse(item.value);
        if (typeof jsonValue === 'object') {
          return jsonValue;
        }
        return item.value;
      } catch (error) {
        return item.value;
      }
    }
    return null;
  },
  /**
   *
   * @param {string} itemKey
   * @param {any} itemValue
   * @returns {Promise<void>}
   */
  setSessionItem: (itemKey, itemValue) => {
    if (itemValue !== undefined) {
      cookieStore.set(
        itemKey,
        typeof itemValue === 'object' ? JSON.stringify(itemValue) : itemValue,
        {
          domain: config.cookieDomain ? config.cookieDomain : undefined,
          ...cookieSecurity
        }
      );
    }
  },
  /**
   *
   * @param {string} itemKey
   * @returns {Promise<void>}
   */
  removeSessionItem: (itemKey) => {
    cookieStore.set(itemKey, '', {
      domain: config.cookieDomain ? config.cookieDomain : undefined,
      maxAge: 0,
      ...cookieSecurity
    });
  },
  /**
   * @returns {Promise<void>}
   */
  destroySession: () => {
    [
      'id_token_payload',
      'id_token',
      'access_token_payload',
      'access_token',
      'user',
      'refresh_token',
      'post_login_redirect_url'
    ].forEach((name) =>
      cookieStore.set(name, '', {
        domain: config.cookieDomain ? config.cookieDomain : undefined,
        maxAge: 0,
        ...cookieSecurity
      })
    );
  }
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
      if (itemValue) {
        try {
          const jsonValue = JSON.parse(itemValue);
          if (typeof jsonValue === 'object') {
            return jsonValue;
          }
          return itemValue;
        } catch (error) {
          return itemValue;
        }
      }
    },
    /**
     *
     * @param {string} itemKey
     * @param {any} itemValue
     * @returns {Promise<void>}
     */
    setSessionItem: (itemKey, itemValue) => {
      let cookies = res?.getHeader('Set-Cookie') || [];

      if (!Array.isArray(cookies)) {
        cookies = [cookies.toString()];
      }

      res?.setHeader('Set-Cookie', [
        ...cookies.filter((cookie) => !cookie.startsWith(`${itemKey}=`)),
        cookie.serialize(
          itemKey,
          typeof itemValue === 'object' ? JSON.stringify(itemValue) : itemValue,
          {
            domain: config.cookieDomain ? config.cookieDomain : undefined,
            path: '/',
            ...cookieSecurity
          }
        )
      ]);
    },
    /**
     *
     * @param {string} itemKey
     * @returns {Promise<void>}
     */
    removeSessionItem: (itemKey) => {
      res?.setHeader('Set-Cookie', [
        cookie.serialize(itemKey, '', {
          domain: config.cookieDomain ? config.cookieDomain : undefined,
          path: '/',
          maxAge: -1
        })
      ]);

      // remove cookies from the root domain
      res?.setHeader('Set-Cookie', [
        cookie.serialize(itemKey, '', {
          path: '/',
          maxAge: -1,
          ...cookieSecurity
        })
      ]);
    },
    destroySession: () => {
      res?.setHeader('Set-Cookie', [
        ...[
          'id_token_payload',
          'id_token',
          'access_token_payload',
          'access_token',
          'user',
          'refresh_token',
          'post_login_redirect_url'
        ].map((name) =>
          cookie.serialize(name, '', {
            domain: config.cookieDomain ? config.cookieDomain : undefined,
            path: '/',
            maxAge: -1,
            ...cookieSecurity
          })
        )
      ]);

      // remove cookies from the root domain
      res?.setHeader('Set-Cookie', [
        ...[
          'id_token_payload',
          'id_token',
          'access_token_payload',
          'access_token',
          'user',
          'refresh_token',
          'post_login_redirect_url'
        ].map((name) =>
          cookie.serialize(name, '', {
            path: '/',
            maxAge: -1,
            ...cookieSecurity
          })
        )
      ]);
    }
  };
};
