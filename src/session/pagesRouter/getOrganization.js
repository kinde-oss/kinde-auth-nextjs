import {getClaim} from './getClaim';

export const getOrganization = (req, res) => {
  const orgCode = getClaim(req, res, 'org_code');
  return {
    orgCode
  };
};
