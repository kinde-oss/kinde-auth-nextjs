// New Pages Router server entrypoint (additive, non-breaking)

export { default as getKindeServerSession } from "../../session";
export { withAuth } from "../../authMiddleware/authMiddleware";
export { createKindeManagementAPIClient } from "../../api-client";
export { default as handleAuth } from "../../handlers/auth";
export { protectApi, protectPage } from "../../handlers/protect";
export {
  LoginLink,
  CreateOrgLink,
  LogoutLink,
  RegisterLink,
  PortalLink,
} from "../../components";
export * from "../../types";

// Wrapper (syntactic sugar)
import getKindeServerSession from "../../session";

export const createPagesRouterSession = (req?: any, res?: any) => {
  return getKindeServerSession(req, res);
};
