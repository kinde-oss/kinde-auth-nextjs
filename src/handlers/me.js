import { config } from "../config/index";

var cookie = require("cookie");

export const me = async (req, res) => {
  const kinde_token = cookie.parse(req.headers.cookie || "")["kinde_token"];
  if (kinde_token) {
    const token = JSON.parse(kinde_token);
    try {
      const response = await fetch(
        config.issuerURL + config.issuerRoutes.profile,
        {
          headers: new Headers({
            Authorization: "Bearer " + token.access_token,
          }),
        }
      );
      const data = await response.json();
      res.send(data);
    } catch (err) {
      console.error(err);
    }
  } else {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
};
