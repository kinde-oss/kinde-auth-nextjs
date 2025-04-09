import { sessionManager } from "./sessionManager";
import { kindeClient } from "./kindeServerClient";
import { config } from "../config/index";
import { NextApiRequest, NextApiResponse } from "next";
import { KindeOrganizations } from "../types";

export const getUserOrganizationsFactory =
  (req?: NextApiRequest, res?: NextApiResponse) =>
  async (): Promise<KindeOrganizations | null> => {
    try {
      const session = await sessionManager(req, res);
      const userOrgs = await kindeClient.getUserOrganizations(session);

      const idTokenOrgs =
        ((await kindeClient.getClaimValue(
          session,
          "organizations",
          "id_token",
        )) as { id: string; name: string }[]) ?? [];
      const idTokenHasuraOrgs =
        ((await kindeClient.getClaimValue(
          session,
          "x-hasura-organizations",
          "id_token",
        )) as { id: string; name: string }[]) ?? [];

      const orgNames = [...idTokenOrgs, ...idTokenHasuraOrgs];

      const hasuraOrgCodes =
        ((await kindeClient.getClaimValue(
          session,
          "x-hasura-org-codes",
          "id_token",
        )) as string[]) ?? [];

      const mappedOrgs = [...orgNames].map((org) => ({
        code: org?.id,
        name: org?.name,
      }));

      const result: KindeOrganizations = {
        orgCodes: [...userOrgs.orgCodes, ...hasuraOrgCodes],
        orgs: mappedOrgs,
      };

      if (mappedOrgs.length > 0) {
        console.warn(
          "Warning: organizations are not in ID token so names are missing.",
        );
      }

      return result;
    } catch (error) {
      if (config.isDebugMode) {
        console.debug("getUserOrganization error:", error);
      }
      return null;
    }
  };
