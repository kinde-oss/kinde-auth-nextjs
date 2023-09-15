import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';

export const getUserFactory = (req, res) => async () => {
  try {
    const user = await kindeClient.getUser(sessionManager(req, res));
    return user;
  } catch (error) {
    return null;
  }
};
