import { login } from "./login";

export default () =>
  function handler(req, res) {
    let {
      query: { kindeAuth: route },
    } = req;

    route = Array.isArray(route) ? route[0] : route;

    switch (route) {
      case "login":
        login(req, res);
      default:
        res.status(404).end();
    }
  };
