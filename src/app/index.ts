// New App Router client entrypoint (additive, non-breaking)
// Currently mirrors existing root exports to avoid behavioral divergence.

export { KindeProvider, useKindeAuth, useKindeBrowserClient } from "../frontend";
export { LoginLink, CreateOrgLink, LogoutLink, RegisterLink, PortalLink } from "../components";

export * from "../types";
