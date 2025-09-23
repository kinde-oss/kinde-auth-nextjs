import RouterClient from "../routerClients/RouterClient";
import { isPreFetch } from "../utils/isPreFetch";
import { getHeaders } from "../utils/getHeaders";
import validateState from "../utils/validateState";

/**
 *
 * @param {RouterClient} routerClient
 */
export const login = async (routerClient: RouterClient) => {
  const headers = await getHeaders(routerClient.req);
  if (isPreFetch(headers)) {
    return null;
  }

  const passedState = routerClient.searchParams.get("state");

  if (passedState) {
    if (!validateState(passedState)) {
      throw new Error("Invalid state supplied");
    }

    await routerClient.sessionManager.setSessionItem("state", passedState);
  }

  const authUrl = await routerClient.kindeClient.login(
    routerClient.sessionManager,
    {
      authUrlParams: {
        ...Object.fromEntries(routerClient.searchParams),
        supports_reauth: "true",
      },
    },
  );

  const postLoginRedirectURL = routerClient.getSearchParam(
    "post_login_redirect_url",
  );

  if (postLoginRedirectURL) {
    await routerClient.sessionManager.setSessionItem(
      "post_login_redirect_url",
      postLoginRedirectURL,
    );
  }

  return routerClient.redirect(authUrl.toString());
};
