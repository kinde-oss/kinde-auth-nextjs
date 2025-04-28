import { MAX_COOKIE_LENGTH } from '../constants';
import { splitString } from '../splitString';
import { getStandardCookieOptions } from 'src/utils/cookies/getStandardCookieOptions';

export const getSplitCookies = (cookieName: string, cookieValue: string) => {
  return splitString(cookieValue, MAX_COOKIE_LENGTH).map((value, index) => {
    return {
      name: cookieName + (index === 0 ? '' : index),
      value: value,
      options: getStandardCookieOptions()
    };
  });
};
