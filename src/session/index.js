import {getPermissionsFactory} from './getPermissions';
import {getUserFactory} from './getUser';

export const getKindeServerSession = (req, res) => ({
  getUser: getUserFactory(req, res),
  getPermissions: getPermissionsFactory(req, res)
});
