import {jwtDecoder} from '@kinde/jwt-decoder';
import {KindeAccessToken, KindeIdToken} from '../../types';
import {config} from '../config/index';
import {generateUserObject} from '../utils/generateUserObject';
import { validateToken } from '@kinde/jwt-validator';
import { refreshTokens } from '../utils/refreshTokens';

/**
 *
 * @param {RouterClient} routerClient
 * @returns
 */
export const setup = async (routerClient) => {
  try {
    let accessTokenEncoded =
      await routerClient.sessionManager.getSessionItem('access_token');

    const isAccessTokenValid = await validateToken({
      token: accessTokenEncoded
    })

    if (!accessTokenValidation.valid) {
      if (!await refreshTokens(routerClient.sessionManager)) {
        throw new Error('Invalid access token and refresh');
      }
      accessTokenEncoded = await routerClient.sessionManager.getSessionItem('access_token');
    }

    let idTokenEncoded =
      await routerClient.sessionManager.getSessionItem('id_token');


    const isIdTokenValid = await validateToken({
      token: idTokenEncoded
    })

    if (!idTokenValidation.valid) {
      if (!await refreshTokens(routerClient.sessionManager)) {
        throw new Error('Invalid access token and refresh');
      }
      idTokenEncoded = await routerClient.sessionManager.getSessionItem('id_token');
    }

    const accessToken = jwtDecoder<KindeAccessToken>(accessTokenEncoded);
    const idToken = jwtDecoder<KindeIdToken>(idTokenEncoded);

    const permissions = accessToken.permissions;

    const organization = accessToken.org_code;
    const featureFlags = accessToken.feature_flags;
    const userOrganizations = idToken.org_codes;
    const orgName = accessToken.org_name;
    const orgProperties = accessToken.organization_properties;
    const orgNames = idToken.organizations;

    if (!accessToken.permissions || !idToken.org_codes) {
      throw new Error('Missing required claims in tokens');
    }

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
