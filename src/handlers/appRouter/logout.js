import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {config} from '../../config/index';

export const logout = async (request) => {
  const cookieStore = cookies();
  cookies().set({
    name: 'kinde_token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
    secure: config.redirectURL.substring(0, 6) == 'https:',
    path: '/'
  });

  const logoutURL = new URL(config.issuerURL + config.issuerRoutes.logout);
  logoutURL.searchParams.set('redirect', config.postLogoutRedirectURL || '');
  redirect(logoutURL.href);
};
