import { login } from "./login";

export default function handler(req, res) {
  const { kindeAuth: route } = req.query;

  switch (route) {
    case "login":
      return login(req, res);
  }
}
