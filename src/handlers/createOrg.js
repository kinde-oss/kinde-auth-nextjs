import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {kindeClient} from '../../session/appRouter/kindeServerClient';
import {sessionManager} from '../../session/sessionManager';

export const createOrg = async (request) => {
  const org_name = request.nextUrl.searchParams.get('org_name');
  const options = {
    org_name,
    is_create_org: true
  };

  const authUrl = await kindeClient.createOrg(
    sessionManager(cookies()),
    options
  );

  redirect(authUrl);
};
