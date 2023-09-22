import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {NextResponse} from 'next/server';
import {config} from '../config/index';
import {appRouterSessionManager} from '../session/sessionManager';

export default class AppRouterClient {
  constructor(req, res) {
    this.kindeClient = createKindeServerClient(
      config.grantType,
      config.clientOptions
    );
    this.url = new URL(req.url);
    this.sessionManager = appRouterSessionManager(cookies());
    this.req = req;
  }

  redirect(url) {
    return redirect(url);
  }

  getUrl() {
    return this.url;
  }

  json(data) {
    return NextResponse.json(data);
  }

  getSearchParam(key) {
    return this.req.nextUrl.searchParams.get(key);
  }
}
