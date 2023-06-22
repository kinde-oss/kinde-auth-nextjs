import React from 'react';

export function CreateOrgLink({children, orgName, ...props}) {
  return (
    <a
      href={`/api/auth/create_org${orgName ? `?org_name=${orgName}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
}
