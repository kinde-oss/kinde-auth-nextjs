import {redirect} from 'next/navigation';
import {prepareForRedirect} from '../../utils/appRouter/prepareForRedirect';

export const login = async (request) => {
  const org_code = request.nextUrl.searchParams.get('org_code');
  const post_login_redirect_url = request.nextUrl.searchParams.get(
    'post_login_redirect_url'
  );
  const options = {org_code, post_login_redirect_url};
  const authUrl = prepareForRedirect(options);

  redirect(authUrl);
};
