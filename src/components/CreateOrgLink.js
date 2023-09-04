import React from 'react';

import {config} from '../config/index';

export function CreateOrgLink({children, orgName, ...props}) {
  return (
    <a
      href={`${config.apiPath}/create_org${orgName ? `?org_name=${orgName}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
}
