import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {config} from '../config/index';
import {appRouterSessionManager} from '../session/sessionManager';
import RouterClient from './RouterClient';

// @ts-ignore
export default class AppRouterClient extends RouterClient {
  /**
   *
   * @param {import("next/server").NextRequest} req
   * @param {*} res
   */
  constructor(req, res) {
    super();
    this.kindeClient = createKindeServerClient(
      config.grantType,
      config.clientOptions
    );
    this.url = new URL(req.url);
    this.sessionManager = appRouterSessionManager(cookies());
    this.req = req;
    this.searchParams = req.nextUrl.searchParams;
  }

  /**
   *
   * @param {string} url
   * @returns
   */
  redirect(url) {
    return redirect(url);
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
  json(data, status) {
    return Response.json(data, status);
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
}
