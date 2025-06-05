import { getHeaders } from "src/utils/getHeaders";
import RouterClient from "../routerClients/RouterClient";
import validateState from "../utils/validateState";
import { isPreFetch } from "src/utils/isPreFetch";

/**
 *
 * @param {RouterClient} routerClient
 */
export const createOrg = async (routerClient) => {
  const headers = await getHeaders(routerClient.req);
  if (isPreFetch(headers)) {
    return routerClient.json({ message: "Prefetch skipped" }, { status: 200 });
  }

  const org_name = routerClient.getSearchParam("org_name");
  const options = {
    org_name: org_name ?? undefined,
    is_create_org: true,
  };

  const passedState = routerClient.searchParams.get("state");

  if (passedState) {
    if (!validateState(passedState)) {
      throw new Error("Invalid state supplied");
    }

    routerClient.sessionManager.setSessionItem("state", passedState);
  }

  const authUrl = await routerClient.kindeClient.createOrg(
    routerClient.sessionManager,
    options,
  );

  return routerClient.redirect(authUrl.toString());
};
