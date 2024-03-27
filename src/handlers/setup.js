import jwtDecode from 'jwt-decode';
import RouterClient from '../routerClients/RouterClient';

/**
 *
 * @param {RouterClient} routerClient
 * @returns
 */
export const setup = async (routerClient) => {
  try {
    const user = await routerClient.kindeClient.getUser(
      routerClient.sessionManager
    );

    const accessTokenEncoded = await routerClient.sessionManager.getSessionItem(
      'access_token'
    );

    const idTokenEncoded = await routerClient.sessionManager.getSessionItem(
      'id_token'
    );

    const accessToken = jwtDecode(accessTokenEncoded);

    const idToken = jwtDecode(idTokenEncoded);

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
      accessTokenRaw: accessTokenEncoded,
      idToken,
      idTokenRaw: idTokenEncoded,
      idTokenEncoded,
      user,
      permissions: {
        permissions,
        orgCode: organization
      },
      organization,
      featureFlags,
      userOrganizations
    });
  } catch (error) {}
  return routerClient.json({error: 'Log in with Kinde'}, {status: 401});
};
