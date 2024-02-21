import {config} from '../../config/index';
import {cookies} from 'next/headers';

export const setVerifierCookie = (state, code_verifier, options) => {
  cookies().set({
    name: `${config.SESSION_PREFIX}-${state}`,
    value: JSON.stringify({code_verifier, options}),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15
  });
};
