import jwt_decode from 'jwt-decode';
import {cookies} from 'next/headers';

export const getAccessToken = (request) => {
  const cookieStore = cookies();
  const kinde_token = cookieStore.get('kinde_token');
  if (kinde_token) {
    const accessTokenPayload = jwt_decode(
      JSON.parse(kinde_token.value).access_token
    );
    return accessTokenPayload;
  } else {
    return {
      message:
        'There is no kinde_token, you are not authenticated. Try logging in.'
    };
  }
};
