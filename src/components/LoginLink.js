import React from 'react';
import {config} from '../config/index';
import {generateAuthUrlParams} from '../utils/generateAuthUrlParams';

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
  const params = generateAuthUrlParams(
    orgCode,
    postLoginRedirectURL,
    authUrlParams
  );

  return (
    <a
      href={`${config.apiPath}/login${params ? `?${params.toString()}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
}
