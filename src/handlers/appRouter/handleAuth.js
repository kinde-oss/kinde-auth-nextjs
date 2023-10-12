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
