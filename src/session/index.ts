import {NextApiRequest, NextApiResponse} from 'next';
import {config} from '../config/index';
import {getAccessTokenFactory} from './getAccessToken';
import {getAccessTokenRawFactory} from './getAccessTokenRaw';
import {getBooleanFlagFactory} from './getBooleanFlag';
import {getClaimFactory} from './getClaim';
import {getFlagFactory} from './getFlag';
import {getIdTokenFactory} from './getIdToken';
import {getIdTokenRawFactory} from './getIdTokenRaw';
import {getIntegerFlagFactory} from './getIntegerFlag';
import {getOrganizationFactory} from './getOrganization';
import {getPermissionFactory} from './getPermission';
import {getPermissionsFactory} from './getPermissions';
import {getRolesFactory} from './getRoles';
import {getStringFlagFactory} from './getStringFlag';
import {getUserFactory} from './getUser';
import {getUserOrganizationsFactory} from './getUserOrganizations';
import {isAuthenticatedFactory} from './isAuthenticated';
import {kindeClient} from './kindeServerClient';
import {sessionManager} from './sessionManager';

export default function (req?: NextApiRequest, res?: NextApiResponse) {
  return {
    refreshTokens: async () => {
      try {
        // @ts-ignore
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
