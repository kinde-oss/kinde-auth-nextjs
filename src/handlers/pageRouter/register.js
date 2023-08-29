import {prepareForRedirect} from '../../utils/pageRouter/prepareForRedirect';

export const register = async (req, res) => {
  const options = req.query;
  const {org_code, is_create_org, org_name = ''} = options;

  const authUrl = prepareForRedirect(options, 'register', res);

  res.redirect(authUrl);
};
