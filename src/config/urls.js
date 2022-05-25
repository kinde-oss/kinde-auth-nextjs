export const callbackUrl = new URL(
  `https://${process.env.KINDE_REDIRECT_URL}/api/auth/kinde_callback`
);

const buildUrl = (isRegister) => {
  const url = new URL(`https://${process.env.KINDE_DOMAIN}/oauth2/auth`);

  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", "reg@live");
  url.searchParams.append("redirect_uri", callbackUrl);
  url.searchParams.append("scope", "openid offline");

  if (isRegister) {
    url.searchParams.append("start_page", "registration");
  }

  return url;
};

export const loginUrl = buildUrl();
export const registerUrl = buildUrl(true);
export const logoutUrl = new URL(`https://${process.env.KINDE_DOMAIN}/logout`);
export const tokenUrl = new URL(
  `https://${process.env.KINDE_DOMAIN}/oauth2/token`
);
