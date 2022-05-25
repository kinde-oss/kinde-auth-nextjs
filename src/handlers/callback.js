import { SESSION_PREFIX } from "../config/sessionPrefix";
import { callbackUrl, tokenUrl } from "../config/urls";

var cookie = require("cookie");

export const callback = async (req, res) => {
  const { code, state } = req.query;
  const code_verifier = cookie.parse(req.headers.cookie)[
    `${SESSION_PREFIX}-${state}`
  ];

  if (code_verifier) {
    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: new Headers({
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        }),
        body: new URLSearchParams({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          code,
          code_verifier,
          grant_type: "authorization_code",
          redirect_uri: callbackUrl,
        }),
      });
      const data = await response.json();

      // clear cookies
      res.setHeader(
        "Set-Cookie",
        cookie.serialize(`kinde_token`, data.access_token, {
          httpOnly: true,
          maxAge: Number(data.expires_in),
        })
      );
    } catch (err) {
      console.log(err);
    }
    res.redirect(`https://${process.env.KINDE_REDIRECT_URL}`);
  } else {
    res.redirect(`https://${process.env.KINDE_REDIRECT_URL}`);
  }
};
