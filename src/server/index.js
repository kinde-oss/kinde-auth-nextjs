export {default as handleAuth} from '../handlers/auth';
import {getPermissionsFactory} from '../session/appRouter/getPermissions';
import {getUserFactory} from '../session/appRouter/getUser';
import * as serverSession from '../session/appRouter/index';

export const getKindeServerSession = (req, res) => {
  return {
    ...serverSession,
    getUser: getUserFactory(req, res),
    getPermissions: getPermissionsFactory(req, res)
  };
};

export {authMiddleware} from '../authMiddleware/authMiddleware';

export {RegisterLink} from '../components/RegisterLink';
export {LoginLink} from '../components/LoginLink';
export {LogoutLink} from '../components/LogoutLink';
export {CreateOrgLink} from '../components/CreateOrgLink';
