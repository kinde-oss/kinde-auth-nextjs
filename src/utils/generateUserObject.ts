import {
  KindeAccessToken,
  KindeIdToken,
  KindeUser,
  KindeUserProperties
} from '../../types';

const getUserProperties = <T>(
  properties: Record<string, {v: string}>
): KindeUserProperties<
  T,
  {
    kp_usr_city: 'city';
    kp_usr_industry: 'industry';
    kp_usr_job_title: 'job_title';
    kp_usr_middle_name: 'middle_name';
    kp_usr_postcode: 'postcode';
    kp_usr_salutation: 'salutation';
    kp_usr_state_region: 'state_region';
    kp_usr_street_address: 'street_address';
    kp_usr_street_address_2: 'street_address_2';
  }
> => {
  const userProperties: KindeUserProperties<
    T,
    {
      kp_usr_city: 'city';
      kp_usr_industry: 'industry';
      kp_usr_job_title: 'job_title';
      kp_usr_middle_name: 'middle_name';
      kp_usr_postcode: 'postcode';
      kp_usr_salutation: 'salutation';
      kp_usr_state_region: 'state_region';
      kp_usr_street_address: 'street_address';
      kp_usr_street_address_2: 'street_address_2';
    }
  > = Object.keys(properties).reduce((acc, key) => {
    if (key.startsWith('kp_usr_')) {
      acc[key.substring(7)] = properties[key]?.v;
    }
    acc[key] = properties[key]?.v;
    return acc;
  }, {});

  return userProperties;
};

export const generateUserObject = (idToken: KindeIdToken): KindeUser => {
  const user = {
    id: idToken.sub,
    email: idToken.email,
    family_name: idToken.family_name,
    given_name: idToken.given_name,
    name: idToken.name,
    picture: idToken.picture,
    username: idToken.preferred_username,
    phone_number: idToken.phone_number
  };

  const properties = idToken.properties;

  if (properties) {
  }

  let res = user;
  if (userProperties) {
    const {
      kp_usr_city: cityObj,
      kp_usr_industry: industryObj,
      kp_usr_job_title: jobTitleObj,
      kp_usr_middle_name: middleNameObj,
      kp_usr_postcode: postcodeObj,
      kp_usr_salutation: salutationObj,
      kp_usr_state_region: stateRegionObj,
      kp_usr_street_address: streetAddressObj,
      kp_usr_street_address_2: streetAddress2Obj,
      ...rest
    } = userProperties;

    const sanitizedRest = Object.keys(rest).reduce((acc, key) => {
      acc[key] = rest[key]?.v;
      return acc;
    }, {});

    res = {
      ...res,
      properties: {
        city: cityObj?.v,
        industry: industryObj?.v,
        job_title: jobTitleObj?.v,
        middle_name: middleNameObj?.v,
        postcode: postcodeObj?.v,
        salutation: salutationObj?.v,
        state_region: stateRegionObj?.v,
        street_address: streetAddressObj?.v,
        street_address_2: streetAddress2Obj?.v,
        ...sanitizedRest
      }
    };
  }

  if (phone_number || username) {
    res = {
      ...res,
      ...(phone_number && {phone_number}),
      ...(username && {username})
    };
  }

  return res;
};
