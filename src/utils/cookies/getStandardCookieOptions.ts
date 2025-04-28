import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { config } from 'src/config';
import { GLOBAL_COOKIE_OPTIONS, TWENTY_NINE_DAYS } from 'src/utils/constants';

export const getStandardCookieOptions = (): Partial<ResponseCookie> => {
  return {
    maxAge: TWENTY_NINE_DAYS,
    domain: config.cookieDomain ? config.cookieDomain : undefined,
    ...GLOBAL_COOKIE_OPTIONS,
  };
};
