import React from 'react';

export function RegisterLink({children, orgCode, ...props}) {
  return (
    <a
      href={`/api/auth/register${orgCode ? `?org_code=${orgCode}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
}
