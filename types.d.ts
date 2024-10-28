import {
  ClaimTokenType,
  CreateOrgURLOptions,
  FlagType,
  GetFlagType,
  LoginURLOptions,
  RegisterURLOptions,
  SessionManager,
  UserType
} from '@kinde-oss/kinde-typescript-sdk';

export type KindeAccessToken = {
  aud: string[];
  azp: string;
  email?: string;
  exp: number;
  feature_flags: Record<string, KindeFlagRaw>;
  iat: number;
  iss: string;
  jti: string;
  org_code: string;
  org_name?: string;
  organization_properties?: KindeTokenOrganizationProperties;
  permissions: string[];
  roles?: KindeRole[];
  scp: string[];
  sub: string;
  user_properties?: KindeTokenUserProperties;
};

type KindeTokenOrganizationProperties = {
  kp_org_city: {
    v?: string;
  };
  kp_org_industry: {
    v?: string;
  };
  kp_org_postcode: {
    v?: string;
  };
  kp_org_state_region: {
    v?: string;
  };
  kp_org_street_address: {
    v?: string;
  };
  kp_org_street_address_2: {
    v?: string;
  };
};

type KindeTokenUserProperties = {
  kp_usr_city?: {
    v?: string;
  };
  kp_usr_industry?: {
    v?: string;
  };
  kp_usr_is_marketing_opt_in?: {
    v?: string;
  };
  kp_usr_job_title?: {
    v?: string;
  };
  kp_usr_middle_name?: {
    v?: string;
  };
  kp_usr_postcode?: {
    v?: string;
  };
  kp_usr_salutation?: {
    v?: string;
  };
  kp_usr_state_region?: {
    v?: string;
  };
  kp_usr_street_address?: {
    v?: string;
  };
  kp_usr_street_address_2?: {
    v?: string;
  };
} & {
  [key: string]: {
    v?: any;
  };
};

export type KindeIdToken = {
  at_hash: string;
  aud: string[];
  auth_time: number;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  ext_provider?: {
    claims: {
      connection_id: string;
      email: string;
      family_name: string;
      given_name: string;
      is_confirmed: boolean;
      picture?: string;
      profile?: {
        email: string;
        family_name: string;
        given_name: string;
        hd: string;
        id: string;
        name: string;
        picture: string;
        verified_email: boolean;
      };
    };
    connection_id: string;
    name: string;
  };
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  organization_properties?: KindeTokenOrganizationProperties;
  org_codes: string[];
  organizations?: {id: string; name: string}[];
  picture: string;
  phone_number?: string;
  preferred_username?: string;
  user_properties?: KindeTokenUserProperties;
  rat: number;
  sub: string;
  updated_at: number;
};

type KindeUserProperties<T = Record<string, any>> = {
  city?: string;
  industry?: string;
  is_marketing_opt_in?: string;
  job_title?: string;
  middle_name?: string;
  postcode?: string;
  salutation?: string;
  state_region?: string;
  street_address?: string;
  street_address_2?: string;
} & T;

export type KindeUserBase = {
  id: string;
  email: string | null;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
  username?: string | null;
  phone_number?: string | null;
};

export interface KindeUser<T = void> extends KindeUserBase {
  properties?: KindeUserProperties<T>;
}

export type KindePermissions = {
  permissions: string[];
  orgCode: string | null;
};

export type KindePermission = {
  isGranted: boolean;
  orgCode: string | null;
};

export type KindeRole = {
  id: string;
  key: string;
  name: string;
};

export type KindeFlagRaw = {
  t: KindeFlagTypeCode;
  v?: string | number | boolean | object;
};

export type KindeFlagTypeCode = 'b' | 'i' | 's' | 'j';

export type KindeFlagTypeValue = 'boolean' | 'integer' | 'string' | 'json';

export type KindeFlag = {
  code: string;
  type: KindeFlagTypeValue | null;
  value: any;
  defaultValue: any | null;
  is_default: boolean;
};

export type KindeOrganization = {
  orgCode: string | null;
  orgName?: string | null;
  properties?: {
    org_city?: string;
    org_country?: string;
    org_industry?: string;
    org_postcode?: string;
    org_state_region?: string;
    org_street_address?: string;
    org_street_address_2?: string;
  };
};

export type KindeOrganizations = {
  orgCodes: string[];
  orgs: {
    code: string;
    name?: string;
  }[];
};

export type KindeClient = {
  handleRedirectToApp: (
    sessionManager: SessionManager,
    callbackURL: URL
  ) => Promise<void>;
  isAuthenticated: (sessionManager: SessionManager) => Promise<boolean>;
  getUserProfile: (sessionManager: SessionManager) => Promise<UserType>;
  createOrg: (
    sessionManager: SessionManager,
    options?: CreateOrgURLOptions
  ) => Promise<URL>;
  getToken: (sessionManager: SessionManager) => Promise<string>;
  register: (
    sessionManager: SessionManager,
    options?: RegisterURLOptions
  ) => Promise<URL>;
  getUser: (sessionManager: SessionManager) => Promise<UserType>;
  logout: (sessionManager: SessionManager) => Promise<URL>;
  login: (
    sessionManager: SessionManager,
    options?: LoginURLOptions
  ) => Promise<URL>;
  getUserOrganizations: (sessionManager: SessionManager) => Promise<{
    orgCodes: string[];
  }>;
  getOrganization: (
    sessionManager: SessionManager
  ) => Promise<KindeOrganization>;
  getBooleanFlag: (
    sessionManager: SessionManager,
    code: string,
    defaultValue?: boolean | undefined
  ) => Promise<boolean>;
  getIntegerFlag: (
    sessionManager: SessionManager,
    code: string,
    defaultValue?: number | undefined
  ) => Promise<number>;
  getPermissions: (sessionManager: SessionManager) => Promise<{
    permissions: string[];
    orgCode: string | null;
  }>;
  getPermission: (
    sessionManager: SessionManager,
    name: string
  ) => Promise<{
    orgCode: string | null;
    isGranted: boolean;
  }>;
  getClaimValue: (
    sessionManager: SessionManager,
    claim: string,
    type?: ClaimTokenType
  ) => Promise<unknown>;
  getStringFlag: (
    sessionManager: SessionManager,
    code: string,
    defaultValue?: string | undefined
  ) => Promise<string>;
  getClaim: (
    sessionManager: SessionManager,
    claim: string,
    type?: ClaimTokenType
  ) => Promise<{
    name: string;
    value: unknown;
  }>;
  getFlag: (
    sessionManager: SessionManager,
    code: string,
    defaultValue?: string | number | boolean | undefined,
    type?: keyof FlagType | undefined
  ) => Promise<GetFlagType>;
  refreshTokens: (sessionManager: SessionManager) => Promise<void>;
};

export type KindeState = {
  accessToken: KindeAccessToken | null;
  accessTokenEncoded: string | null;
  accessTokenRaw: string | null;
  error?: string | null;
  idToken: KindeIdToken | null;
  idTokenRaw: string | null;
  idTokenEncoded: string | null;
  isAuthenticated: boolean | null;
  isLoading: boolean | null;
  organization: KindeOrganization;
  permissions: KindePermissions;
  user: {
    id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
    picture: string | null;
  } | null;
  userOrganizations: KindeOrganizations;
  getAccessToken: () => KindeAccessToken | null;
  getAccessTokenRaw: () => string | null;
  getIdTokenRaw: () => string | null;
  getBooleanFlag: (
    code: string,
    defaultValue: boolean
  ) => boolean | null | undefined;
  getClaim: (
    claim: string,
    tokenKey?: 'access_token' | 'id_token'
  ) => {name: string; value: string} | null;
  getFlag: (
    code: string,
    defaultValue: string | number | boolean,
    flagType: KindeFlagTypeCode
  ) => KindeFlag | null;
  getIdToken: () => KindeIdToken | null;
  getIntegerFlag: (
    code: string,
    defaultValue: number
  ) => number | null | undefined;
  getOrganization: () => KindeOrganization;
  getPermission: (
    key: string
  ) => {isGranted: boolean; orgCode: string | null} | null;
  getPermissions: () => KindePermissions;
  getStringFlag: (
    code: string,
    defaultValue: string
  ) => string | null | undefined;
  getToken: () => string | null;
  getUser: () => KindeUser<Record<string, string>> | null;
  getUserOrganizations: () => KindeOrganizations | null;
  refreshData: () => Promise<void>;
};

export type KindeSetupResponse = {
  accessToken: KindeAccessToken;
  accessTokenEncoded: string;
  idToken: KindeIdToken;
  user: KindeUser<Record<string, string>>;
  permissions: KindePermissions;
  organization: KindeOrganization;
  featureFlags: Record<string, KindeFlagRaw>;
  userOrganizations: KindeOrganizations;
};

export type KindeRoles = {
  id: string;
  key: string;
  name: string;
}[];

export type KindeClientConfig = {
  redirectURL: string;
  audience: string | string[];
  clientId: string;
  clientSecret: string;
  issuerURL?: string;
  siteUrl?: string;
  postLoginRedirectUrl?: string;
  postLogoutRedirectUrl?: string;
  authDomain: any;
  logoutRedirectURL: any;
  frameworkVersion: string;
  framework: string;
};
