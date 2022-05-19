import { login } from "./login";

export default () =>
  function handler(req, res) {
    console.log(req);
    console.log("req.query", req.query);

    let {
      query: { kindeAuth: route },
    } = req;

    console.log("route", route);
    switch (route) {
      case "login":
        return login(req, res);
      default:
        res.status(404).end();
    }
  };
