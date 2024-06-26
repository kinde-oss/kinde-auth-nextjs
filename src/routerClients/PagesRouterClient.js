import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {config} from '../config/index';
import {sessionManager} from '../session/sessionManager';
import RouterClient from './RouterClient';

// @ts-ignore
export default class PagesRouterClient extends RouterClient {
  /**
   *
   * @param {import('next').NextApiRequest} req
   * @param {import('next').NextApiResponse} res
   * @param {{onError?: () => void; config: {audience?: string | string[], clientId?: string, clientSecret?: string, issuerURL?: string, siteUrl?: string, postLoginRedirectUrl?: string, postLogoutRedirectUrl?: string}}} options
   */
  constructor(req, res, options) {
    super();
    const url = req.url.split('/');
    url.pop();
    this.clientConfig = {
      ...config.clientOptions,
      audience: options?.config?.audience || config.clientOptions.audience,
      authDomain: options?.config?.issuerURL || config.clientOptions.authDomain,
      clientId: options?.config?.clientId || config.clientOptions.clientId,
      clientSecret:
        options?.config?.clientSecret || config.clientOptions.clientSecret,
      logoutRedirectURL:
        options?.config?.postLogoutRedirectUrl ||
        config.clientOptions.logoutRedirectURL,
      redirectURL:
        `${options?.config?.siteUrl}/api/auth/kinde_callback` ||
        config.clientOptions.redirectURL,
      siteUrl: config.redirectURL || options.config.siteUrl
    };
    this.kindeClient = createKindeServerClient(
      config.grantType,
      this.clientConfig
    );
    // @ts-ignore
    this.url = new URL(this.clientConfig.siteUrl + req.url);
    this.res = res;
    this.req = req;
    this.searchParams = this.url.searchParams;
    this.sessionManager = sessionManager(req, res);
  }

  /**
   *
   * @param {string} url
   * @returns
   */
  redirect(url) {
    return this.res.redirect(url);
  }

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
    return this.res.status(status.status).json(data);
  }

  /**
   *
   * @param {string} key
   * @returns {string | null}
   */
  getSearchParam(key) {
    return this.url.searchParams.get(key);
  }
}
