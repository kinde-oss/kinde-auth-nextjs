import { KindeAccessToken, KindeIdToken, KindeUser } from "../types";
import removeUndefined from "./removeUndefined";

type CustomPropertyType = Record<string, any>;
export const generateUserObject = (
  idToken: KindeIdToken,
  accessToken: KindeAccessToken,
) => {
  const user: KindeUser<CustomPropertyType> = {
    id: idToken.sub,
    email: idToken.email,
    family_name: idToken.family_name,
    given_name: idToken.given_name,
    picture: idToken.picture,
    username: idToken.preferred_username,
    phone_number: idToken.phone_number,
  };
  let res = user;

  const orgIdTokenProperties =
    idToken.user_properties || idToken["x-hasura-user_properties"] || {};
  const orgAccessTokenProperties =
    accessToken.user_properties ||
    accessToken["x-hasura-user_properties"] ||
    {};

  const properties = { ...orgIdTokenProperties, ...orgAccessTokenProperties };

  if (properties) {
    const {
      kp_usr_city: cityObj,
      kp_usr_industry: industryObj,
      kp_usr_is_marketing_opt_in: isMarketingOptInObj,
      kp_usr_job_title: jobTitleObj,
      kp_usr_middle_name: middleNameObj,
      kp_usr_postcode: postcodeObj,
      kp_usr_salutation: salutationObj,
      kp_usr_state_region: stateRegionObj,
      kp_usr_street_address: streetAddressObj,
      kp_usr_street_address_2: streetAddress2Obj,
    } = properties;

    const sanitizedRest: Record<string, any> = Object.keys(properties).reduce(
      (acc, key) => {
        acc[key] = properties[key]?.v;
        return acc;
      },
      {},
    );
    res = {
      ...removeUndefined(user),
      properties: removeUndefined({
        city: cityObj?.v,
        industry: industryObj?.v,
        is_marketing_opt_in: isMarketingOptInObj?.v,
        job_title: jobTitleObj?.v,
        middle_name: middleNameObj?.v,
        postcode: postcodeObj?.v,
        salutation: salutationObj?.v,
        state_region: stateRegionObj?.v,
        street_address: streetAddressObj?.v,
        street_address_2: streetAddress2Obj?.v,
        ...sanitizedRest,
      }),
    };
  }
  return res;
};
