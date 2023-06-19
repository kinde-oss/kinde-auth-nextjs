export {handleAuth} from '../handlers/appRouter/index';
import * as serverSession from '../session/appRouter/index';

export const getKindeServerSession = () => {
  return serverSession;
};

export {authMiddleware} from '../authMiddleware/authMiddleware';
