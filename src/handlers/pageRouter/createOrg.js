import {prepareForRedirect} from '../../utils/pageRouter/prepareForRedirect';

export const createOrg = async (req, res) => {
  const options = req.query;
  const {org_name = '', start_page = 'registration'} = options;

  const authUrl = prepareForRedirect(options, 'login', res);

  res.redirect(authUrl);
};
