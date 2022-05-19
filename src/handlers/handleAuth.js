import { login } from "./login";

export default () =>
  function handler(req, res) {
    console.log(req);

    let {
      query: { kindeAuth: route },
    } = req;

    switch (route) {
      case "login":
        return login(req, res);
      default:
        res.status(404).end();
    }
  };
