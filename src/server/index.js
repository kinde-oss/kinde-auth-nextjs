export { default as getKindeServerSession } from "../session/index.ts";
export { withAuth } from "../authMiddleware/authMiddleware";
export {
  LoginLink,
  CreateOrgLink,
  LogoutLink,
  RegisterLink,
} from "../components/index";
export { createKindeManagementAPIClient } from "../api-client";
import _handleAuth from "../handlers/auth";
export const handleAuth = (...args) => _handleAuth(...args);
export { protectPage, protectApi } from "../handlers/protect";
