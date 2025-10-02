export { withAuth } from "../../authMiddleware/authMiddleware";
export { createKindeManagementAPIClient } from "../../api-client";
export { default as handleAuth } from "../../handlers/auth";
export { protectApi, protectPage } from "../../handlers/protect";
export * from "../../types";

// Server helper factories & SSR user prefetch
export { createAppServerHelpers } from "../../server/createServerHelpers";
export { getServerUser } from "../../server/getServerUser";
