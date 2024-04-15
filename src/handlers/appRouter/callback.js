import jwt_decode from 'jwt-decode';
import {config} from '../../config/index';
import {version} from '../../utils/version';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {sanitizeRedirect} from '../../utils/sanitizeRedirect';
import {generateCallbackUrl} from '../../utils/generateCallbackUrl';

export const callback = async (request) => {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  const cookieStore = cookies();
  const jsonCookieValue = cookieStore.get(`${config.SESSION_PREFIX}-${state}`);

  let redirectUrl = config.postLoginRedirectURL || config.redirectURL;

  if (jsonCookieValue) {
    const {code_verifier, options} = JSON.parse(jsonCookieValue.value);

    if (options?.post_login_redirect_url) {
      redirectUrl = sanitizeRedirect({
        baseUrl: new URL(config.redirectURL).origin,
        url: options.post_login_redirect_url
      });
    }

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
            code_verifier: code_verifier,
            grant_type: 'authorization_code',
            redirect_uri: generateCallbackUrl(
              config.redirectURL,
              config.redirectRoutes.callback
            )
          })
        }
      );
      const data = await response.json();
      console.log('look here', data);
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
          path: '/',
          domain: config.cookieDomain ? config.cookieDomain : undefined
        });
      } else {
        console.error('One or more of the claims were not verified.');
      }
    } catch (err) {
      console.error({err});
    }
    redirect(redirectUrl);
  } else {
    const logoutURL = new URL(config.issuerURL + config.issuerRoutes.logout);
    logoutURL.searchParams.set('redirect', config.postLogoutRedirectURL);
    redirect(logoutURL.href);
  }
};
