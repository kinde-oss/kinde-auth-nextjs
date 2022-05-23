import { login } from "./login";
import { logout } from "./logout";
import { me } from "./me";
import { register } from "./register";

export default () =>
  function handler(req, res) {
    let {
      query: { kindeAuth: route },
    } = req;

    route = Array.isArray(route) ? route[0] : route;

    switch (route) {
      case "login":
        login(req, res);
      case "register":
        register(req, res);
      case "me":
        me(req, res);
      case "logout":
        logout(req, res);
      default:
        res.status(404).end();
    }
  };
