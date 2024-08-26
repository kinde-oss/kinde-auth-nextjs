import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';
import {config} from '../config/index';
import {NextApiRequest, NextApiResponse} from 'next';
import {KindeOrganizations} from '../../types';

export const getUserOrganizationsFactory =
  (req?: NextApiRequest, res?: NextApiResponse) =>
  async (): Promise<KindeOrganizations | null> => {
    try {
      const userOrgs = await kindeClient.getUserOrganizations(
        sessionManager(req, res)
      );
      const orgNames = (await kindeClient.getClaimValue(
        sessionManager(req, res),
        'organizations',
        'id_token'
      )) as {id: string; name: string}[];

      const hasuraOrgCodes = (await kindeClient.getClaimValue(
        sessionManager(req, res),
        'x-hasura-org-codes',
        'id_token'
      )) as string[];

      const hasuraOrganizations = (await kindeClient.getClaimValue(
        sessionManager(req, res),
        'x-hasura-organizations',
        'id_token'
      )) as {id: string; name: string}[];

      return {
        orgCodes: [...userOrgs.orgCodes, ...hasuraOrgCodes],
        orgs: [...orgNames, ...hasuraOrganizations].map((org) => ({
          code: org?.id,
          name: org?.name
        }))
      };
    } catch (error) {
      if (config.isDebugMode) {
        console.debug('getUser', error);
      }
      return null;
    }
  };
