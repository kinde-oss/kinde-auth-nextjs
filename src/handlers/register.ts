import { headers } from "next/headers";
import RouterClient from "../routerClients/RouterClient";
import { isPreFetch } from "../utils/isPreFetch";

/**
 *
 * @param {RouterClient} routerClient
 */
export const register = async (routerClient: RouterClient) => {
  const heads = await headers();
  if (isPreFetch(heads)) {
    return null
  }
  
  const authUrl = await routerClient.kindeClient.register(
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
