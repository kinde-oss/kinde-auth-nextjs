import {NextResponse} from 'next/server';
import {config} from '../config/index';
import RouterClient from '../routerClients/RouterClient';

export const refresh = async (routerClient: RouterClient) => {
  try {
    await routerClient.kindeClient.refreshTokens(routerClient.sessionManager);
    return NextResponse.redirect(
      config.redirectURL + routerClient.req.nextUrl.searchParams.get('returnTo')
    );
  } catch (error) {
    console.error('refresh', error);
    return routerClient.json({error: error.message}, {status: 500});
  }
};
