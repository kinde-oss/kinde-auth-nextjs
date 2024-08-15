export const generateUserObject = (
  user,
  userProperties,
  phone_number,
  username
) => {
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

    Object.keys(rest).forEach((key, index) => {
      rest[key] = rest[key].v;
    });

    res = {
      ...res,
      properties: {
        city: cityObj.v,
        industry: industryObj.v,
        job_title: jobTitleObj.v,
        middle_name: middleNameObj.v,
        postcode: postcodeObj.v,
        salutation: salutationObj.v,
        state_region: stateRegionObj.v,
        street_address: streetAddressObj.v,
        street_address_2: streetAddress2Obj.v,
        ...rest
      }
    };
  }

  if (phone_number) {
    res = {
      ...res,
      phone_number
    };
  }

  if (username) {
    res = {
      ...res,
      username
    };
  }

  return res;
};
