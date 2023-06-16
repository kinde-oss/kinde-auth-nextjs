import { getIdToken } from "./getIdToken";

const getUser = (req) => {
  const idToken = getIdToken(req);
  return idToken
    ? {
        id: idToken.sub,
        given_name: idToken.given_name,
        family_name: idToken.family_name,
        email: idToken.email,
        picture: idToken.picture,
      }
    : undefined;
};

export { getUser };
