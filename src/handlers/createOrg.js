import RouterClient from '../routerClients/RouterClient';

/**
 *
 * @param {RouterClient} routerClient
 */
export const createOrg = async (routerClient) => {
  const org_name = routerClient.getSearchParam('org_name');
  const options = {
    org_name: org_name ?? undefined,
    is_create_org: true
  };

  const authUrl = await routerClient.kindeClient.createOrg(
    routerClient.sessionManager,
    options
  );

  return routerClient.redirect(authUrl.toString());
};
