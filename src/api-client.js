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

/**
 * Create the Kinde Management API client
 * @param {Request | import('next').NextApiRequest} [req] - optional request (required when used with pages router)
 * @param {Response | import('next').NextApiResponse} [res] - optional response (required when used with pages router)
 */
export const createKindeManagementAPIClient = async (req, res) => {
  let apiToken = null;

  const store = await sessionManager(req, res);
  store.removeSessionItem('kinde_api_access_token');

  const response = await fetch(`${config.issuerURL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientID || '',
      client_secret: config.clientSecret || '',
      audience: config.issuerURL + '/api'
    })
  });
  apiToken = (await response.json()).access_token;

  const cfg = new Configuration({
    basePath: config.issuerURL,
    accessToken: apiToken,
    headers: {Accept: 'application/json'}
  });

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
