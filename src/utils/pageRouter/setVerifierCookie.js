import {config} from '../../config/index';
const cookie = require('cookie');

export const setVerifierCookie = (state, code_verifier, res, options) => {
  const jsonCookieValue = JSON.stringify({
    code_verifier,
    options
  });

  res.setHeader(
    'Set-Cookie',
    cookie.serialize(`${config.SESSION_PREFIX}-${state}`, jsonCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15
    })
  );
  return state;
};
