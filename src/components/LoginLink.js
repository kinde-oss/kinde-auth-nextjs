import React from 'react';

import {config} from '../config/index';

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
