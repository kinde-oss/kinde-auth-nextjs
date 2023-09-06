import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {config} from '../../config/index';
import {sessionManager} from '../../session/sessionManager';

export const callback = async (request) => {
  // const code = request.nextUrl.searchParams.get('code');
  // const state = request.nextUrl.searchParams.get('state');

  // const cookieStore = cookies();
  // const code_verifier = cookieStore.get(`ac-state-key`);
  // if (code_verifier) {
  //   try {
  //     const response = await fetch(
  //       config.issuerURL + config.issuerRoutes.token,
  //       {
  //         method: 'POST',
  //         headers: new Headers({
  //           'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
  //           'Kinde-SDK': `"NextJS"/${version}`
  //         }),
  //         body: new URLSearchParams({
  //           client_id: config.clientID,
  //           client_secret: config.clientSecret,
  //           code: code,
  //           code_verifier: code_verifier.value,
  //           grant_type: 'authorization_code',
  //           redirect_uri: `${config.redirectURL}${config.redirectRoutes.callback}`
  //         })
  //       }
  //     );
  //     const data = await response.json();
  //     const tokenHeader = jwt_decode(data.access_token, {header: true});
  //     const payload = jwt_decode(data.access_token);
  //     let isAudienceValid = true;
  //     if (config.audience) isAudienceValid = payload.aud === config.audience;

  //     if (
  //       payload.iss === config.issuerURL &&
  //       tokenHeader.alg === 'RS256' &&
  //       payload.exp > Math.floor(Date.now() / 1000) &&
  //       isAudienceValid
  //     ) {
  //       cookies().set({
  //         name: 'kinde_token',
  //         value: JSON.stringify(data),
  //         httpOnly: true,
  //         expires: new Date(payload.exp * 1000),
  //         sameSite: 'lax',
  //         secure: true,
  //         path: '/'
  //       });
  //     } else {
  //       console.error('One or more of the claims were not verified.');
  //     }
  //   } catch (err) {
  //     console.error({err});
  //   }
  //   const redirectUrl = config.postLoginURL
  //     ? config.postLoginURL
  //     : config.redirectURL;
  //   redirect(redirectUrl);
  // } else {
  //   console.log('SOMETHING WENT WRONG');
  //   const logoutURL = new URL(config.issuerURL + config.issuerRoutes.logout);
  //   logoutURL.searchParams.set('redirect', config.postLogoutRedirectURL);
  //   redirect(logoutURL.href);
  // }
  const kindeClient = createKindeServerClient(
    config.grantType,
    config.clientOptions
  );

  await kindeClient.handleRedirectToApp(
    sessionManager(cookies()),
    new URL(request.url)
  );

  redirect(config.postLoginURL);
};
