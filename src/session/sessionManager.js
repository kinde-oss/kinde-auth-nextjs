import {isAppRouter} from '../utils/isAppRouter';
import {cookies} from 'next/headers';

var cookie = require('cookie');

export const sessionManager = (req, res) => {
  if (!req) return appRouterSessionManager(cookies());
  return isAppRouter(req)
    ? appRouterSessionManager(cookies())
    : pageRouterSessionManager(req, res);
};

export const appRouterSessionManager = (cookieStore) => ({
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
    return undefined;
  },
  setSessionItem: (itemKey, itemValue) =>
    cookieStore.set(
      itemKey,
      typeof itemValue === 'object' ? JSON.stringify(itemValue) : itemValue
    ),
  removeSessionItem: (itemKey) => cookieStore.delete(itemKey),
  destroySession: () => {
    [
      'id_token_payload',
      'id_token',
      'access_token_payload',
      'access_token',
      'user',
      'refresh_token'
    ].forEach((name) => cookieStore.delete(name));
  }
});

export const pageRouterSessionManager = (req, res) => ({
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
    return undefined;
  },
  setSessionItem: (itemKey, itemValue) => {
    let cookies = res.getHeader('Set-Cookie') || [];

    if (!Array.isArray(cookies)) {
      cookies = [cookies];
    }

    res.setHeader('Set-Cookie', [
      ...cookies.filter((cookie) => !cookie.startsWith(`${itemKey}=`)),
      cookie.serialize(
        itemKey,
        typeof itemValue === 'object' ? JSON.stringify(itemValue) : itemValue,
        {path: '/'}
      )
    ]);
  },
  removeSessionItem: (itemKey) => {
    res.setHeader(
      'Set-Cookie',
      cookie.serialize(itemKey, '', {path: '/', maxAge: -1})
    );
  },
  destroySession: () => {
    res.setHeader(
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
  }
});
