import {KindeAccessToken, KindeIdToken} from '../../types';

export const generateOrganizationObject = (
  idToken: KindeIdToken,
  accessToken: KindeAccessToken
) => {
  if (!idToken || !accessToken) {
    throw new Error('Both idToken and accessToken must be provided');
  }

  if (
    typeof accessToken.org_code !== 'string' ||
    typeof accessToken.org_name !== 'string'
  ) {
    throw new Error('Invalid accessToken structure');
  }
  return {
    orgCode: accessToken.org_code,
    orgName: accessToken.org_name,
    properties: {
      city:
        idToken.organization_properties?.kp_org_city?.v ||
        accessToken.organization_properties?.kp_org_city?.v,
      industry:
        idToken.organization_properties?.kp_org_industry?.v ||
        accessToken.organization_properties?.kp_org_industry?.v,
      postcode:
        idToken.organization_properties?.kp_org_postcode?.v ||
        accessToken.organization_properties?.kp_org_postcode?.v,
      state_region:
        idToken.organization_properties?.kp_org_state_region?.v ||
        accessToken.organization_properties?.kp_org_state_region?.v,
      street_address:
        idToken.organization_properties?.kp_org_street_address?.v ||
        accessToken.organization_properties?.kp_org_street_address?.v,
      street_address_2:
        idToken.organization_properties?.kp_org_street_address_2?.v ||
        accessToken.organization_properties?.kp_org_street_address_2?.v
    }
  };
};
