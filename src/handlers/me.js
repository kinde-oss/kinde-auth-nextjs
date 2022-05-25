var cookie = require("cookie");

export const me = async (req, res) => {
  const kinde_token = cookie.parse(req.headers.cookie || "")["kinde_token"];
  const token = JSON.parse(kinde_token);
  if (kinde_token) {
    try {
      const response = await fetch(
        `https://${process.env.KINDE_DOMAIN}/oauth2/user_profile`,
        {
          headers: new Headers({
            Authorization: "Bearer " + token.access_token,
          }),
        }
      );
      const data = await response.json();
      res.send(data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }
  res.end();
};
