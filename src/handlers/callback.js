import {config} from '../config/index';

export const callback = async (routerClient) => {
  const postLoginRedirectURLFromMemory =
    await routerClient.sessionManager.getSessionItem('post_login_redirect_url');

  if (postLoginRedirectURLFromMemory) {
    await routerClient.sessionManager.removeSessionItem(
      'post_login_redirect_url'
    );
  }

  const postLoginRedirectURL = postLoginRedirectURLFromMemory
    ? postLoginRedirectURLFromMemory
    : config.postLoginRedirectURL;

  await routerClient.kindeClient.handleRedirectToApp(
    routerClient.sessionManager,
    routerClient.getUrl()
  );

  routerClient.redirect(postLoginRedirectURL);
};
