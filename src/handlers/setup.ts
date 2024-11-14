import {jwtDecoder} from '@kinde/jwt-decoder';
import {
  KindeAccessToken,
  KindeFlagRaw,
  KindeIdToken,
  KindeSetupResponse,
  KindeTokenOrganizationProperties
} from '../../types';
import {config} from '../config/index';
import RouterClient from '../routerClients/RouterClient';
import {getAccessTokenWithRefresh} from '../session/getAccessTokenWithRefresh';
import {generateUserObject} from '../utils/generateUserObject';

/**
 *
 * @param {RouterClient} routerClient
 * @returns
 */
export const setup = async (routerClient: RouterClient) => {
  try {
    const accessToken = await getAccessTokenWithRefresh(
      routerClient.req,
      routerClient.res
    );

    const accessTokenEncoded =
      (await routerClient.sessionManager.getSessionItem(
        'access_token'
      )) as string;

    const idTokenEncoded = (await routerClient.sessionManager.getSessionItem(
      'id_token'
    )) as string;

    const idToken = jwtDecoder<KindeIdToken>(idTokenEncoded as string);

    const permissions = (await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'permissions'
    )) as string[];

    const organization = (await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'org_code'
    )) as string;

    const featureFlags = (await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'feature_flags'
    )) as Record<string, KindeFlagRaw>;

    const userOrganizations = (await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'org_codes',
      'id_token'
    )) as string[];

    const orgName = (await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'org_name'
    )) as string;

    const orgProperties = (await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'organization_properties'
    )) as KindeTokenOrganizationProperties;

    const orgNames = (await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'organizations',
      'id_token'
    )) as Array<{id: string; name: string}>;

    const res: KindeSetupResponse = {
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
    };

    return routerClient.json(res, {status: 200});
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
