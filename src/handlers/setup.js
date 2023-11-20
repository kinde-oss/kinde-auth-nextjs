import RouterClient from '../routerClients/RouterClient';

/**
 *
 * @param {RouterClient} routerClient
 * @returns
 */
export const setup = async (routerClient) => {
  const user = await routerClient.sessionManager.getSessionItem('user');
  if (user) {
    const accessToken = await routerClient.sessionManager.getSessionItem(
      'access_token_payload'
    );

    const idToken = await routerClient.sessionManager.getSessionItem(
      'id_token_payload'
    );

    const accessTokenEncoded = await routerClient.sessionManager.getSessionItem(
      'access_token'
    );

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
      accessTokenEncoded,
      idToken,
      user,
      permissions: {
        permissions,
        orgCode: organization
      },
      organization,
      featureFlags,
      userOrganizations
    });
  } else {
    return routerClient.json({error: 'Log in with Kinde'}, {status: 401});
  }
};
