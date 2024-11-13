import {KindeAccessToken, KindeIdToken, KindeOrganizations} from '../../types';
import {getClaim} from './getClaim';

export const generateUserOrganizationsObject = (
  idToken: KindeIdToken,
  accessToken: KindeAccessToken
): KindeOrganizations | null => {
  if (!idToken || !accessToken) {
    throw new Error('Both idToken and accessToken must be provided');
  }
  const orgCodes = getClaim({
    accessToken,
    idToken,
    claim: 'org_codes'
  }) as string[];

  const orgs = getClaim({accessToken, idToken, claim: 'organizations'}) as {
    id: string;
    name: string;
  }[];

  return {
    orgCodes,
    orgs: orgs.map((org) => ({
      code: org?.id,
      name: org?.name
    }))
  };
};
