import { validateToken } from "@kinde/jwt-validator";
import {config} from '../config';
import {sessionManager} from '../session/sessionManager';
import { NextApiRequest, NextApiResponse } from "next";

export const getAccessToken = async(req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await sessionManager(req, res);
        const token = await session.getSessionItem('access_token');

        if (!token || typeof token !== 'string') {
            if (config.isDebugMode) {
                console.error('getAccessToken: invalid token or token is missing');
            }
            return null;
        }

        const validationResult = await validateToken({
            token,
            domain: config.issuerURL
          });

        if (!validationResult.valid) {
            // look for refresh token



            if (config.isDebugMode) {
                console.error('getAccessToken: invalid token');
            }
            return null;
        }

        return token
    } catch (error) {
        if (config.isDebugMode) {
            console.error('getAccessToken', error);
        }
        return null;
    }
}