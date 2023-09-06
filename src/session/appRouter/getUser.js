import {cookies} from 'next/headers';

const getUser = () => {
  const userCookie = cookies().get('user');
  if (userCookie) {
    return JSON.parse(userCookie.value);
  }
  return null;
};

export {getUser};
