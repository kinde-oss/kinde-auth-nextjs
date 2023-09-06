import React from 'react';

import {config} from '../config/index';

export function RegisterLink({children, orgCode, ...props}) {
  return (
    <a
      href={`${config.apiPath}/register${orgCode ? `?org_code=${orgCode}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
}
