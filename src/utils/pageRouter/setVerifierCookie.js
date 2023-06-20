import {config} from '../../config/index';
const cookie = require('cookie');

export const setVerifierCookie = (state, code_verifier, res) => {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(`${config.SESSION_PREFIX}-${state}`, code_verifier, {
      httpOnly: true,
      maxAge: 60 * 15
    })
  );
  return state;
};
