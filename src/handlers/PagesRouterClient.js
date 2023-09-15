import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {config} from '../config/index';
import {sessionManager} from '../session/sessionManager';

export default class PagesRouterClient {
  constructor(req, res) {
    this.kindeClient = createKindeServerClient(
      config.grantType,
      config.clientOptions
    );
    this.url = new URL(config.redirectURL + req.url);
    this.res = res;
    this.req = req;
    this.sessionManager = sessionManager(req, res);
  }

  redirect(url) {
    return this.res.redirect(url.href ? url.href : url);
  }

  getUrl() {
    return this.url;
  }

  json(data) {
    return this.res.send(data);
  }

  getSearchParam(key) {
    return this.url.searchParams.get(key);
  }
}
