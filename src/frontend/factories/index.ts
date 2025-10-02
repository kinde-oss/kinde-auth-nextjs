import { KindeContextProps } from '@kinde-oss/kinde-auth-react';
import { KindeNextClientState } from '../types';
import {
  getBooleanFlagFactory,
  getFlagFactory,
  getIntegerFlagFactory,
  getStringFlagFactory,
} from './feature-flag-factory';
import { getOrganizationFactory } from './organization-factory';
import {
  getClaimFactory,
  getNextTypedAccessTokenFactory,
  getNextTypedIdTokenFactory,
  getRawAccessTokenFactory,
  getRawIdTokenFactory,
} from './token-factory';
import { jwtDecoder } from '@kinde/jwt-decoder';
import { KindeAccessToken, KindeIdToken } from '../../types';
import { generateUserObject } from '../../utils/generateUserObject';

const getNextClientFunctions = (state: KindeNextClientState) => {
  return {
    getFlag: getFlagFactory(state.featureFlags),
    getBooleanFlag: getBooleanFlagFactory(state.featureFlags),
    getIntegerFlag: getIntegerFlagFactory(state.featureFlags),
    getStringFlag: getStringFlagFactory(state.featureFlags),
    getClaim: getClaimFactory(state.accessToken, state.idToken),
    getAccessToken: getNextTypedAccessTokenFactory(state.accessToken),
    getToken: getRawAccessTokenFactory(state.accessTokenEncoded),
    getAccessTokenRaw: getRawAccessTokenFactory(state.accessTokenEncoded),
    getIdToken: getNextTypedIdTokenFactory(state.idToken),
    getIdTokenRaw: getRawIdTokenFactory(state.idTokenRaw),
    getOrganization: getOrganizationFactory(state.idToken, state.accessToken),
    getPermissions: () => state.permissions,
    getUserOrganizations: () => state.userOrganizations,
    getPermission: (key: string) => {
      if (!state.permissions) return { isGranted: false, orgCode: null };
      return {
        isGranted: state.permissions.permissions?.some((p) => p === key),
        orgCode: state.organization?.orgCode,
      };
    },
    getUser: () => state.user,
  };
};

export const constructKindeClientState = (state: KindeNextClientState) => {
  return {
    ...state,
    ...getNextClientFunctions(state),
    isAuthenticated: !!state.user,
    accessTokenRaw: state.accessTokenEncoded,
    idTokenEncoded: state.idTokenRaw,
  };
};

export const transformReactAuthStateToNextState = async (
  reactAuthState: KindeContextProps
): Promise<KindeNextClientState> => {
  const accessToken = await reactAuthState.getAccessToken();
  const idToken = await reactAuthState.getIdToken();
  const decodedAccessToken = jwtDecoder<KindeAccessToken>(accessToken);
  const decodedIdToken = jwtDecoder<KindeIdToken>(idToken);
  const permissions = decodedAccessToken.permissions;
  const organization = decodedAccessToken.org_code;
  const featureFlags = decodedAccessToken.feature_flags;
  const userOrganizations = decodedIdToken.org_codes;
  const orgName = decodedAccessToken.org_name;
  const orgProperties = decodedAccessToken.organization_properties;
  const orgNames = decodedIdToken.organizations;
  return {
    accessToken: decodedAccessToken,
    accessTokenEncoded: accessToken,
    error: null,
    // @ts-expect-error
    // Another example of the type contract being wrong.
    // TODO: Fix this in 3.0
    featureFlags: featureFlags,
    idToken: decodedIdToken,
    idTokenRaw: idToken,
    isAuthenticated: false,
    isLoading: reactAuthState.isLoading,
    organization: {
      orgCode: organization,
      orgName,
      // @ts-expect-error
      // TODO: This needs to be fixed in 3.0
      // The type contract expects the properties to be prefixed with kp_org_,
      // but the actual properties are *not* prefixed
      // Technically, these properties have been bugged and never worked.
      // We need to keep it broken for backwards compatibility.
      properties: {
        city: orgProperties?.kp_org_city?.v,
        industry: orgProperties?.kp_org_industry?.v,
        postcode: orgProperties?.kp_org_postcode?.v,
        state_region: orgProperties?.kp_org_state_region?.v,
        street_address: orgProperties?.kp_org_street_address?.v,
        street_address_2: orgProperties?.kp_org_street_address_2?.v,
      },
    },
    permissions: {
        permissions,
        orgCode: organization,
    },
    user: generateUserObject(decodedIdToken, decodedAccessToken),
    userOrganizations: {
      orgCodes: userOrganizations,
      orgs: orgNames?.map((org) => ({
        code: org?.id,
        name: org?.name,
      })),
    },
  };
};
