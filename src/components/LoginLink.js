import React from "react";
import { config } from "../config/index";

/**
 * @typedef {Object} PropsType
 * @prop {React.ReactNode} children
 * @prop {string} [orgCode]
 * @prop {string} [postLoginRedirectURL]
 * @prop {Object.<string, string>} [authUrlParams]
 *
 * @typedef {PropsType & React.AnchorHTMLAttributes<HTMLAnchorElement>} Props
 */

/**
 * @param {Props} props
 */
export function LoginLink({
  children,
  postLoginRedirectURL,
  orgCode,
  authUrlParams,
  ...props
}) {
  const params = new URLSearchParams();
  let paramsObj = {};
  if (orgCode != null) paramsObj.org_code = orgCode;
  if (postLoginRedirectURL != null) {
    if (postLoginRedirectURL?.startsWith("/")) {
      const host =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.KINDE_SITE_URL;
      postLoginRedirectURL = `${host}${postLoginRedirectURL}`;
    }
    paramsObj.post_login_redirect_url = postLoginRedirectURL;
  }

  paramsObj = { ...authUrlParams, ...paramsObj };

  for (const key in paramsObj) params.append(key, paramsObj[key]);

  const authUrl = `${config.apiPath}/${process.env.KINDE_AUTH_LOGIN_ROUTE || 'login'}${
    params ? `?${params.toString()}` : ""
  }`;
  return (
    <a href={authUrl} {...props}>
      {children}
    </a>
  );
}
