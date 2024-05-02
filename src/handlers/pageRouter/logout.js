import {config} from '../../config/index';

var cookie = require('cookie');

export const logout = async (req, res) => {
  res.setHeader('Set-Cookie', [
    cookie.serialize('kinde_token', null, {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: config.redirectURL.substring(0, 6) == 'https:',
      path: '/'
    }),
    cookie.serialize('kinde_token', null, {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: config.redirectURL.substring(0, 6) == 'https:',
      path: '/'
    }),
    cookie.serialize('access_token', null, {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: config.redirectURL.substring(0, 6) == 'https:',
      path: '/'
    }),
    cookie.serialize('id_token', null, {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: config.redirectURL.substring(0, 6) == 'https:',
      path: '/'
    }),
    cookie.serialize('refresh_token', null, {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: config.redirectURL.substring(0, 6) == 'https:',
      path: '/'
    })
  ]);

  const logoutURL = new URL(config.issuerURL + config.issuerRoutes.logout);

  logoutURL.searchParams.set('redirect', config.postLogoutRedirectURL);

  res.redirect(logoutURL.href);
};
