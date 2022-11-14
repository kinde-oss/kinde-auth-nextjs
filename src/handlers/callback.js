import jwt_decode from "jwt-decode";
import { config } from "../config/index";
var cookie = require("cookie");

export const callback = async (req, res) => {
  const { code, state } = req.query;
  const code_verifier = cookie.parse(req.headers.cookie || "")[
    `${config.SESSION_PREFIX}-${state}`
  ];

  if (code_verifier) {
    try {
      const response = await fetch(
        config.issuerURL + config.issuerRoutes.token,
        {
          method: "POST",
          headers: new Headers({
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          }),
          body: new URLSearchParams({
            client_id: config.clientID,
            client_secret: config.clientSecret,
            code,
            code_verifier,
            grant_type: "authorization_code",
            redirect_uri: config.redirectURL + config.redirectRoutes.callback,
          }),
        }
      );
      const data = await response.json();
      const accessTokenHeader = jwt_decode(data.access_token, { header: true });
      const accessTokenPayload = jwt_decode(data.access_token);

      let isAudienceValid = true;

      if (config.audience != undefined) {
        isAudienceValid = accessTokenPayload.aud == config.audience;
      }

      if (
        accessTokenPayload.iss == config.issuerURL &&
        accessTokenHeader.alg == "RS256" &&
        accessTokenPayload.exp > Math.floor(Date.now() / 1000) &&
        isAudienceValid
      ) {
        res.setHeader(
          "Set-Cookie",
          cookie.serialize(`kinde_token`, JSON.stringify(data), {
            httpOnly: true,
            maxAge: 3600,
            sameSite: "strict",
            secure: true,
            path: "/",
          })
        );
      } else {
        console.error("One or more of the claims were not verified.");
        const logoutURL = new URL(
          config.issuerURL + config.issuerRoutes.logout
        );
        logoutURL.searchParams.set("redirect", config.postLogoutRedirectURL);
        res.redirect(logoutURL.href);
      }
    } catch (err) {
      console.error(err);
    }
    res.redirect(config.redirectURL);
  } else {
    const logoutURL = new URL(config.issuerURL + config.issuerRoutes.logout);
    logoutURL.searchParams.set("redirect", config.postLogoutRedirectURL);
    res.redirect(logoutURL.href);
  }
};
