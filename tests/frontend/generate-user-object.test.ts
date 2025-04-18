import { generateUserObject } from "../../src/utils/generateUserObject"; // Assuming the function is exported from utils file
import { KindeAccessToken, KindeIdToken } from "../../src/types";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

describe("generateUserObject", () => {
  const accessToken: KindeAccessToken = {
    aud: [],
    azp: "463db732edf24274970e395735e6d3e2",
    email: "peter@kinde.com",
    exp: 1724626727,
    feature_flags: {
      boolean: {
        t: "b",
        v: true,
      },
      booleanflag: {
        t: "b",
        v: true,
      },
      flag: {
        t: "j",
        v: {
          message: "hi",
        },
      },
      flagtest: {
        t: "j",
        v: {
          flag: "yeeee",
        },
      },
      integerflag: {
        t: "i",
        v: 7,
      },
      integerflagtest: {
        t: "i",
        v: 123,
      },
      stringflag: {
        t: "s",
        v: "asdfg",
      },
      stringflagtest: {
        t: "s",
        v: "stringFlagTest",
      },
      test: {
        t: "b",
        v: true,
      },
    },
    iat: 1724626665,
    iss: "https://peter.kinde.com",
    jti: "a39d1f76-f87d-447b-8d37-ae5bfcd36bd2",
    org_code: "org_95755120efb",
    org_name: "Peter Phanouvong",
    organization_properties: {
      kp_org_city: {},
      kp_org_industry: {},
      kp_org_postcode: {},
      kp_org_state_region: {},
      kp_org_street_address: {},
      kp_org_street_address_2: {},
    },
    permissions: ["test2", "tester"],
    roles: [
      {
        id: "018f17f2-48dc-c606-94a7-0f425996ef57",
        key: "admin",
        name: "Admin",
      },
      {
        id: "018e9bd7-d933-e4f3-dd7d-686e53be8a2c",
        key: "bud",
        name: "Bud",
      },
    ],
    scp: ["openid", "profile", "email", "offline"],
    sub: "kp:3b1b9e1c1a5a46bfae4e46c969065381",
    user_properties: {
      kp_usr_industry: {
        v: "Software",
      },
      kp_usr_job_title: {
        v: "Engineer",
      },
      kp_usr_middle_name: {
        v: "Sabichay",
      },
      kp_usr_postcode: {},
      kp_usr_salutation: {},
      kp_usr_state_region: {},
      kp_usr_street_address: {},
      kp_usr_street_address_2: {},
    },
  };
  const accessTokenWithoutProperties: KindeAccessToken = {
    aud: [],
    azp: "463db732edf24274970e395735e6d3e2",
    email: "peter@kinde.com",
    exp: 1724626727,
    feature_flags: {
      boolean: {
        t: "b",
        v: true,
      },
      booleanflag: {
        t: "b",
        v: true,
      },
      flag: {
        t: "j",
        v: {
          message: "hi",
        },
      },
      flagtest: {
        t: "j",
        v: {
          flag: "yeeee",
        },
      },
      integerflag: {
        t: "i",
        v: 7,
      },
      integerflagtest: {
        t: "i",
        v: 123,
      },
      stringflag: {
        t: "s",
        v: "asdfg",
      },
      stringflagtest: {
        t: "s",
        v: "stringFlagTest",
      },
      test: {
        t: "b",
        v: true,
      },
    },
    iat: 1724626665,
    iss: "https://peter.kinde.com",
    jti: "a39d1f76-f87d-447b-8d37-ae5bfcd36bd2",
    org_code: "org_95755120efb",
    org_name: "Peter Phanouvong",
    organization_properties: {
      kp_org_city: {},
      kp_org_industry: {},
      kp_org_postcode: {},
      kp_org_state_region: {},
      kp_org_street_address: {},
      kp_org_street_address_2: {},
    },
    permissions: ["test2", "tester"],
    roles: [
      {
        id: "018f17f2-48dc-c606-94a7-0f425996ef57",
        key: "admin",
        name: "Admin",
      },
      {
        id: "018e9bd7-d933-e4f3-dd7d-686e53be8a2c",
        key: "bud",
        name: "Bud",
      },
    ],
    scp: ["openid", "profile", "email", "offline"],
    sub: "kp:3b1b9e1c1a5a46bfae4e46c969065381",
  };
  const idToken: KindeIdToken = {
    at_hash: "07zCRWxQSbvxUYvB2KL6tA",
    aud: ["463db732edf24274970e395735e6d3e2"],
    auth_time: 1724626003,
    azp: "463db732edf24274970e395735e6d3e2",
    email: "peter@kinde.com",
    email_verified: true,
    exp: 1724626065,
    family_name: "Phanouvong",
    given_name: "Peterzz",
    iat: 1724626004,
    iss: "https://peter.kinde.com",
    jti: "4b8f85a5-7996-45cf-811b-29ecdcce9c31",
    name: "Peterzz Phanouvong",
    org_codes: ["org_19eb76166dee3", "org_8615151456b42", "org_95755120efb"],
    organization_properties: {
      kp_org_city: {},
      kp_org_industry: {},
      kp_org_postcode: {},
      kp_org_state_region: {},
      kp_org_street_address: {},
      kp_org_street_address_2: {},
    },
    organizations: [
      {
        id: "org_19eb76166dee3",
        name: "RBAC",
      },
      {
        id: "org_8615151456b42",
        name: "awesome",
      },
      {
        id: "org_95755120efb",
        name: "Peter Phanouvong",
      },
    ],
    picture:
      "https://lh3.googleusercontent.com/a/ACg8ocJy7qVlRTf6YhuE5u6Z1FK30BvfXNK5OoMydpzct5oXFrUDRQ=s96-c",
    preferred_username: "peteswah",
    rat: 1724626003,
    sub: "kp:3b1b9e1c1a5a46bfae4e46c969065381",
    updated_at: 1724286328,
    user_properties: {
      custom_prop: {
        v: "hello world",
      },
      kp_usr_city: {
        v: "Sydney",
      },
      kp_usr_industry: {
        v: "Software",
      },
      kp_usr_is_marketing_opt_in: {},
      kp_usr_job_title: {
        v: "Engineer",
      },
      kp_usr_middle_name: {
        v: "Sabichay",
      },
      kp_usr_postcode: {},
      kp_usr_salutation: {},
      kp_usr_state_region: {},
      kp_usr_street_address: {},
      kp_usr_street_address_2: {},
      test: {
        v: "fafdsafdsa",
      },
    },
  };
  const idTokenWithoutProperties: KindeIdToken = {
    at_hash: "07zCRWxQSbvxUYvB2KL6tA",
    aud: ["463db732edf24274970e395735e6d3e2"],
    auth_time: 1724626003,
    azp: "463db732edf24274970e395735e6d3e2",
    email: "peter@kinde.com",
    email_verified: true,
    exp: 1724626065,
    family_name: "Phanouvong",
    given_name: "Peterzz",
    iat: 1724626004,
    iss: "https://peter.kinde.com",
    jti: "4b8f85a5-7996-45cf-811b-29ecdcce9c31",
    name: "Peterzz Phanouvong",
    org_codes: ["org_19eb76166dee3", "org_8615151456b42", "org_95755120efb"],
    organization_properties: {
      kp_org_city: {},
      kp_org_industry: {},
      kp_org_postcode: {},
      kp_org_state_region: {},
      kp_org_street_address: {},
      kp_org_street_address_2: {},
    },
    organizations: [
      {
        id: "org_19eb76166dee3",
        name: "RBAC",
      },
      {
        id: "org_8615151456b42",
        name: "awesome",
      },
      {
        id: "org_95755120efb",
        name: "Peter Phanouvong",
      },
    ],
    picture:
      "https://lh3.googleusercontent.com/a/ACg8ocJy7qVlRTf6YhuE5u6Z1FK30BvfXNK5OoMydpzct5oXFrUDRQ=s96-c",
    preferred_username: "peteswah",
    rat: 1724626003,
    sub: "kp:3b1b9e1c1a5a46bfae4e46c969065381",
    updated_at: 1724286328,
  };

  it("should generate user object", () => {
    expect(generateUserObject(idToken, accessToken)).toEqual({
      id: "kp:3b1b9e1c1a5a46bfae4e46c969065381",
      email: "peter@kinde.com",
      family_name: "Phanouvong",
      given_name: "Peterzz",
      picture:
        "https://lh3.googleusercontent.com/a/ACg8ocJy7qVlRTf6YhuE5u6Z1FK30BvfXNK5OoMydpzct5oXFrUDRQ=s96-c",
      username: "peteswah",
      properties: {
        city: "Sydney",
        industry: "Software",
        job_title: "Engineer",
        middle_name: "Sabichay",
        custom_prop: "hello world",
        test: "fafdsafdsa",
        kp_usr_city: "Sydney",
        kp_usr_industry: "Software",
        kp_usr_job_title: "Engineer",
        kp_usr_middle_name: "Sabichay",
      },
    });
  });

  it("should generate user object when there are no properties in idtoken", () => {
    expect(generateUserObject(idTokenWithoutProperties, accessToken)).toEqual({
      id: "kp:3b1b9e1c1a5a46bfae4e46c969065381",
      email: "peter@kinde.com",
      family_name: "Phanouvong",
      given_name: "Peterzz",
      picture:
        "https://lh3.googleusercontent.com/a/ACg8ocJy7qVlRTf6YhuE5u6Z1FK30BvfXNK5OoMydpzct5oXFrUDRQ=s96-c",
      username: "peteswah",
      properties: {
        industry: "Software",
        job_title: "Engineer",
        middle_name: "Sabichay",
        kp_usr_industry: "Software",
        kp_usr_job_title: "Engineer",
        kp_usr_middle_name: "Sabichay",
      },
    });
  });

  it("should generate user object when there are no properties in access token", () => {
    expect(generateUserObject(idToken, accessTokenWithoutProperties)).toEqual({
      id: "kp:3b1b9e1c1a5a46bfae4e46c969065381",
      email: "peter@kinde.com",
      family_name: "Phanouvong",
      given_name: "Peterzz",
      picture:
        "https://lh3.googleusercontent.com/a/ACg8ocJy7qVlRTf6YhuE5u6Z1FK30BvfXNK5OoMydpzct5oXFrUDRQ=s96-c",
      username: "peteswah",
      properties: {
        city: "Sydney",
        industry: "Software",
        job_title: "Engineer",
        middle_name: "Sabichay",
        custom_prop: "hello world",
        test: "fafdsafdsa",
        kp_usr_city: "Sydney",
        kp_usr_industry: "Software",
        kp_usr_job_title: "Engineer",
        kp_usr_middle_name: "Sabichay",
      },
    });
  });

  it("should generate user object with no properties when not properties in access token or id token", () => {
    expect(
      generateUserObject(
        idTokenWithoutProperties,
        accessTokenWithoutProperties,
      ),
    ).toEqual({
      id: "kp:3b1b9e1c1a5a46bfae4e46c969065381",
      email: "peter@kinde.com",
      family_name: "Phanouvong",
      given_name: "Peterzz",
      picture:
        "https://lh3.googleusercontent.com/a/ACg8ocJy7qVlRTf6YhuE5u6Z1FK30BvfXNK5OoMydpzct5oXFrUDRQ=s96-c",
      username: "peteswah",
      properties: {},
    });
  });
});
