import {config} from '../config';
import {sessionManager} from '../session/sessionManager';
import { NextApiRequest, NextApiResponse } from "next";
import { validateToken } from './validateToken';

export const getIdToken = async(req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await sessionManager(req, res);
        const token = await session.getSessionItem('id_token');

        if (!token || typeof token !== 'string') {
            if (config.isDebugMode) {
                console.error('getIdToken: invalid token or token is missing');
            }
            return null;
        }

        const isTokenValid = await validateToken({
            token
          });

        if (!isTokenValid) {
            if (config.isDebugMode) {
                console.error('getIdToken: invalid token');
            }
            return null;
        }

        return token
    } catch (error) {
        if (config.isDebugMode) {
            console.error('getIdToken', error);
        }
        return null;
    }
}