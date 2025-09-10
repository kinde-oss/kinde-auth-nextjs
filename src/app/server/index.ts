// New App Router server entrypoint (additive, non-breaking)
// For now, simply re-exports existing server APIs.

export { default as getKindeServerSession } from "../../session";
export { withAuth } from "../../authMiddleware/authMiddleware";
export { createKindeManagementAPIClient } from "../../api-client";
export { default as handleAuth } from "../../handlers/auth";
export { protectApi, protectPage } from "../../handlers/protect";
export { LoginLink, CreateOrgLink, LogoutLink, RegisterLink, PortalLink } from "../../components";

// Types
export * from "../../types";
