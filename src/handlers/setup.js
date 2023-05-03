import { config } from "../config/index";
const cookie = require("cookie");
import jwt_decode from "jwt-decode";

export const setup = async (req, res) => {
  const kinde_token = cookie.parse(req.headers.cookie || "")["kinde_token"];

  if (kinde_token) {
    const token = JSON.parse(kinde_token);
    const accessTokenPayload = jwt_decode(token.access_token);
    const idTokenPayload = jwt_decode(token.id_token);
    res.send({
      access_token_encoded: token.access_token,
      id_token: idTokenPayload,
      access_token: accessTokenPayload,
    });
  } else {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
};
