import RouterClient from "../routerClients/RouterClient";
import { isPreFetch } from "../utils/isPreFetch";
import { getHeaders } from "../utils/getHeaders";

/**
 *
 * @param {RouterClient} routerClient
 */
export const login = async (routerClient: RouterClient) => {
  const headers = await getHeaders(routerClient.req);
  if (isPreFetch(headers)) {
    return null;
  }
  
  const authUrl = await routerClient.kindeClient.login(
    routerClient.sessionManager,
    {
      authUrlParams: Object.fromEntries(routerClient.searchParams),
    },
  );

  const postLoginRedirectURL = routerClient.getSearchParam(
    "post_login_redirect_url",
  );

  if (postLoginRedirectURL) {
    routerClient.sessionManager.setSessionItem(
      "post_login_redirect_url",
      postLoginRedirectURL,
    );
  }

  return routerClient.redirect(authUrl.toString());
};
