import { config, routes } from "../config/index";
import RouterClient from "../routerClients/RouterClient";
import {
  isSafePostLoginRedirect,
  toPostLoginRedirectUrl,
} from "../utils/isSafePostLoginRedirect";

const redirectToLogin = (routerClient: RouterClient) => {
  const loginUrl = new URL(
    `${config.redirectURL}${config.apiPath}/${routes.login}`,
  );
  const state = routerClient.getSearchParam("state");
  if (state) {
    loginUrl.searchParams.set("state", state);
  }
  return routerClient.redirect(loginUrl.toString());
};

export const callback = async (routerClient: RouterClient) => {
  const errorParam = routerClient.getSearchParam("error");
  if (errorParam) {
    if (errorParam?.toLowerCase() === "login_link_expired") {
      const reauthState = routerClient.getSearchParam("reauth_state");
      if (reauthState) {
        try {
          const decodedAuthState = atob(reauthState);
          const parsedReauthState = JSON.parse(decodedAuthState);
          if (parsedReauthState) {
            const urlParams = new URLSearchParams(parsedReauthState);
            const loginRoute = new URL(
              `${config.redirectURL}${config.apiPath}/${routes.login}`,
            );
            loginRoute.search = urlParams.toString();
            return routerClient.redirect(loginRoute.toString());
          }
        } catch {
          return redirectToLogin(routerClient);
        }
      }
      return redirectToLogin(routerClient);
    }
    return redirectToLogin(routerClient);
  }

  const postLoginRedirectURLFromMemory =
    (await routerClient.sessionManager.getSessionItem(
      "post_login_redirect_url",
    )) as string;

  if (postLoginRedirectURLFromMemory) {
    await routerClient.sessionManager.removeSessionItem(
      "post_login_redirect_url",
    );
  }

  const postLoginRedirectURL = postLoginRedirectURLFromMemory
    ? postLoginRedirectURLFromMemory
    : config.postLoginRedirectURL;
  try {
    await routerClient.kindeClient.handleRedirectToApp(
      routerClient.sessionManager,
      routerClient.getUrl(),
    );
  } catch (error) {
    if (config.isDebugMode) {
      console.error("callback", error);
    }

    if (error.message.includes("Expected: State not found")) {
      return routerClient.json(
        {
          error:
            `Error: State not found.\nTo resolve this error please visit our docs https://docs.kinde.com/developer-tools/sdks/backend/nextjs-sdk/#state-not-found-error` +
            error.message,
        },
        { status: 500 },
      );
    }

    return routerClient.json({ error: error.message }, { status: 500 });
  }

  const state = (await routerClient.sessionManager.getSessionItem(
    "state",
  )) as string;
  await routerClient.sessionManager.removeSessionItem("state");

  const siteUrl = routerClient.clientConfig.siteUrl;
  const isAllowed =
    !!postLoginRedirectURL &&
    isSafePostLoginRedirect({
      raw: postLoginRedirectURL,
      siteUrl,
      allowedURLRegex: config.postLoginAllowedURLRegex,
      isServerConfiguredDefault:
        !postLoginRedirectURLFromMemory &&
        postLoginRedirectURL === config.postLoginRedirectURL,
    });

  if (isAllowed) {
    const url = toPostLoginRedirectUrl(postLoginRedirectURL, siteUrl);
    state && url.searchParams.set("state", state);
    return routerClient.redirect(url.toString());
  }

  if (postLoginRedirectURL && config.isDebugMode) {
    console.warn("Blocked post-login redirect to", postLoginRedirectURL);
  }

  const url = new URL(siteUrl);
  state && url.searchParams.set("state", state);
  return routerClient.redirect(url.toString());
};
