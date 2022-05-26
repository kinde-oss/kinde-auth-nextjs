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

      res.setHeader(
        "Set-Cookie",
        cookie.serialize(`kinde_token`, JSON.stringify(data), {
          httpOnly: true,
          maxAge: Number(data.expires_in),
        })
      );
    } catch (err) {
      console.log(err);
    }
    res.redirect(config.redirectURL);
  } else {
    res.redirect(config.redirectURL);
  }
};
