import { getUser } from "./getUser";

const isAuthenticated = (req) => Boolean(getUser(req));

export { isAuthenticated };
