import React from 'react';

export function LogoutLink({children, ...props}) {
  return (
    <a href="/api/auth/logout" {...props}>
      {children}
    </a>
  );
}
