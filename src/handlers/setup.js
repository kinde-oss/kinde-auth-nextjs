import jwtDecode from 'jwt-decode';
import RouterClient from '../routerClients/RouterClient';
import {config} from '../config/index';

/**
 *
 * @param {RouterClient} routerClient
 * @returns
 */
export const setup = async (routerClient) => {
  // check if we have the user in the session
  // check expiry on tokens
  // use refreshtoken to get new tokens
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
      user: {
        ...user,
        properties: {
          city: userProperties?.kp_usr_city?.v,
          industry: userProperties?.kp_usr_industry?.v,
          job_title: userProperties?.kp_usr_job_title?.v,
          middle_name: userProperties?.kp_usr_middle_name?.v,
          postcode: userProperties?.kp_usr_postcode?.v,
          salutation: userProperties?.kp_usr_salutation?.v,
          state_region: userProperties?.kp_usr_state_region?.v,
          street_address: userProperties?.kp_usr_street_address?.v,
          street_address_2: userProperties?.kp_usr_street_address_2?.v
        }
      },
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
    });
  } catch (error) {
    if (config.isDebugMode) {
      console.error(error);
    }
  }
  // return routerClient.json({}, {status: 204});
  return new Response(null, {
    status: 204
  });
};
