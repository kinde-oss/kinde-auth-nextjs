import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {config} from '../../config/index';
import {kindeClient} from '../../session/appRouter/kindeServerClient';
import {sessionManager} from '../../session/sessionManager';

export const callback = async (request) => {
  await kindeClient.handleRedirectToApp(
    sessionManager(cookies()),
    new URL(request.url)
  );

  // const cookieStore = cookies();
  // const jsonCookieValue = cookieStore.get(`${config.SESSION_PREFIX}-${state}`);

  // let redirectUrl = config.postLoginRedirectURL || config.redirectURL;

  // if (jsonCookieValue) {
  //   const {code_verifier, options} = JSON.parse(jsonCookieValue.value);

  //   if (options?.post_login_redirect_url) {
  //     redirectUrl = sanitizeRedirect({
  //       baseUrl: new URL(config.redirectURL).origin,
  //       url: options.post_login_redirect_url
  //     });
  //   }

  redirect(config.postLoginRedirectURL);
};
