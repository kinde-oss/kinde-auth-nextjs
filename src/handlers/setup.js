export const setup = async (routerClient) => {
  const user = routerClient.sessionManager.getSessionItem('user');
  if (user) {
    const accessToken = routerClient.sessionManager.getSessionItem(
      'access_token_payload'
    );

    const idToken =
      routerClient.sessionManager.getSessionItem('id_token_payload');

    const permissions = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'permissions'
    );

    const organization = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'org_code'
    );

    const featureFlags = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'feature_flags'
    );

    const userOrganizations = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'org_codes',
      'id_token'
    );

    return routerClient.json({
      accessToken,
      idToken,
      user,
      permissions,
      organization,
      featureFlags,
      userOrganizations
    });
  } else {
    return routerClient.json({error: 'Log in with Kinde'});
  }
};
