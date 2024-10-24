import {jwtDecoder} from '@kinde/jwt-decoder';
import {KindeAccessToken, KindeIdToken} from '../../types';
import {config} from '../config/index';
import {generateUserObject} from '../utils/generateUserObject';
import {isTokenValid} from '../utils/isTokenValid';
import RouterClient from '../routerClients/RouterClient';

/**
 *
 * @param {RouterClient} routerClient
 * @returns
 */
export const setup = async (routerClient: RouterClient) => {
  try {
    const user = await routerClient.kindeClient.getUser(
      routerClient.sessionManager
    );

    let accessTokenEncoded = (await routerClient.sessionManager.getSessionItem(
      'access_token'
    )) as string;

    if (!isTokenValid(accessTokenEncoded)) {
      await routerClient.kindeClient.refreshTokens(routerClient.sessionManager);
      accessTokenEncoded = (await routerClient.sessionManager.getSessionItem(
        'access_token'
      )) as string;
    }

    const idTokenEncoded = (await routerClient.sessionManager.getSessionItem(
      'id_token'
    )) as string;

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

    const userOrganizations = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'org_codes',
      'id_token'
    );

    const orgName = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'org_name'
    );

    const orgProperties = (await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'organization_properties'
    )) as any;

    const orgNames = (await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'organizations',
      'id_token'
    )) as {id: string; name: string}[];

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
      organization: {
        orgCode: organization,
        orgName,
        properties: {
          city: orgProperties?.kp_org_city?.v,
          industry: orgProperties?.kp_org_industry?.v,
          postcode: orgProperties?.kp_org_postcode?.v,
          state_region: orgProperties?.kp_org_state_region?.v,
          street_address: orgProperties?.kp_org_street_address?.v,
          street_address_2: orgProperties?.kp_org_street_address_2?.v
        }
      },
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
