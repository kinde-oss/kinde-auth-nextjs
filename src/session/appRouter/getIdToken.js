import jwt_decode from 'jwt-decode';
import {cookies} from 'next/headers';

export const getIdToken = (request) => {
  const cookieStore = cookies();
  const kinde_token = cookieStore.get('kinde_token');
  if (kinde_token) {
    const payload = jwt_decode(JSON.parse(kinde_token.value).id_token);
    return payload;
  } else {
    return undefined;
  }
};
