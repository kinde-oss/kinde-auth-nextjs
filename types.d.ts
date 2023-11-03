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

export type State = {
  user: KindeUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string | undefined;
  getToken: () => string | undefined;
  getClaim: (claim: string, tokenKey?: string) => any;
  getFlag: (
    code: string,
    defaultValue?: string | boolean | number,
    flagType?: KindeFlagTypeCode
  ) => KindeFlag;
  getBooleanFlag: (code: string, defaultValue: boolean) => boolean;
  getStringFlag: (code: string, defaultValue: string) => string;
  getIntegerFlag: (code: string, defaultValue: number) => number;
  getPermissions: () => KindePermissions;
  getPermission: (key: string) => KindePermission;
  getOrganization: () => KindeOrganization;
  getUserOrganizations: () => KindeOrganizations;
};
