import {cookies} from 'next/headers';
import {sessionManager} from '../sessionManager';
import {kindeClient} from './kindeServerClient';

const getUser = async (req, res) => {
  try {
    const user = await kindeClient.getUser(sessionManager(cookies()));
    return user;
  } catch (error) {
    return null;
  }
};

export {getUser};
