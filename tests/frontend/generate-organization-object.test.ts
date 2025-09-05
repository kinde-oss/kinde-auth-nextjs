import { generateOrganizationObject } from "../../src/utils/generateOrganizationObject"; // Assuming the function is exported from utils file
import { KindeAccessToken, KindeIdToken } from "../../src/types";
import { describe, expect, it } from "vitest";

describe("generateOrganizationObject", () => {
  const orgProperties = {
    kp_org_city: {
      v: "Sydney",
    },
    kp_org_industry: {
      v: "Software",
    },
    kp_org_postcode: {
      v: "2165",
    },
    kp_org_state_region: {
      v: "NSW",
    },
    kp_org_street_address: {},
    kp_org_street_address_2: {},
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

  const accessToken: KindeAccessToken = {
    ...accessTokenWithoutProperties,
    organization_properties: orgProperties,
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

  const idToken: KindeIdToken = {
    ...idTokenWithoutProperties,
    organization_properties: orgProperties,
  };

  it("should generate org object", () => {
    expect(generateOrganizationObject(idToken, accessToken)).toEqual({
      orgCode: "org_95755120efb",
      orgName: "Peter Phanouvong",
      properties: {
        city: "Sydney",
        industry: "Software",
        postcode: "2165",
        state_region: "NSW",
        kp_org_city: "Sydney",
        kp_org_industry: "Software",
        kp_org_postcode: "2165",
        kp_org_state_region: "NSW",
      },
    });
  });
  it("should generate org object when there are no properties in idtoken", () => {
    expect(
      generateOrganizationObject(idTokenWithoutProperties, accessToken),
    ).toEqual({
      orgCode: "org_95755120efb",
      orgName: "Peter Phanouvong",
      properties: {
        city: "Sydney",
        industry: "Software",
        postcode: "2165",
        state_region: "NSW",
        kp_org_city: "Sydney",
        kp_org_industry: "Software",
        kp_org_postcode: "2165",
        kp_org_state_region: "NSW",
      },
    });
  });
  it("should generate org object when there are no properties in access token", () => {
    expect(
      generateOrganizationObject(idToken, accessTokenWithoutProperties),
    ).toEqual({
      orgCode: "org_95755120efb",
      orgName: "Peter Phanouvong",
      properties: {
        city: "Sydney",
        industry: "Software",
        postcode: "2165",
        state_region: "NSW",
        kp_org_city: "Sydney",
        kp_org_industry: "Software",
        kp_org_postcode: "2165",
        kp_org_state_region: "NSW",
      },
    });
  });

  it("should generate org object with no properties when not properties in access token or id token", () => {
    expect(
      generateOrganizationObject(
        idTokenWithoutProperties,
        accessTokenWithoutProperties,
      ),
    ).toEqual({
      orgCode: "org_95755120efb",
      orgName: "Peter Phanouvong",
      properties: {
        city: undefined,
        industry: undefined,
        postcode: undefined,
        state_region: undefined,
        street_address: undefined,
        street_address_2: undefined,
      },
    });
  });

  it("should include custom organization properties from access token", () => {
    const accessTokenWithCustom: KindeAccessToken = {
      ...accessToken,
      organization_properties: {
        ...orgProperties,
        custom_org_prop: { v: "hello world" },
        another_custom: { v: "42" },
      },
    };

    expect(
      generateOrganizationObject(idTokenWithoutProperties, accessTokenWithCustom),
    ).toEqual({
      orgCode: "org_95755120efb",
      orgName: "Peter Phanouvong",
      properties: {
        city: "Sydney",
        industry: "Software",
        postcode: "2165",
        state_region: "NSW",
        kp_org_city: "Sydney",
        kp_org_industry: "Software",
        kp_org_postcode: "2165",
        kp_org_state_region: "NSW",
        custom_org_prop: "hello world",
        another_custom: "42",
      },
    });
  });

  it("should have access token org properties override id token org properties", () => {
    const idTokenWithCustom: KindeIdToken = {
      ...idTokenWithoutProperties,
      organization_properties: {
        ...orgProperties,
        custom_org_prop: { v: "from id token" },
      },
    };

    const accessTokenOverrides: KindeAccessToken = {
      ...accessToken,
      organization_properties: {
        ...orgProperties,
        custom_org_prop: { v: "from access token" },
      },
    };

    expect(
      generateOrganizationObject(idTokenWithCustom, accessTokenOverrides),
    ).toEqual({
      orgCode: "org_95755120efb",
      orgName: "Peter Phanouvong",
      properties: {
        city: "Sydney",
        industry: "Software",
        postcode: "2165",
        state_region: "NSW",
        kp_org_city: "Sydney",
        kp_org_industry: "Software",
        kp_org_postcode: "2165",
        kp_org_state_region: "NSW",
        custom_org_prop: "from access token",
      },
    });
  });
});
