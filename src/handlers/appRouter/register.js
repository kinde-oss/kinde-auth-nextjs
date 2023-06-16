import {prepareForRedirect} from '../../utils/appRouter/prepareForRedirect';
import {redirect} from 'next/navigation';

export const register = async (request) => {
  const org_name = request.nextUrl.searchParams.get('org_name');
  const org_code = request.nextUrl.searchParams.get('org_code');
  const is_create_org = request.nextUrl.searchParams.get('is_create_org');

  const options = {org_name, org_code, is_create_org};

  const authUrl = prepareForRedirect(options, 'register');

  redirect(authUrl);
};
