import {prepareForRedirect} from '../../utils/pageRouter/prepareForRedirect';

export const register = async (req, res) => {
  const options = req.query;
  const authUrl = prepareForRedirect(options, 'register', res);

  res.redirect(authUrl);
};
