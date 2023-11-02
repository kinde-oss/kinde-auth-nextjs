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
   */
  constructor(req, res) {
    super();
    this.kindeClient = createKindeServerClient(
      config.grantType,
      config.clientOptions
    );
    // @ts-ignore
    this.url = new URL(config.redirectURL + req.url);
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
  json(data, status) {
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
