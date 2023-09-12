import {NextResponse} from 'next/server';
import {getPermission} from '../../session/appRouter/getPermission';
import {getPermissions} from '../../session/appRouter/getPermissions';
import {callback} from './callback';
import {createOrg} from './createOrg';
import {login} from './login';
import {logout} from './logout';
import {register} from './register';

const routeMap = {
  create_org: createOrg,
  register,
  login,
  logout,
  get_permissions: (req) => {
    const permissions = getPermissions(req);
    return NextResponse.json(permissions);
  },
  get_permission: (req) => {
    const data = getPermission(req.nextUrl.searchParams.get('key'));
    return NextResponse.json(data);
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
