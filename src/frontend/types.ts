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
export type PublicKindeConfig = {
  clientId: string;
  issuerUrl: string;
  redirectUrl: string;
};

export type FetchedKindeState = {
  accessToken: KindeAccessToken | null;
  accessTokenEncoded: string | null;
  featureFlags: KindeFeatureFlags;
  idToken: KindeIdToken | null;
  idTokenRaw: string | null;
  isAuthenticated: boolean;
  organization: KindeOrganization | null;
  permissions: KindePermissions | null;
  user: KindeUser<Record<string, string>> | null;
  userOrganizations: KindeOrganizations | null;
  env: PublicKindeConfig;
};

export type KindeNextClientState = Omit<FetchedKindeState, "env"> & {
  isLoading: boolean;
  error: string | null;
};
