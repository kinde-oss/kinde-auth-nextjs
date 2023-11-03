import {getAccessTokenFactory} from './getAccessToken';
import {getBooleanFlagFactory} from './getBooleanFlag';
import {getFlagFactory} from './getFlag';
import {getIdTokenFactory} from './getIdToken';
import {getIntegerFlagFactory} from './getIntegerFlag';
import {getOrganizationFactory} from './getOrganization';
import {getPermissionFactory} from './getPermission';
import {getPermissionsFactory} from './getPermissions';
import {getStringFlagFactory} from './getStringFlag';
import {getUserFactory} from './getUser';
import {getUserOrganizationsFactory} from './getUserOrganizations';
import {isAuthenticatedFactory} from './isAuthenticated';

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns
 */
export default function (req, res) {
  return {
    getAccessToken: getAccessTokenFactory(req, res),
    getBooleanFlag: getBooleanFlagFactory(req, res),
    getFlag: getFlagFactory(req, res),
    getIdToken: getIdTokenFactory(req, res),
    getIntegerFlag: getIntegerFlagFactory(req, res),
    getOrganization: getOrganizationFactory(req, res),
    getPermission: getPermissionFactory(req, res),
    getPermissions: getPermissionsFactory(req, res),
    getStringFlag: getStringFlagFactory(req, res),
    getUser: getUserFactory(req, res),
    getUserOrganizations: getUserOrganizationsFactory(req, res),
    isAuthenticated: isAuthenticatedFactory(req, res)
  };
}
