import {KindeAccessToken, KindeIdToken, KindeOrganizations} from '../../types';
import {getClaim} from './getClaim';

export const generateUserOrganizationsObject = (
  idToken: KindeIdToken,
  accessToken: KindeAccessToken
): KindeOrganizations => {
  if (!idToken) {
    throw new Error('idToken must be provided');
  }
  if (!accessToken) {
    throw new Error('accessToken must be provided');
  }

  const orgCodes = getClaim({
    accessToken,
    idToken,
    claim: 'org_codes'
  });

  if (!Array.isArray(orgCodes)) {
    throw new Error('org_codes claim must be an array of strings');
  }

  const orgs = getClaim({accessToken, idToken, claim: 'organizations'}) as
    | {
        id: string;
        name: string;
      }[]
    | undefined;

  if (!Array.isArray(orgs)) {
    throw new Error('organizations claim must be an array of objects');
  }

  if (
    !orgs.every(
      (org) => typeof org?.id === 'string' && typeof org?.name === 'string'
    )
  ) {
    throw new Error(
      'Each organization must have string id and name properties'
    );
  }

  return {
    orgCodes,
    orgs: orgs.map((org) => ({
      code: org?.id,
      name: org?.name
    }))
  };
};
