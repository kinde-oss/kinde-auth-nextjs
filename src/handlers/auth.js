import {isAppRouter} from '../utils/isAppRouter';
import {callback} from './callback';
import {createOrg} from './createOrg';
import {login} from './login';
import {logout} from './logout';
import {setup} from './setup';
import {register} from './register';
import AppRouterClient from '../routerClients/AppRouterClient';
import PagesRouterClient from '../routerClients/PagesRouterClient';
import {NextRequest} from 'next/server';
import RouterClient from '../routerClients/RouterClient';

/**
 * @type {Record<string,(routerClient: RouterClient) => Promise<void>>}
 */
const routeMap = {
  create_org: createOrg,
  register,
  setup,
  login,
  logout,
  kinde_callback: callback
};

/**
 *
 * @param {string} endpoint
 * @returns
 */
const getRoute = (endpoint) => {
  return routeMap[endpoint];
};
/**
 * @param {object} [request]
 * @param {string} [endpoint]
 * @returns {(req, res) => any}
 */
export default (request, endpoint) => {
  // For backwards compatibility in app router
  if (typeof request == 'object' && typeof endpoint == 'string') {
    // @ts-ignore
    return appRouterHandler(request, {params: {kindeAuth: endpoint}});
  }
  /**
   *
   * @param {import('next').NextApiRequest | Request} req
   * @param {import('next').NextApiResponse | Response} res
   */
  return async function handler(req, res) {
    return isAppRouter(req)
      ? // @ts-ignore
        appRouterHandler(req, res)
      : // @ts-ignore
        pagesRouterHandler(req, res);
  };
};

/**
 *
 * @param {NextRequest} req
 * @param {{params: {kindeAuth: string}}} res
 * @returns
 */
const appRouterHandler = async (req, res) => {
  const {params} = res;
  let endpoint = params.kindeAuth;
  endpoint = Array.isArray(endpoint) ? endpoint[0] : endpoint;
  const route = getRoute(endpoint);

  return route
    ? // @ts-ignore
      await route(new AppRouterClient(req, res))
    : new Response('This page could not be found.', {status: 404});
};

/**
 *
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 * @returns
 */
const pagesRouterHandler = async (req, res) => {
  let {
    query: {kindeAuth: endpoint}
  } = req;
  endpoint = Array.isArray(endpoint) ? endpoint[0] : endpoint;
  if (!endpoint) {
    throw Error('Please check your Kinde setup');
  }
  const route = getRoute(endpoint);
  return route
    ? // @ts-ignore
      await route(new PagesRouterClient(req, res))
    : res.status(404).end();
};
