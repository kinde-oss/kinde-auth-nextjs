export {handleAuth} from '../handlers/appRouter/index';
import * as yep from '../session/appRouter/index';

export const getKindeServerSession = () => {
  return yep;
};

export {authMiddleware} from '../authMiddleware/authMiddleware';
