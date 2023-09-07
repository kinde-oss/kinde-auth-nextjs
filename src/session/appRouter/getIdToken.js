import {cookies} from 'next/headers';

export const getIdToken = () => {
  const cookieStore = cookies();
  const kinde_token = cookieStore.get('id_token_value');
  if (kinde_token) {
    return JSON.parse(kinde_token.value);
  } else {
    return {
      message:
        'There is no id_token, you are not authenticated. Try logging in.'
    };
  }
};
