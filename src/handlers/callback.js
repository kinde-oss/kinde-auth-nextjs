import {config} from '../config/index';
import RouterClient from '../routerClients/RouterClient';
import {getKindeServerSession} from './protect';

/**
 *
 * @param {RouterClient} routerClient
 */
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
  try {
    await routerClient.kindeClient.handleRedirectToApp(
      routerClient.sessionManager,
      routerClient.getUrl()
    );
  } catch (error) {
    if (config.isDebugMode) {
      console.error('callback', error);
    }
    return routerClient.json({error: error.message}, {status: 500});
  }
  if (postLoginRedirectURL) {
    if (postLoginRedirectURL.startsWith('http')) {
      return routerClient.redirect(postLoginRedirectURL);
    }
    return routerClient.redirect(
      `${routerClient.clientConfig.siteUrl}${postLoginRedirectURL}`
    );
  }

  return routerClient.redirect(routerClient.clientConfig.siteUrl);
};
