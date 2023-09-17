import {ReactElement, LinkHTMLAttributes} from 'react';
import {NextRequest} from 'next/server';
import {State} from '..';

export declare function RegisterLink(props): ReactElement<LinkHTMLAttributes>;

export declare function LoginLink(props): ReactElement<LinkHTMLAttributes>;

export declare function CreateOrgLink(props): ReactElement<LinkHTMLAttributes>;

export declare function LogoutLink(props): ReactElement<LinkHTMLAttributes>;

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

export type ServerSession = {
  getBooleanFlag: (code: string, defaultValue: boolean) => Promise<boolean>;
  getFlag: (
    code: string,
    defaultValue?: string | boolean | number,
    flagType?: KindeFlagTypeCode
  ) => Promise<KindeFlag>;
  getIntegerFlag: (code: string, defaultValue: number) => Promise<number>;
  getStringFlag: (code: string, defaultValue: string) => Promise<string>;
  getPermissions: () => Promise<KindePermissions>;
  getPermission: (key: string) => Promise<KindePermission>;
  getOrganization: () => Promise<KindeOrganization>;
  getUserOrganizations: () => Promise<KindeOrganizations>;
  getUser: () => Promise<KindeUser>;
  isAuthenticated: () => Promise<boolean>;
};

export declare function handleAuth(
  request: NextRequest,
  endpoint: AuthEndpoints
): void;

export declare function getKindeServerSession(
  req?: Request,
  res?: Response
): ServerSession;

export declare function authMiddleware();
