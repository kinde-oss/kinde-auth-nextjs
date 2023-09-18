import {
  APIsApi,
  ApplicationsApi,
  BusinessApi,
  CallbacksApi,
  Configuration,
  ConnectedAppsApi,
  EnvironmentsApi,
  FeatureFlagsApi,
  IndustriesApi,
  OAuthApi,
  OrganizationsApi,
  PermissionsApi,
  RolesApi,
  SubscribersApi,
  TimezonesApi,
  UsersApi
} from '@kinde-oss/kinde-typescript-sdk';
import {config} from './config/index';
import {sessionManager} from './session/sessionManager';
import {isTokenValid} from './utils/pageRouter/isTokenValid';

export const createKindeManagementAPIClient = async (req, res) => {
  /**
   * Get the API access token from memory or request a new one
   * @param {Request} [req] - optional request (required when used with pages router)
   * @param {Response} [res] - optional response (required when used with pages router)
   * @returns {string}
   */
  const getToken = async (req, res) => {
    const store = sessionManager(req, res);
    const accessToken = store.getSessionItem('kinde_api_access_token');

    if (isTokenValid(accessToken)) {
      return accessToken;
    }

    const response = await fetch(
      `https://onboarding1.localkinde.me/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: config.clientID,
          client_secret: config.clientSecret,
          audience: config.audience
        })
      }
    );

    const token = (await response.json()).access_token;
    store.setSessionItem('kinde_api_access_token', token);
    return token;
  };

  const cfg = new Configuration({
    basePath: config.issuerURL,
    accessToken: getToken(req, res),
    headers: {Accept: 'application/json'}
  });

  /** @type {UsersApi} */
  const usersApi = new UsersApi(cfg);
  const oauthApi = new OAuthApi(cfg);
  const subscribersApi = new SubscribersApi(cfg);
  const organizationsApi = new OrganizationsApi(cfg);
  const connectedAppsApi = new ConnectedAppsApi(cfg);
  const featureFlagsApi = new FeatureFlagsApi(cfg);
  const environmentsApi = new EnvironmentsApi(cfg);
  const permissionsApi = new PermissionsApi(cfg);
  const rolesApi = new RolesApi(cfg);
  const businessApi = new BusinessApi(cfg);
  const industriesApi = new IndustriesApi(cfg);
  const timezonesApi = new TimezonesApi(cfg);
  const applicationsApi = new ApplicationsApi(cfg);
  const callbacksApi = new CallbacksApi(cfg);
  const apisApi = new APIsApi(cfg);

  return {
    getToken,
    usersApi,
    oauthApi,
    subscribersApi,
    organizationsApi,
    connectedAppsApi,
    featureFlagsApi,
    environmentsApi,
    permissionsApi,
    rolesApi,
    businessApi,
    industriesApi,
    timezonesApi,
    applicationsApi,
    callbacksApi,
    apisApi
  };
};
