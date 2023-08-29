import {prepareForRedirect} from '../../utils/pageRouter/prepareForRedirect';

export const createOrg = async (req, res) => {
  const {org_name = ''} = req.query.options;
  const options = {
    org_name,
    is_create_org: true
  };
  const authUrl = prepareForRedirect(options, 'register', res);

  res.redirect(authUrl);
};
