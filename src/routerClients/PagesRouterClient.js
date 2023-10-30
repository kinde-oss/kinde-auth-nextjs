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
    this.searchParams = this.url.searchParams;
    this.sessionManager = sessionManager(req, res);
  }

  redirect(url) {
    return this.res.redirect(url.href ? url.href : url);
  }

  getUrl() {
    return this.url;
  }

  json(data, status = 200) {
    return this.res.status(status).json(data);
  }

  getSearchParam(key) {
    return this.url.searchParams.get(key);
  }
}
