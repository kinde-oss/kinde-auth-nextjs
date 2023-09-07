import {ReactElement, LinkHTMLAttributes} from 'react';
import {NextRequest} from 'next/server';

export declare function RegisterLink(
  props: React.HTMLProps<HTMLAnchorElement>
): ReactElement<LinkHTMLAttributes<HTMLAnchorElement>>;

export declare function LoginLink(
  props: React.HTMLProps<HTMLAnchorElement>
): ReactElement<LinkHTMLAttributes<HTMLAnchorElement>>;

export declare function CreateOrgLink(
  props: React.HTMLProps<HTMLAnchorElement>
): ReactElement<LinkHTMLAttributes<HTMLAnchorElement>>;

export declare function LogoutLink(
  props: React.HTMLProps<HTMLAnchorElement>
): ReactElement<LinkHTMLAttributes<HTMLAnchorElement>>;

export type KindeUser = {
  given_name: string | null;
  id: string | null;
  family_name: string | null;
  email: string | null;
  picture: string | null;
};

export type AuthEndpoints =
  | 'login'
  | 'logout'
  | 'register'
  | 'kinde_callback'
  | 'permissions'
  | 'permission'
  | 'user'
  | 'boolean_flag'
  | 'integer_flag'
  | 'string_flag'
  | 'flag'
  | 'organization'
  | 'user_organizations'
  | 'kinde_data'
  | 'create_org';

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
  value: string | boolean | number;
  defaultValue?: string | boolean | number;
  is_default: boolean;
};

export type KindeOrganization = {
  orgCode: string;
};

export type KindeOrganizations = {
  orgCodes: string[];
};

export type KindeFeatureFlags = {
  [flag]: {
    t: string;
    v: any;
  };
};
export type ServerSession = {
  getBooleanFlag: (code: string, defaultValue?: boolean) => boolean;
  getFlag: (
    code: string,
    defaultValue?: string | boolean | number,
    flagType?: KindeFlagTypeCode
  ) => KindeFlag;
  getIntegerFlag: (code, defaultValue) => number;
  getStringFlag: (code, defaultValue) => string;
  getPermissions: () => KindePermissions;
  getPermission: (key: string) => KindePermission;
  getOrganization: () => KindeOrganization;
  getUserOrganizations: () => KindeOrganizations;
  getUser: () => KindeUser;
  isAuthenticated: () => boolean;
};

export declare function handleAuth(
  request: NextRequest,
  endpoint: AuthEndpoints
);

export declare function getKindeServerSession(): ServerSession;

export declare function authMiddleware();
