import React from 'react';

import {config} from '../config/index';
/**
 * @typedef {Object} PropsType
 * @prop {React.ReactNode} children
 * @prop {string} [postLogoutRedirectURL]
 *
 * @typedef {PropsType & React.AnchorHTMLAttributes<HTMLAnchorElement>} Props
 */

/**
 * @param {Props} props
 */
export function LogoutLink({children, postLogoutRedirectURL, ...props}) {
  let params = new URLSearchParams();
  let paramsObj = {};
  if (postLogoutRedirectURL != null)
    paramsObj.post_logout_redirect_url = postLogoutRedirectURL;

  for (const key in paramsObj) params.append(key, paramsObj[key]);

  return (
    <a
      href={`${config.apiPath}/logout${params ? `?${params.toString()}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
}
