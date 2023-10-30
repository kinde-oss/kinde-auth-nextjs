export const login = async (routerClient) => {
  const authUrl = await routerClient.kindeClient.login(
    routerClient.sessionManager
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

  routerClient.redirect(authUrl);
};
