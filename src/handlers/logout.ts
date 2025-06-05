import { config } from "../config/index";
import RouterClient from "../routerClients/RouterClient";
import { isPreFetch } from "../utils/isPreFetch";
import { getHeaders } from "../utils/getHeaders";

/**
 *
 * @param {RouterClient} routerClient
 */
export const logout = async (routerClient: RouterClient) => {
  const headers = await getHeaders(routerClient.req);
  if (isPreFetch(headers)) {
    return routerClient.json({ message: "Prefetch skipped" }, { status: 200 });
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
