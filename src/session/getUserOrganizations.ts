import { sessionManager } from "./sessionManager";
import { kindeClient } from "./kindeServerClient";
import { config } from "../config/index";
import { NextApiRequest, NextApiResponse } from "next";
import { KindeOrganizations } from "../../types";

export const getUserOrganizationsFactory =
  (req?: NextApiRequest, res?: NextApiResponse) =>
  async (): Promise<KindeOrganizations | null> => {
    try {
      const session = await sessionManager(req, res);
      const userOrgs = await kindeClient.getUserOrganizations(session);
      const orgNames =
        ((await kindeClient.getClaimValue(
          session,
          "organizations",
          "id_token",
        )) as { id: string; name: string }[]) ?? [];

      const hasuraOrgCodes =
        ((await kindeClient.getClaimValue(
          session,
          "x-hasura-org-codes",
          "id_token",
        )) as string[]) ?? [];

      const hasuraOrganizations =
        ((await kindeClient.getClaimValue(
          session,
          "x-hasura-organizations",
          "id_token",
        )) as { id: string; name: string }[]) ?? [];
      return {
        orgCodes: [...userOrgs.orgCodes, ...hasuraOrgCodes],
        orgs: [...orgNames, ...hasuraOrganizations].map((org) => ({
          code: org?.id,
          name: org?.name,
        })),
      };
    } catch (error) {
      if (config.isDebugMode) {
        console.debug("getUserOrganization error:", error);
      }
      return null;
    }
  };
