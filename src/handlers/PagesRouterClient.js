import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {config} from '../config/index';

export default class PagesRouterClient {
  constructor(req, res) {
    this.kindeClient = createKindeServerClient(
      config.grantType,
      config.clientOptions
    );
    this.url = 'temp';
    this.res = res;
  }

  redirect(url) {
    console.log('url', url);
    return this.res.redirect(url);
  }

  getUrl() {
    return this.url;
  }
}
