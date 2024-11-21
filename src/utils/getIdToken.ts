import { validateToken } from "@kinde/jwt-validator";
import {config} from '../config';
import {sessionManager} from '../session/sessionManager';

export const getIdToken = async(req, res) => {
    try {
        const session = await sessionManager(req, res);
        const token = await session.getSessionItem('id_token');

        if (!token || typeof token !== 'string') {
            if (config.isDebugMode) {
                console.error('getIdToken: invalid token or token is missing');
            }
            return null;
        }

        const validationResult = await validateToken({
            token,
            domain: config.issuerURL
          });

        if (!validationResult.valid) {
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