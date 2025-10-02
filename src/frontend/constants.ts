import { KindeNextClientState } from "./types";

export const DefaultKindeNextClientState: KindeNextClientState = {
  accessToken: null,
  accessTokenEncoded: null,
  error: null,
  featureFlags: [],
  idToken: null,
  idTokenRaw: null,
  isAuthenticated: false,
  isLoading: true,
  organization: null,
  permissions: null,
  user: null,
  userOrganizations: null,
};