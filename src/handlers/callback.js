import {config} from '../config/index';

export const callback = async (routerClient) => {
  await routerClient.kindeClient.handleRedirectToApp(
    routerClient.sessionManager,
    routerClient.getUrl()
  );

  const kindeNextPage =
    routerClient.sessionManager.getSessionItem('kinde_next_page');
  if (kindeNextPage)
    routerClient.sessionManager.removeSessionItem('kinde_next_page');

  console.log('KINDE NEXT PAGE', kindeNextPage);

  const postLoginRedirectURL = kindeNextPage
    ? kindeNextPage
    : config.postLoginRedirectURL;
  // const postLoginRedirectURL = config.postLoginRedirectURL

  routerClient.redirect(postLoginRedirectURL);
};
