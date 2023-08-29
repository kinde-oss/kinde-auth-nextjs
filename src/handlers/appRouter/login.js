import {generateAuthUrl} from '../../utils/generateAuthUrl';
import {redirect} from 'next/navigation';
import {prepareForRedirect} from '../../utils/appRouter/prepareForRedirect';

export const login = async (request) => {
  const org_code = request.nextUrl.searchParams.get('org_code');
  const options = {org_code};
  const authUrl = prepareForRedirect(options);

  redirect(authUrl);
};
