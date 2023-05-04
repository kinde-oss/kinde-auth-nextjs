import {login} from './login';
import {logout} from './logout';
import {me} from './me';
import {register} from './register';
import {callback} from './callback';
import {createOrg} from './createOrg';
import {getToken} from './getToken';
import {setup} from './setup';

const getRoute = (endpoint) => {
  const routeMap = {
    create_org: createOrg,
    get_token: getToken,
    kinde_callback: callback,
    login,
    logout,
    me,
    register,
    setup
  };
  return routeMap[endpoint];
};

export default () =>
  async function handler(req, res) {
    let {
      query: {kindeAuth: endpoint}
    } = req;

    endpoint = Array.isArray(endpoint) ? endpoint[0] : endpoint;

    const route = getRoute(endpoint);

    return route ? await route(req, res) : res.status(404).end();
  };
