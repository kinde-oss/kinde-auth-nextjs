import {validateToken} from '@kinde/jwt-validator';
import {getUserFactory} from './getUser';
import {sessionManager} from './sessionManager';
import {config} from '../config';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async () => {
  const accessToken = await (
    await sessionManager(req, res)
  ).getSessionItem('access_token');
  
  if (!accessToken || typeof accessToken !== 'string') {
    return false;
  }

  const validToken = await validateToken({
    token: accessToken,
    domain: config.issuerURL
  });

  const user = await getUserFactory(req, res)();
  return validToken.valid && Boolean(user);
};
