import React from 'react';

import {config} from '../config/index';

export function LogoutLink({children, ...props}) {
  return (
    <a href={`${config.apiPath}/logout`} {...props}>
      {children}
    </a>
  );
}
