import {config} from '../../config/index';
import {cookies} from 'next/headers';
import {GLOBAL_COOKIE_OPTIONS} from '../../session/sessionManager';

export const setVerifierCookie = (state, code_verifier, options) => {
  cookies().set({
    name: `${config.SESSION_PREFIX}-${state}`,
    value: JSON.stringify({code_verifier, options}),
    maxAge: 60 * 15,
    ...GLOBAL_COOKIE_OPTIONS
  });
};
