import React from 'react';

export function LoginLink({children, orgCode, ...props}) {
  return (
    <a
      href={`/api/auth/login${orgCode ? `?org_code=${orgCode}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
}
