import {config} from '../config/index';

export const callback = async (routerClient) => {
  await routerClient.kindeClient.handleRedirectToApp(
    routerClient.sessionManager,
    routerClient.getUrl()
  );

  const postLoginRedirectURL = routerClient.getSearchParam(
    'post_login_redirect_url'
  )
    ? routerClient.getSearchParam('post_login_redirect_url')
    : config.postLoginRedirectURL;

  routerClient.redirect(postLoginRedirectURL);
};
