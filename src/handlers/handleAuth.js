import { login } from "./login";

export default function handler(req, res) {
  let {
    query: { kindeAuth: route },
  } = req;

  switch (route) {
    case "login":
      return login(req, res);
    default:
      res.status(404).end();
  }
}
