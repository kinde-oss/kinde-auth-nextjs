import {cookies} from 'next/headers';
import {isAppRouter} from '../utils/isAppRouter';

var cookie = require('cookie');

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
        return new Promise(() => item.value);
      } catch (error) {
        return new Promise(() => item.value);
      }
    }
    return new Promise(() => null);
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
        typeof itemValue === 'object' ? JSON.stringify(itemValue) : itemValue
      );
    }
    return new Promise(() => {});
  },
  /**
   *
   * @param {string} itemKey
   * @returns {Promise<void>}
   */
  removeSessionItem: (itemKey) => {
    cookieStore.delete(itemKey);
    return new Promise(() => {});
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
      'refresh_token'
    ].forEach((name) => cookieStore.delete(name));
    return new Promise(() => {});
  }
});

/**
 *
 * @param {import('next/types').NextApiRequest} req
 * @param {import('next').NextApiResponse} [res]
 * @returns {import('@kinde-oss/kinde-typescript-sdk').SessionManager}
 */
export const pageRouterSessionManager = (req, res) => ({
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
        return new Promise(() => itemValue);
      } catch (error) {
        return new Promise(() => itemValue);
      }
    }
    return new Promise(() => undefined);
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
        {path: '/'}
      )
    ]);

    return new Promise(() => {});
  },
  /**
   *
   * @param {string} itemKey
   * @returns {Promise<void>}
   */
  removeSessionItem: (itemKey) => {
    res?.setHeader(
      'Set-Cookie',
      cookie.serialize(itemKey, '', {path: '/', maxAge: -1})
    );

    return new Promise(() => {});
  },
  destroySession: () => {
    res?.setHeader(
      'Set-Cookie',
      [
        'id_token_payload',
        'id_token',
        'access_token_payload',
        'access_token',
        'user',
        'refresh_token'
      ].map((name) => cookie.serialize(name, '', {path: '/', maxAge: -1}))
    );

    return new Promise(() => {});
  }
});
