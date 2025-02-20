import RouterClient from "../routerClients/RouterClient";
import validateState from "../utils/validateState";

/**
 *
 * @param {RouterClient} routerClient
 */
export const createOrg = async (routerClient) => {
  const org_name = routerClient.getSearchParam("org_name");
  const options = {
    org_name: org_name ?? undefined,
    is_create_org: true,
  };

  const passedState = routerClient.searchParams.get("state");

  if (validateState(passedState)) {
    throw new Error("Invalid state supplied");
  }

  if (passedState) {
    routerClient.sessionManager.setSessionItem("state", passedState);
  }

  const authUrl = await routerClient.kindeClient.createOrg(
    routerClient.sessionManager,
    options,
  );

  return routerClient.redirect(authUrl.toString());
};
