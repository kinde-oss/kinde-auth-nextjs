import {ReactElement} from 'react';

export declare function useKindeAuth(): State;

export declare function KindeProvider({
  children
}: {
  children: any;
}): ReactElement<State>;

export declare function handleAuth(): any;

export declare function isTokenValid(): boolean;

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  given_name: string | null;
  family_name: string | null;
  updated_at: string | null;
  picture: string | null;
};

export type KindePermissions = {
  permissions: string[];
  orgCode: string;
};

export type KindePermission = {
  isGranted: boolean;
  orgCode: string;
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
  orgCode: string;
};

export type KindeOrganizations = {
  orgCodes: string[];
};

export type State = {
  user: User;
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
  getBooleanFlag: (code: string, defaultValue?: boolean) => boolean;
  getStringFlag: (code, defaultValue) => string;
  getIntegerFlag: (code, defaultValue) => number;
  getPermissions: () => KindePermissions;
  getPermission: (key: string) => KindePermission;
  getOrganization: () => KindeOrganization;
  getUserOrganizations: () => KindeOrganizations;
};
