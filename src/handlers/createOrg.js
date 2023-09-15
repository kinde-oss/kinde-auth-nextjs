export const createOrg = async (routerClient) => {
  const org_name = routerClient.getSearchParam('org_name');
  const options = {
    org_name,
    is_create_org: true
  };

  const authUrl = await routerClient.kindeClient.createOrg(
    routerClient.sessionManager,
    options
  );

  routerClient.redirect(authUrl);
};
