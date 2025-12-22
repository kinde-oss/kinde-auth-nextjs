import RouterClient from "../routerClients/RouterClient";
import { isPreFetch } from "../utils/isPreFetch";
import { getHeaders } from "../utils/getHeaders";
import {
  generatePortalUrl,
  MemoryStorage,
  PortalPage,
  setActiveStorage,
  StorageKeys,
} from "@kinde-oss/kinde-auth-react/utils";
import { isValidEnumValue } from "../utils/isValidEnumValue";
import { config, routes } from "../config";

/**
 *
 * @param {RouterClient} routerClient
 */
export const portal = async (routerClient: RouterClient) => {
  const headers = await getHeaders(routerClient.req);
  if (isPreFetch(headers)) {
    return null;
  }

  const storage = new MemoryStorage();
  setActiveStorage(storage);

  const accessToken =
    await routerClient.sessionManager.getSessionItem("access_token");

  if (!accessToken) {
    return routerClient.redirect(`${config.apiPath}/${routes.login}`);
  }

  await storage.setSessionItem(StorageKeys.accessToken, accessToken);
  const returnUrl =
    routerClient.searchParams.get("returnUrl") || config.redirectURL;
  try {
    const subNavParam = routerClient.searchParams.get("subNav");
    const subNav = isValidEnumValue(PortalPage, subNavParam)
      ? (subNavParam as PortalPage)
      : undefined;
    const generateResult = await generatePortalUrl({
      subNav,
      returnUrl,
      domain: config.issuerURL,
    });
    if (generateResult.url) {
      return routerClient.redirect(generateResult.url.toString());
    }
  } catch (error) {
    console.error("Portal URL generation failed:", error);
    return routerClient.redirect(config.redirectURL);
  }
};
