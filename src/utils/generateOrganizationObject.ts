import {KindeAccessToken, KindeIdToken, KindeOrganization} from '../../types';
import {getClaim} from './getClaim';

export const generateOrganizationObject = (
  idToken: KindeIdToken,
  accessToken: KindeAccessToken
): KindeOrganization | null => {
  if (!idToken || !accessToken) {
    throw new Error('Both idToken and accessToken must be provided');
  }

  if (
    (typeof accessToken.org_code !== 'string' ||
      typeof accessToken.org_name !== 'string') &&
    (typeof accessToken['x-hasura-org-code'] !== 'string' ||
      typeof accessToken['x-hasura-org-name'] !== 'string')
  ) {
    throw new Error('Invalid accessToken structure');
  }

  const orgProperties = getClaim({
    accessToken,
    idToken,
    claim: 'organization_properties'
  });

  return {
    orgCode: getClaim({accessToken, idToken, claim: 'org_code'}) as string,
    orgName: getClaim({accessToken, idToken, claim: 'org_name'}) as string,
    properties: {
      city: orgProperties?.kp_org_city?.v,
      industry: orgProperties?.kp_org_industry?.v,
      postcode: orgProperties?.kp_org_postcode?.v,
      state_region: orgProperties?.state_region?.v,
      street_address: orgProperties?.street_address?.v,
      street_address_2: orgProperties?.street_address_2?.v
    }
  };
};
