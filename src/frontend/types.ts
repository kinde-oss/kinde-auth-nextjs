import {
  KindeAccessToken,
  KindeFlag,
  KindeFlagRaw,
  KindeIdToken,
  KindeOrganization,
  KindeOrganizations,
  KindePermissions,
  KindeUser,
} from "../types";

export type KindeFeatureFlags = Record<string, KindeFlagRaw>;

export type FetchedKindeState = {
  accessToken: KindeAccessToken | null;
  accessTokenEncoded: string | null;
  featureFlags: KindeFeatureFlags
  idToken: KindeIdToken | null;
  idTokenRaw: string | null;
  isAuthenticated: boolean;
  organization: KindeOrganization | null;
  permissions: KindePermissions | null;
  user: KindeUser<Record<string, string>> | null;
  userOrganizations: KindeOrganizations | null;
};

export type KindeNextClientState = FetchedKindeState & {
  isLoading: boolean;
  error: string | null;
};

