import {
  KindeAccessToken,
  KindeFlag,
  KindeIdToken,
  KindeOrganization,
  KindeOrganizations,
  KindePermissions,
  KindeUser,
} from '../types';

export type FetchedKindeState = {
  accessToken: KindeAccessToken | null;
  accessTokenEncoded: string | null;
  featureFlags: KindeFlag[];
  idToken: KindeIdToken | null;
  idTokenRaw: string | null;
  isAuthenticated: boolean;
  organization: KindeOrganization | null;
  permissions: KindePermissions | null;
  user: KindeUser<Record<string, string>> | null;
  userOrganizations: KindeOrganizations | null;
};

export type KindeClientState = FetchedKindeState & {
  isLoading: boolean;
  error: string | null;
}
