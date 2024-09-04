import {NextResponse} from 'next/server';
import {config} from '../config/index';
import RouterClient from '../routerClients/RouterClient';

const handleSuccess = (routerClient: RouterClient, redirectURL: string) => {
  const returnTo = routerClient.req.nextUrl.searchParams.get('returnTo') || '';
  return NextResponse.redirect(redirectURL + returnTo);
};

const handleError = (error: Error) => {
  return NextResponse.json({error: 'Token refresh failed'}, {status: 401});
};

export const refresh = async (routerClient: RouterClient) => {
  try {
    await routerClient.kindeClient.refreshTokens(routerClient.sessionManager);
    return handleSuccess(routerClient, config.redirectURL);
  } catch (error) {
    return handleError(error);
  }
};
