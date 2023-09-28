import React from 'react';

import {config} from '../config/index';

export function RegisterLink({
  children,
  orgCode,
  postLoginRedirectURL,
  ...props
}) {
  let params = new URLSearchParams();
  if (orgCode !== null) params.append('org_code', orgCode);
  if (postLoginRedirectURL !== null)
    params.append('post_login_redirect_url', postLoginRedirectURL);
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
