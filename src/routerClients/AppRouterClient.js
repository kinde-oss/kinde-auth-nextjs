import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {NextRequest, NextResponse} from 'next/server';
import {config} from '../config/index';
import {appRouterSessionManager} from '../session/sessionManager';
import RouterClient from './RouterClient';

// @ts-ignore
export default class AppRouterClient extends RouterClient {
  /**
   *
   * @param {NextRequest} req
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
}
