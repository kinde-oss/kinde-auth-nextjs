import { validateToken } from "@kinde/jwt-validator";
import {config} from '../config';
import { kindeClient } from "../session/kindeServerClient";
import { SessionManager } from "@kinde-oss/kinde-typescript-sdk";

export const refreshTokens = async(session: SessionManager): Promise<boolean> => {
    try {
        const refreshResult = await kindeClient.refreshTokens(session);
        if (!refreshResult) {
            return false;
        }

        const token = await session.getSessionItem('access_token');

        if (token && typeof token === 'string') {
            const validationResult = await validateToken({
                token,
                domain: config.issuerURL
            });

            return validationResult.valid
        } 
        return false;
        
    } catch (error) {
        if (config.isDebugMode) {
            console.error('refreshTokens', error);
        }
        return false;
    }
}