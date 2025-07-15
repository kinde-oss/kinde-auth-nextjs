import { MAX_COOKIE_LENGTH } from "../constants";
import { getStandardCookieOptions } from "../../utils/cookies/getStandardCookieOptions";
import { splitString } from "@kinde/js-utils";

export const getSplitCookies = (cookieName: string, cookieValue: string) => {
  return splitString(cookieValue, MAX_COOKIE_LENGTH).map((value, index) => {
    return {
      name: cookieName + (index === 0 ? "" : index),
      value: value,
      options: getStandardCookieOptions(),
    };
  });
};
