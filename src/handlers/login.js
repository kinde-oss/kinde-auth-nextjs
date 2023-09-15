export const login = async (routerClient) => {
  const authUrl = await routerClient.kindeClient.login(
    routerClient.sessionManager
  );

  routerClient.redirect(authUrl);
};
