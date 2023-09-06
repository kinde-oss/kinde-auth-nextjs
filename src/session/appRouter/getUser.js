// import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
// import {config} from '../../config/index';
// import {sessionManager} from '../sessionManager';

const getUser = () => {
  // const kindeClient = createKindeServerClient(
  //   config.grantType,
  //   config.clientOptions
  // );
  // try {
  //   const user = JSON.parse(
  //     await kindeClient.getUser(sessionManager(cookies()))
  //   );
  //   return user;
  // } catch (error) {
  //   return null;
  // }

  const userCookie = cookies().get('user');
  if (userCookie) {
    return JSON.parse(userCookie.value);
  }
  return null;
};

export {getUser};
