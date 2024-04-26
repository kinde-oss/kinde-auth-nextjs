import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';
/**
 * @callback getOrganization
 * @returns {Promise<import('../../types').KindeOrganization | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getOrganization}
 */
export const getOrganizationFactory = (req, res) => async () => {
  try {
    const org = await kindeClient.getOrganization(sessionManager(req, res));
    const orgName = await kindeClient.getClaimValue(
      sessionManager(req, res),
      'org_name'
    );
    const orgProperties = await kindeClient.getClaimValue(
      sessionManager(req, res),
      'organization_properties'
    );

    return {
      orgCode: org.orgCode,
      orgName: orgName,
      properties: {
        city: orgProperties?.kp_org_city?.v,
        industry: orgProperties?.kp_org_industry?.v,
        postcode: orgProperties?.kp_org_postcode?.v,
        state_region: orgProperties?.kp_org_state_region?.v,
        street_address: orgProperties?.kp_org_street_address?.v,
        street_address_2: orgProperties?.kp_org_street_address_2?.v
      }
    };
  } catch (error) {
    return null;
  }
};
