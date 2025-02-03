import { serialize, SerializeOptions } from "cookie";
import {
  GLOBAL_COOKIE_OPTIONS,
  MAX_COOKIE_LENGTH,
  TWENTY_NINE_DAYS,
} from "../constants";
import { splitString } from "../splitString";
import { config } from "../../config";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const getSplitCookies = (cookieName: string, cookieValue: string) => {
  return splitString(cookieValue, MAX_COOKIE_LENGTH).map((value, index) => {
    return {
      name: cookieName + (index === 0 ? "" : index),
      value: value,
      options: {
        maxAge: TWENTY_NINE_DAYS,
        domain: config.cookieDomain ? config.cookieDomain : undefined,
        ...GLOBAL_COOKIE_OPTIONS,
      } as Partial<RequestCookie>,
    };
  });
};
