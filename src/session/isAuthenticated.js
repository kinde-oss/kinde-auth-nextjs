import {getUserFactory} from './getUser';

export const isAuthenticatedFactory = (req, res) => async () => {
  const user = await getUserFactory(req, res)();
  return Boolean(user);
};
