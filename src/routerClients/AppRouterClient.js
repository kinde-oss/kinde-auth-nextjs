import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {config} from '../config/index';
import {appRouterSessionManager} from '../session/sessionManager';
import RouterClient from './RouterClient';

// @ts-ignore
export default class AppRouterClient extends RouterClient {
  /**
   *
   * @param {import('next/server').NextRequest} req
   * @param {*} res
   * @param {{onError?: () => void; config: {audience?: string | string[], clientId?: string, clientSecret?: string, issuerURL?: string, siteUrl?: string, postLoginRedirectUrl?: string, postLogoutRedirectUrl?: string, scope?: string}}} options
   */
  constructor(req, res, options) {
    super();
    this.clientConfig = {
      ...config.clientOptions,
      framework: 'Next.js:App', 
      audience: options?.config?.audience || config.clientOptions.audience,
      authDomain: options?.config?.issuerURL || config.clientOptions.authDomain,
      clientId: options?.config?.clientId || config.clientOptions.clientId,
      clientSecret:
        options?.config?.clientSecret || config.clientOptions.clientSecret,
      logoutRedirectURL:
        options?.config?.postLogoutRedirectUrl ||
        config.clientOptions.logoutRedirectURL,
      redirectURL: options?.config?.siteUrl
        ? `${options?.config?.siteUrl}/api/auth/kinde_callback`
        : config.clientOptions.redirectURL,
      siteUrl: config.redirectURL || options.config.siteUrl,
      scope: options?.config?.scope || config.clientOptions.scope
    };
    this.kindeClient = createKindeServerClient(
      config.grantType,
      this.clientConfig
    );
    this.url = new URL(req.url);
    this.sessionManager = appRouterSessionManager(cookies());
    this.req = req;
    this.searchParams = req.nextUrl.searchParams;
    this.onErrorCallback = options?.onError;
  }

  /**
   *
   * @param {string} url
   * @returns
   */
  redirect(url) {
    return NextResponse.redirect(url);
  }

  /**
   *
   * @returns {URL}
   */
  getUrl() {
    return this.url;
  }

  /**
   *
   * @param {object} data
   * @param {{status: number}} status
   * @returns
   */
  json(data, status = {status: 200}) {
    return NextResponse.json(data, status);
  }

  error() {
    return Response.error;
  }

  /**
   *
   * @param {string} key
   * @returns
   */
  getSearchParam(key) {
    return this.req.nextUrl.searchParams.get(key);
  }

  onError(error) {
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }
}
