import jwtDecode from 'jwt-decode';
import {KindeAccessToken, KindeIdToken} from '../../types';
import {config} from '../config/index';
import {generateUserObject} from '../utils/generateUserObject';
import {generateOrganizationObject} from '../utils/generateOrganizationObject';

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

    const accessTokenEncoded =
      await routerClient.sessionManager.getSessionItem('access_token');

    const idTokenEncoded =
      await routerClient.sessionManager.getSessionItem('id_token');

    const accessToken: KindeAccessToken = jwtDecode(accessTokenEncoded);

    const idToken: KindeIdToken = jwtDecode(idTokenEncoded);

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

    const orgName = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'org_name'
    );

    const orgProperties = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'organization_properties'
    );

    const orgNames = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'organizations',
      'id_token'
    );

    return routerClient.json({
      accessToken,
      accessTokenEncoded,
      accessTokenRaw: accessTokenEncoded,
      idToken,
      idTokenRaw: idTokenEncoded,
      idTokenEncoded,
      user: generateUserObject(
        idToken as KindeIdToken,
        accessToken as KindeAccessToken
      ),
      permissions: {
        permissions,
        orgCode: organization
      },
      needsRefresh: false,
      organization: generateOrganizationObject(idToken, accessToken),
      featureFlags,
      userOrganizations: {
        orgCodes: userOrganizations,
        orgs: orgNames?.map((org) => ({
          code: org?.id,
          name: org?.name
        }))
      }
    });
  } catch (error) {
    if (config.isDebugMode) {
      console.debug(error);
    }

    if (error.code == 'ERR_JWT_EXPIRED') {
      return routerClient.json(
        {
          needsRefresh: true
        },
        {status: 200}
      );
    }
    return routerClient.json(
      {
        error
      },
      {status: 500}
    );
  }
};
