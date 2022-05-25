import { logoutUrl } from "../config/urls";

var cookie = require("cookie");

export const logout = async (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(`kinde_token`, null, {
      httpOnly: true,
      maxAge: 0,
    })
  );
  logoutUrl.searchParams.set(
    "redirect",
    process.env.KINDE_LOGOUT_URL
      ? `https://${process.env.KINDE_LOGOUT_URL}`
      : `https://${process.env.KINDE_REDIRECT_URL}`
  );
  res.redirect(logoutUrl.href);
};
