import {jwtDecoder} from '@kinde/jwt-decoder';
import {KindeAccessToken, KindeIdToken} from '../../types';
import {config} from '../config/index';
import {generateUserObject} from '../utils/generateUserObject';
import {generateOrganizationObject} from '../utils/generateOrganizationObject';
import {generateUserOrganizationsObject} from '../utils/generateUserOrganizationsObject';

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

    const accessToken = jwtDecoder<KindeAccessToken>(accessTokenEncoded);

    const idToken = jwtDecoder<KindeIdToken>(idTokenEncoded);

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
      userOrganizations: generateUserOrganizationsObject(idToken, accessToken)
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
