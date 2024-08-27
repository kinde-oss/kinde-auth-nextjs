import jwtDecode from 'jwt-decode';
import RouterClient from '../routerClients/RouterClient';
import {config} from '../config/index';
import {generateUserObject} from '../utils/generateUserObject';

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

    const orgName = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'org_name'
    );

    const orgProperties = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'organization_properties'
    );

    const userProperties = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'user_properties'
    );

    const phone_number = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'phone_number',
      'id_token'
    );
    const username = await routerClient.kindeClient.getClaimValue(
      routerClient.sessionManager,
      'preferred_username',
      'id_token'
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
      user: generateUserObject(user, userProperties, phone_number, username),
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
