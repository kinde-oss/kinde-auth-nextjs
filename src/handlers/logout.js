import RouterClient from '../routerClients/RouterClient';

/**
 *
 * @param {RouterClient} routerClient
 */
export const logout = async (routerClient) => {
  const authUrl = await routerClient.kindeClient.logout(
    routerClient.sessionManager
  );

  routerClient.redirect(authUrl.toString());
};
