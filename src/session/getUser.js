import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';

/**
 * @callback getUser
 * @returns {Promise<import('../../types').KindeUser | null>}
 */
/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getUser}
 */
export const getUserFactory = (req, res) => async () => {
  try {
    // @ts-ignore
    const user = await kindeClient.getUser(sessionManager(req, res));
    const userProperties = await kindeClient.getClaimValue(
      sessionManager(req, res),
      'user_properties'
    );
    return {
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
    };
  } catch (error) {
    return null;
  }
};
