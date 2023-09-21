import jwt_decode from 'jwt-decode';
import {config} from '../../config/index';
import {version} from '../../utils/version';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

export const callback = async (request) => {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  const cookieStore = cookies();
  const code_verifier = cookieStore.get(`${config.SESSION_PREFIX}-${state}`);
  if (code_verifier) {
    try {
      const response = await fetch(
        config.issuerURL + config.issuerRoutes.token,
        {
          method: 'POST',
          headers: new Headers({
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Kinde-SDK': `"NextJS"/${version}`
          }),
          body: new URLSearchParams({
            client_id: config.clientID,
            client_secret: config.clientSecret,
            code: code,
            code_verifier: code_verifier.value,
            grant_type: 'authorization_code',
            redirect_uri: `${config.redirectURL}${config.redirectRoutes.callback}`
          })
        }
      );
      const data = await response.json();
      const tokenHeader = jwt_decode(data.access_token, {header: true});
      const payload = jwt_decode(data.access_token);
      let isAudienceValid = true;
      
      if (config.audience)
        isAudienceValid = payload.aud && payload.aud.includes(config.audience);

      if (
        payload.iss === config.issuerURL &&
        tokenHeader.alg === 'RS256' &&
        payload.exp > Math.floor(Date.now() / 1000) &&
        isAudienceValid
      ) {
        cookies().set({
          name: 'kinde_token',
          value: JSON.stringify(data),
          httpOnly: true,
          expires: new Date(payload.exp * 1000),
          sameSite: 'lax',
          secure: config.redirectURL.substring(0, 6) == 'https:',
          path: '/'
        });
      } else {
        console.error('One or more of the claims were not verified.');
      }
    } catch (err) {
      console.error({err});
    }
    const redirectUrl = config.postLoginRedirectURL
      ? config.postLoginRedirectURL
      : config.redirectURL;
    redirect(redirectUrl);
  } else {
    const logoutURL = new URL(config.issuerURL + config.issuerRoutes.logout);
    logoutURL.searchParams.set('redirect', config.postLogoutRedirectURL);
    redirect(logoutURL.href);
  }
};
