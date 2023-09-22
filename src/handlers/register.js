export const register = async (routerClient) => {
  const authUrl = await routerClient.kindeClient.register(
    routerClient.sessionManager
  );

  routerClient.redirect(authUrl);
};
