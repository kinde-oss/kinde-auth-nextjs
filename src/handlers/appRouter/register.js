import {prepareForRedirect} from '../../utils/appRouter/prepareForRedirect';
import {redirect} from 'next/navigation';

export const register = async (request) => {
  const org_code = request.nextUrl.searchParams.get('org_code');

  const options = {org_code};

  const authUrl = prepareForRedirect(options, 'register');

  redirect(authUrl);
};
