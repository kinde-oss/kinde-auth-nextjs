import {cookies} from 'next/headers';
import {sessionManager} from '../sessionManager';
import {kindeClient} from './kindeServerClient';

const getUser = async (req, res) => {
  try {
    const user = await kindeClient.getUser(sessionManager(cookies()));
    console.log('user', user);
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export {getUser};
