import {
  FeatureFlags,
  Permissions,
  UserType
} from '@kinde-oss/kinde-typescript-sdk';
import {ReactElement} from 'react';

export declare function RegisterLink(props): ReactElement<LinkHTMLAttributes>;

export declare function LoginLink(props): ReactElement<LinkHTMLAttributes>;

export declare function CreateOrgLink(props): ReactElement<LinkHTMLAttributes>;

export declare function LogoutLink(props): ReactElement<LinkHTMLAttributes>;

export declare function useKindeAuth(): State;
export declare function useKindeBrowserClient(): State;

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
  user: UserType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissions: Permissions | null;
  error?: string | undefined;
  featureFlags: FeatureFlags | null;
  organization: KindeOrganization | null;
  userOrganizations: KindeOrganizations | null;
  accessToken: string | null;
  idToken: string | null;
};
