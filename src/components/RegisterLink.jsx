import React from "react";
import { config } from "../config/index";
import { routes } from "../config/index";
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

export function RegisterLink({
  children,
  orgCode,
  postLoginRedirectURL,
  authUrlParams,
  ...props
}) {
  let params = new URLSearchParams();
  let paramsObj = {};
  if (orgCode != null) paramsObj.org_code = orgCode;
  if (postLoginRedirectURL != null)
    paramsObj.post_login_redirect_url = postLoginRedirectURL;

  paramsObj = { ...authUrlParams, ...paramsObj };

  for (const key in paramsObj) params.append(key, paramsObj[key]);
  return (
    <a
      href={`${config.apiPath}/${routes.register}${
        params ? `?${params.toString()}` : ""
      }`}
      {...props}
    >
      {children}
    </a>
  );
}
