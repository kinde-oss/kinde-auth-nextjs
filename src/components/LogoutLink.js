import React from 'react';

import {config} from '../config/index';
/**
 * @typedef {Object} PropsType
 * @prop {React.ReactNode} children
 *
 * @typedef {PropsType & React.AnchorHTMLAttributes<HTMLAnchorElement>} Props
 */

/**
 * @param {Props} props
 */
export function LogoutLink({children, ...props}) {
  return (
    <a href={`${config.apiPath}/logout`} {...props}>
      {children}
    </a>
  );
}
