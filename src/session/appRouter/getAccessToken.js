import {cookies} from 'next/headers';

export const getAccessToken = (request) => {
  const cookieStore = cookies();
  const kinde_token = cookieStore.get('access_token_payload');
  if (kinde_token) {
    return JSON.parse(kinde_token.value);
  } else {
    return {
      message:
        'There is no access_token, you are not authenticated. Try logging in.'
    };
  }
};
