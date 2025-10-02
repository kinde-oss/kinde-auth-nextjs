export { withAuth } from "../../authMiddleware/authMiddleware";
export { protectApi, protectPage } from "../../handlers/protect";
export { default as handleAuth } from "../../handlers/auth";
export { createKindeManagementAPIClient } from "../../api-client";
export * from "../../types";

// Server helper factories & SSR user prefetch
export { createPagesServerHelpers } from "../../server/createServerHelpers";
export { getServerUser } from "../../server/getServerUser";
