import {prepareForRedirect} from '../../utils/pageRouter/prepareForRedirect';

export const login = async (req, res) => {
  const options = req.query;

  const authUrl = prepareForRedirect(options, 'login', res);

  res.redirect(authUrl);
};
