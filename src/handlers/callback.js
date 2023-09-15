import {config} from '../config/index';

export const callback = async (routerClient) => {
  await routerClient.kindeClient.handleRedirectToApp(
    routerClient.sessionManager,
    routerClient.getUrl()
  );

  routerClient.redirect(config.postLoginRedirectURL);
};
