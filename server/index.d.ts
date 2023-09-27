import {ReactElement, LinkHTMLAttributes} from 'react';
import {NextRequest} from 'next/server';
import {NextApiResponse} from 'next';
import {
  APIsApi,
  ApplicationsApi,
  BusinessApi,
  CallbacksApi,
  ConnectedAppsApi,
  EnvironmentsApi,
  FeatureFlagsApi,
  IndustriesApi,
  OAuthApi,
  OrganizationsApi,
  PermissionsApi,
  RolesApi,
  SubscribersApi,
  TimezonesApi,
  UsersApi
} from '@kinde-oss/kinde-typescript-sdk';

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

declare function handleAuth(): (req?: Request, res?: Response) => Response;

export declare function getKindeServerSession(): ServerSession;

export declare function authMiddleware();

export function createKindeManagementAPIClient(
  req?: Request | NextApiResponse,
  res?: Response | NextApiResponse
): Promise<{
  getToken: (req?: Request, res?: Response) => string;
  usersApi: UsersApi;
  oauthApi: OAuthApi;
  subscribersApi: SubscribersApi;
  organizationsApi: OrganizationsApi;
  connectedAppsApi: ConnectedAppsApi;
  featureFlagsApi: FeatureFlagsApi;
  environmentsApi: EnvironmentsApi;
  permissionsApi: PermissionsApi;
  rolesApi: RolesApi;
  businessApi: BusinessApi;
  industriesApi: IndustriesApi;
  timezonesApi: TimezonesApi;
  applicationsApi: ApplicationsApi;
  callbacksApi: CallbacksApi;
  apisApi: APIsApi;
}>;
