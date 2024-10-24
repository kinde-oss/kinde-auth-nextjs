import {getAccessTokenWithRefresh} from '../utils/getAccessTokenWithRefresh';
import {NextApiRequest, NextApiResponse} from 'next';

/**
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {Promise<string>}
 */
// @ts-ignore
export const getAccessTokenRawFactory =
  (req: NextApiRequest, res: NextApiResponse) => async () => {
    return await getAccessTokenWithRefresh(req, res);
  };
