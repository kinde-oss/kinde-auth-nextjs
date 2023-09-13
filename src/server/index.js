export {default as handleAuth} from '../handlers/auth';
import * as serverSession from '../session/appRouter/index';

export const getKindeServerSession = () => {
  return serverSession;
};

export {authMiddleware} from '../authMiddleware/authMiddleware';

export {RegisterLink} from '../components/RegisterLink';
export {LoginLink} from '../components/LoginLink';
export {LogoutLink} from '../components/LogoutLink';
export {CreateOrgLink} from '../components/CreateOrgLink';
