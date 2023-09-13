import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {config} from '../config/index';
import {redirect} from 'next/navigation';

export default class AppRouterClient {
  constructor(req, res) {
    this.kindeClient = createKindeServerClient(
      config.grantType,
      config.clientOptions
    );
    this.url = new URL(req.url);
  }

  redirect(url) {
    return redirect(url);
  }

  getUrl() {
    return this.url;
  }
}
