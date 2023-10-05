import React from 'react';

import {config} from '../config/index';

/**
 * @typedef {Object} PropsType
 * @prop {React.ReactNode} children
 * @prop {string} [orgCode]
 * @prop {string} [postLoginRedirectURL]
 *
 * @typedef {PropsType & React.AnchorHTMLAttributes<HTMLAnchorElement>} Props
 */

/**
 * @param {Props} props
 */
export function LoginLink({children, orgCode, ...props}) {
  return (
    <a
      href={`${config.apiPath}/login${orgCode ? `?org_code=${orgCode}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
}
