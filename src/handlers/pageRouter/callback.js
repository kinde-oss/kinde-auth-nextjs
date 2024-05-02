import jwt_decode from 'jwt-decode';

import {config} from '../../config/index';
import {isTokenValid} from '../../utils/pageRouter/isTokenValid';
import {version} from '../../utils/version';
import {sanitizeRedirect} from '../../utils/sanitizeRedirect';
import {generateCallbackUrl} from '../../utils/generateCallbackUrl';

var cookie = require('cookie');

export const callback = async (req, res) => {
  const {code, state} = req.query;
  const jsonCookieValue = cookie.parse(req.headers.cookie || '')[
    `${config.SESSION_PREFIX}-${state}`
  ];

  let redirectUrl = config.postLoginRedirectURL || config.redirectURL;

  if (jsonCookieValue) {
    try {
      const {code_verifier, options} = JSON.parse(jsonCookieValue);

      if (options?.post_login_redirect_url) {
        redirectUrl = sanitizeRedirect({
          baseUrl: new URL(config.redirectURL).origin,
          url: options.post_login_redirect_url
        });
      }

      const response = await fetch(
        config.issuerURL + config.issuerRoutes.token,
        {
          method: 'POST',
          headers: new Headers({
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Kinde-SDK': `"NextJS"/${version}`
          }),
          body: new URLSearchParams({
            client_id: config.clientID,
            client_secret: config.clientSecret,
            code,
            code_verifier,
            grant_type: 'authorization_code',
            redirect_uri: generateCallbackUrl(
              config.redirectURL,
              config.redirectRoutes.callback
            )
          })
        }
      );
      const data = await response.json();

      const accessToken = jwt_decode(data.access_token);
      if (isTokenValid(data)) {
        res.setHeader('Set-Cookie', [
          cookie.serialize(`kinde_token`, JSON.stringify(data), {
            httpOnly: true,
            expires: new Date(accessToken.exp * 1000),
            sameSite: 'lax',
            secure: config.redirectURL.substring(0, 6) == 'https:',
            path: '/',
            domain: config.cookieDomain ? config.cookieDomain : undefined
          }),
          cookie.serialize(`access_token`, data.access_token, {
            httpOnly: true,
            expires: new Date(accessToken.exp * 1000),
            sameSite: 'lax',
            secure: config.redirectURL.substring(0, 6) == 'https:',
            path: '/',
            domain: config.cookieDomain ? config.cookieDomain : undefined
          }),
          cookie.serialize(`id_token`, data.id_token, {
            httpOnly: true,
            expires: new Date(accessToken.exp * 1000),
            sameSite: 'lax',
            secure: config.redirectURL.substring(0, 6) == 'https:',
            path: '/',
            domain: config.cookieDomain ? config.cookieDomain : undefined
          }),
          cookie.serialize(`refresh_token`, data.refresh_token, {
            httpOnly: true,
            expires: new Date(accessToken.exp * 1000),
            sameSite: 'lax',
            secure: config.redirectURL.substring(0, 6) == 'https:',
            path: '/',
            domain: config.cookieDomain ? config.cookieDomain : undefined
          })
        ]);
      } else {
        console.error('One or more of the claims were not verified.');
      }
    } catch (err) {
      console.error(err);
    }

    res.redirect(redirectUrl);
  } else {
    const logoutURL = new URL(config.issuerURL + config.issuerRoutes.logout);
    logoutURL.searchParams.set('redirect', config.postLogoutRedirectURL);
    res.redirect(logoutURL.href);
  }
};
