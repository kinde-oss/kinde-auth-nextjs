import React from 'react';

import {config} from '../config/index';

export function RegisterLink({
  children,
  orgCode,
  postLoginRedirectURL,
  ...props
}) {
  const params = new URLSearchParams(
    JSON.parse(
      JSON.stringify({
        org_code: orgCode,
        post_login_redirect_url: postLoginRedirectURL
      })
    )
  );

  return (
    <a
      href={`${config.apiPath}/register${
        params ? `?${params.toString()}` : ''
      }`}
      {...props}
    >
      {children}
    </a>
  );
}
