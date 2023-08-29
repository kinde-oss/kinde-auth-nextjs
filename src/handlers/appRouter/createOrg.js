import {prepareForRedirect} from '../../utils/appRouter/prepareForRedirect';
import {redirect} from 'next/navigation';

export const createOrg = async (request) => {
  const org_name = request.nextUrl.searchParams.get('org_name');
  const options = {
    org_name,
    is_create_org: true
  };
  const authUrl = prepareForRedirect(options, 'register');

  redirect(authUrl);
};
