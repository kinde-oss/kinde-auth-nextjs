import RouterClient from "../routerClients/RouterClient";
import { getHeaders } from "../utils/getHeaders";
import { isPreFetch } from "../utils/isPreFetch";
import validateState from "../utils/validateState";

/**
 *
 * @param {RouterClient} routerClient
 */
export const register = async (routerClient: RouterClient) => {
  const headers = await getHeaders(routerClient.req);
  if (isPreFetch(headers)) {
    return null;
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

  const passedState = routerClient.searchParams.get("state");

  if (passedState) {
    if (!validateState(passedState)) {
      throw new Error("Invalid state supplied");
    }
    
    routerClient.sessionManager.setSessionItem("state", passedState);
  }

  return routerClient.redirect(authUrl.toString());
};
