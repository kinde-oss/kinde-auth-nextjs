import jwt_decode from 'jwt-decode';

export const getAccessToken = (req, res) => {
  if (req.cookies.kinde_token) {
    const accessTokenPayload = jwt_decode(
      JSON.parse(req.cookies.kinde_token).access_token
    );
    return accessTokenPayload;
  } else {
    return {
      message:
        'There is no kinde_token, you are not authenticated. Try logging in.'
    };
  }
};
