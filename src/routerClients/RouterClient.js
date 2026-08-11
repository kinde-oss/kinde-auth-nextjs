import { NextResponse } from "next/server";

export default class RouterClient {
  /** @type {import('../types').KindeClientConfig} */
  clientConfig = {};
  /** @type {import('../types').KindeClient} */
  kindeClient = null;
  /** @type {URL} */
  url;
  /** @type {import('@kinde-oss/kinde-typescript-sdk').SessionManager} */
  sessionManager;
  /** @type {import('next').NextApiResponse | *} */
  res;
  /** @type {import('next').NextApiRequest | NextResponse | *} */
  req;
  /** @type {URLSearchParams} */
  searchParams;

  constructor() {
    if (this.constructor == RouterClient) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  /**
   *
   * @param {string} url
   * @returns
   */
  redirect(url) {
    throw new Error("Method 'redirect()' must be implemented.");
  }

  /**
   *
   * @param {object} data
   * @param {{status: number}} [status]
   * @returns
   */
  json(data, status) {
    throw new Error("Method 'json()' must be implemented.");
  }

  /**
   * Empty response for prefetch requests. Must be a real Response on App Router
   * (null triggers a 500) and must not include a body that the browser can reuse
   * as a navigation document.
   * @returns
   */
  noContent() {
    throw new Error("Method 'noContent()' must be implemented.");
  }

  error() {
    throw new Error("Method 'error()' must be implemented.");
  }

  /**
   *
   * @returns {URL}
   */
  getUrl() {
    throw new Error("Method 'getUrl()' must be implemented.");
  }

  /**
   *
   * @param {string} key
   * @returns {string | null}
   */
  getSearchParam(key) {
    throw new Error("Method 'getSearchParam()' must be implemented.");
  }

  onError() {
    throw new Error("Method 'onError()' must be implemented.");
  }
}
