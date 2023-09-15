import {isAppRouter} from '../utils/isAppRouter';
import {callback} from './callback';
import {createOrg} from './createOrg';
import {login} from './login';
import {logout} from './logout';
import {setup} from './setup';
import {register} from './register';
import AppRouterClient from './AppRouterClient';
import PagesRouterClient from './PagesRouterClient';

const routeMap = {
  create_org: createOrg,
  register,
  setup,
  login,
  logout,
  kinde_callback: callback
};

const getRoute = (endpoint) => {
  return routeMap[endpoint];
};

export default () =>
  async function handler(req, res) {
    return isAppRouter(req)
      ? appRouterHandler(req, res)
      : pagesRouterHandler(req, res);
  };

const appRouterHandler = async (req, res) => {
  const {params} = res;
  let endpoint = params.kindeAuth;
  endpoint = Array.isArray(endpoint) ? endpoint[0] : endpoint;
  const route = getRoute(endpoint);

  return route
    ? await route(new AppRouterClient(req, res))
    : new Response('This page could not be found.', {status: 404});
};

const pagesRouterHandler = async (req, res) => {
  let {
    query: {kindeAuth: endpoint}
  } = req;
  endpoint = Array.isArray(endpoint) ? endpoint[0] : endpoint;
  const route = getRoute(endpoint);
  return route
    ? await route(new PagesRouterClient(req, res))
    : res.status(404).end();
};
