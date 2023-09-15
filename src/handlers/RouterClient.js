export default class AppRouterClient {
  constructor() {
    if (this.constructor == AppRouterClient) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  redirect() {
    throw new Error("Method 'redirect()' must be implemented.");
  }

  json() {
    throw new Error("Method 'json()' must be implemented.");
  }

  getSearchParam() {
    throw new Error("Method 'getSearchParam()' must be implemented.");
  }
}
