import { config } from "../config/index";
import RouterClient from "../routerClients/RouterClient";
import { isPreFetch } from "../utils/isPreFetch";

/**
 *
 * @param {RouterClient} routerClient
 */
export const logout = async (routerClient: RouterClient) => {
  if (isPreFetch(routerClient.req)) {
    return null
  }
  
  const authUrl = await routerClient.kindeClient.logout(
    routerClient.sessionManager,
  );

  let postLogoutRedirectURL =
    routerClient.getSearchParam("post_logout_redirect_url") ||
    config.postLogoutRedirectURL;
  if (postLogoutRedirectURL?.startsWith("/")) {
    postLogoutRedirectURL = config.redirectURL + postLogoutRedirectURL;
  }
  if (postLogoutRedirectURL) {
    authUrl.searchParams.set("redirect", postLogoutRedirectURL);
  }

  return routerClient.redirect(authUrl.toString());
};
