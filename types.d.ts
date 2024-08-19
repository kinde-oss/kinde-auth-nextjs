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
  azp: number;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  org_code: string;
  org_name?: string;
  permissions: KindePermissions;
  roles?: KindeRole[];
  email?: string;
  scp: string[];
  sub: string;
};

export type KindeIdToken = {
  at_hash: string;
  aud: string[];
  auth_time: number;
  azp: string;
  email: string;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  org_codes: string[];
  sub: string;
  updated_at: number;
};

export type KindeUser = {
  id: string;
  email: string | null;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
  username?: string | null;
  phone_number?: string | null;
  properties?: {
    city?: string;
    industry?: string;
    job_title?: string;
    middle_name?: string;
    postcode?: string;
    salutation?: string;
    state_region?: string;
    street_address?: string;
    street_address_2?: string;
    [custom_property: string]: any;
  };
};

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
  v: string | number | boolean;
};

export type KindeFlagTypeCode = 'b' | 'i' | 's';

export type KindeFlagTypeValue = 'boolean' | 'integer' | 'string';

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
  refreshData: () => Promise<void>;
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
  getUser: () => KindeUser | null;
  getUserOrganizations: () => KindeOrganizations | null;
  refreshData: () => Promise<void>;
};

export type KindeSetupResponse = {
  accessToken: KindeAccessToken;
  accessTokenEncoded: string;
  idToken: KindeIdToken;
  user: KindeUser;
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
