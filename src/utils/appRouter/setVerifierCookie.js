import {config} from '../../config/index';
import {cookies} from 'next/headers';

export const setVerifierCookie = (state, code_verifier) => {
  cookies().set({
    name: `${config.SESSION_PREFIX}-${state}`,
    value: code_verifier,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 15
  });
};
