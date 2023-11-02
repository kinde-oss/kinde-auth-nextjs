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
import {ReactElement} from 'react';

export type KindeAccessToken = {
  aud: string[];
  azp: number;
  iat: number;
  iss: string;
  jti: string;
  org_code: string;
  permissions: string[];
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
};

export type KindePermissions = {
  permissions: string[];
  orgCode: string | null;
};

export type KindePermission = {
  isGranted: boolean;
  orgCode: string | null;
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
};

export type KindeOrganizations = {
  orgCodes: string[];
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
  getOrganization: (sessionManager: SessionManager) => Promise<{
    orgCode: string | null;
  }>;
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
};
