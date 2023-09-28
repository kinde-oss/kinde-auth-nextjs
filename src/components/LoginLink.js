import React from 'react';

import {config} from '../config/index';

export function LoginLink({children, postLoginRedirectURL, orgCode, ...props}) {
  let params = new URLSearchParams();
  if (orgCode !== null) params.append('org_code', orgCode);
  if (postLoginRedirectURL !== null)
    params.append('post_login_redirect_url', postLoginRedirectURL);
  return (
    <a
      href={`${config.apiPath}/login${params ? `?${params.toString()}` : ''}`}
      {...props}
    >
      {children}
    </a>
  );
}
