// New Pages Router client entrypoint (additive, non-breaking)
// Mirrors root exports for familiarity; explicit path clarifies intended router usage.

export { KindeProvider, useKindeAuth, useKindeBrowserClient } from "../frontend";
export { LoginLink, CreateOrgLink, LogoutLink, RegisterLink, PortalLink } from "../components";
export * from "../types";
