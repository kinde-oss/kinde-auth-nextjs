export const getToken = async (req, res) => {
  if (req.cookies.kinde_token) {
    res.status(200).json(JSON.parse(req.cookies.kinde_token));
  } else {
    res.status(500).json({
      message:
        'There is no kinde_token, you are not authenticated. Try logging in.'
    });
  }
};
