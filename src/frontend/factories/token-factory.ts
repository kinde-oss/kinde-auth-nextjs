import { KindeAccessToken, KindeIdToken } from "../../types";

export const getClaimFactory = (accessToken: KindeAccessToken, idToken: KindeIdToken) => {
    return (claim: string, tokenKey: "access_token" | "id_token" = "access_token") => {
        const token = tokenKey === "access_token" ? accessToken : idToken;
        return token ? { name: claim, value: token[claim] } : null;
    }
}

export const getNextTypedAccessTokenFactory = (accessToken: KindeAccessToken) => {
    return (): KindeAccessToken | null => accessToken;
}

export const getRawAccessTokenFactory = (rawAccessToken: string) => {
    return (): string | null => rawAccessToken;
}

export const getNextTypedIdTokenFactory = (idToken: KindeIdToken) => {
    return (): KindeIdToken | null => idToken;
}

export const getRawIdTokenFactory = (rawIdToken: string) => {
    return (): string | null => rawIdToken;
}