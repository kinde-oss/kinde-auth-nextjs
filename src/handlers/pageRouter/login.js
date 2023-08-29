import {prepareForRedirect} from '../../utils/pageRouter/prepareForRedirect';

export const login = async (req, res) => {
  const options = req.query;
  const {org_code, is_create_org, org_name = ''} = options;

  const authUrl = prepareForRedirect(options, 'login', res);

  res.redirect(authUrl);
};
