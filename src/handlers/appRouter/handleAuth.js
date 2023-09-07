import {NextResponse} from 'next/server';
import {login} from './login';
import {logout} from './logout';
import {register} from './register';
import {callback} from './callback';
import {createOrg} from './createOrg';

import {
  getPermissions,
  getPermission,
  getUser,
  getBooleanFlag,
  getFlag,
  getIntegerFlag,
  getOrganization,
  getStringFlag,
  getUserOrganizations
} from '../../session/appRouter/index';
import {getClaim} from '../../session/appRouter/getClaim';

const funcToApiRoute = (fn, args = []) => {
  const data = fn(...args);
  return NextResponse.json(data);
};

const getSearchParams = (req, keys) => {
  return keys.map((key) => req.nextUrl.searchParams.get(key));
};

const routeMap = {
  create_org: createOrg,
  register,
  login,
  logout,
  permissions: () => funcToApiRoute(getPermissions),
  permission: (req) =>
    funcToApiRoute(getPermission, getSearchParams(req, ['key'])),
  user: () => funcToApiRoute(getUser),
  boolean_flag: (req) =>
    funcToApiRoute(
      getBooleanFlag,
      getSearchParams(req, ['code', 'default_value'])
    ),
  string_flag: (req) =>
    funcToApiRoute(
      getStringFlag,
      getSearchParams(req, ['code', 'default_value'])
    ),
  integer_flag: (req) =>
    funcToApiRoute(
      getIntegerFlag,
      getSearchParams(req, ['code', 'default_value'])
    ),
  flag: (req) =>
    funcToApiRoute(
      getFlag,
      getSearchParams(req, ['code', 'default_value', 'flag_type'])
    ),
  organization: () => funcToApiRoute(getOrganization),
  user_organizations: () => funcToApiRoute(getUserOrganizations),
  kinde_data: (req) => {
    const userToken = req.cookies.get('user');
    const isLoggedIn = !!userToken;

    if (isLoggedIn) {
      const user = getUser();
      const permissions = getPermissions();
      const organization = getOrganization();
      const userOrganizations = getUserOrganizations();
      const featureFlags = getClaim('feature_flags');

      return NextResponse.json({
        user,
        permissions,
        organization,
        userOrganizations,
        featureFlags
      });
    } else {
      return NextResponse.json({
        error: 'Log in with Kinde to get `kinde_data`'
      });
    }
  },
  kinde_callback: callback
};

const getRoute = (endpoint) => {
  return routeMap[endpoint];
};

export async function handleAuth(request, endpoint) {
  const route = getRoute(endpoint);

  return route
    ? await route(request)
    : new Response('This page could not be found.', {status: 404});
}
