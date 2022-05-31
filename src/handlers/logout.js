import { config } from "../config/index";

var cookie = require("cookie");

export const logout = async (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("kinde_token", null, {
      httpOnly: true,
      maxAge: 0,
    })
  );

  const logoutURL = new URL(config.issuerURL + config.issuerRoutes.logout);

  logoutURL.searchParams.set("redirect", config.postLogoutRedirectURL);

  res.redirect(logoutURL.href);
};
