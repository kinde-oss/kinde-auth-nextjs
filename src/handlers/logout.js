import RouterClient from '../routerClients/RouterClient';

/**
 *
 * @param {RouterClient} routerClient
 */
export const logout = async (routerClient) => {
  const authUrl = await routerClient.kindeClient.logout(
    routerClient.sessionManager,
    {
      authUrlParams: Object.fromEntries(routerClient.searchParams)
    }
  );

  const postLogoutRedirectURL = routerClient.getSearchParam(
    'post_logout_redirect_url'
  );

  if (postLogoutRedirectURL) {
    await routerClient.sessionManager.setSessionItem(
      'post_logout_redirect_url',
      postLogoutRedirectURL
    );
  }

  routerClient.redirect(authUrl.toString());
};
