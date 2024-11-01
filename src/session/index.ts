import {NextApiRequest, NextApiResponse} from 'next';
import {config} from '../config/index';

export default async function getKindeServerSession(req?: NextApiRequest, res?: NextApiResponse) {
  const {
    getAccessTokenFactory,
    getBooleanFlagFactory,
    getFlagFactory,
    getIdTokenFactory,
    getIntegerFlagFactory,
    getOrganizationFactory,
    getPermissionFactory,
    getPermissionsFactory,
    getStringFlagFactory,
    getUserFactory,
    getUserOrganizationsFactory,
    isAuthenticatedFactory,
    getAccessTokenRawFactory,
    getIdTokenRawFactory,
    kindeClient,
    sessionManager,
    getRolesFactory,
    getClaimFactory
  } = await import('./sessionImports');

  return {
    refreshTokens: async () => {
      try {
        const response = await kindeClient.refreshTokens(
          await sessionManager(req, res)
        );
        return response;
      } catch (error) {
        if (config.isDebugMode) {
          console.error(error);
        }
        return null;
      }
    },
    getAccessToken: getAccessTokenFactory(req, res),
    getBooleanFlag: getBooleanFlagFactory(req, res),
    getFlag: getFlagFactory(req, res),
    getIdToken: getIdTokenFactory(req, res),
    getIdTokenRaw: getIdTokenRawFactory(req, res),
    getAccessTokenRaw: getAccessTokenRawFactory(req, res),
    getIntegerFlag: getIntegerFlagFactory(req, res),
    getOrganization: getOrganizationFactory(req, res),
    getPermission: getPermissionFactory(req, res),
    getPermissions: getPermissionsFactory(req, res),
    getStringFlag: getStringFlagFactory(req, res),
    getUser: getUserFactory(req, res),
    getUserOrganizations: getUserOrganizationsFactory(req, res),
    isAuthenticated: isAuthenticatedFactory(req, res),
    getRoles: getRolesFactory(req, res),
    getClaim: getClaimFactory(req, res)
  };
}
