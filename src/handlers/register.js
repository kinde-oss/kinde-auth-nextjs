import { NextResponse } from 'next/server';
import RouterClient from '../routerClients/RouterClient';

/**
 *
 * @param {RouterClient} routerClient
 */
export const register = async (routerClient) => {
  const authUrl = await routerClient.kindeClient.register(
    routerClient.sessionManager,
    {
      authUrlParams: Object.fromEntries(routerClient.searchParams)
    }
  );

  const postLoginRedirectURL = routerClient.getSearchParam(
    'post_login_redirect_url'
  );

  if (postLoginRedirectURL) {
    routerClient.sessionManager.setSessionItem(
      'post_login_redirect_url',
      postLoginRedirectURL
    );
  }

  return NextResponse.redirect(authUrl.toString());
};
