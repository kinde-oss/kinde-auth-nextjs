import { KindeProvider as KindeReactProvider } from '@kinde-oss/kinde-auth-react';
import React from 'react';
import { config } from '../config';
import { useFetchedKindeState } from './hooks/use-fetched-kinde-state';
import * as store from './store';
import { StorageKeys } from '@kinde/js-utils';

type KindeProviderProps = {
    children: React.ReactNode;
};

export const KindeProvider = ({ children }: KindeProviderProps) => {
    const { loading } = useFetchedKindeState({
        onSuccess: async (state) => {
            await Promise.all([
                store.clientStorage.setSessionItem(
                    StorageKeys.accessToken,
                    state.accessToken
                ),
                store.clientStorage.setSessionItem(StorageKeys.idToken, state.idToken),
            ]);
        },
    });
    if (loading) return null;
    return (
        <KindeReactProvider
            clientId={config.clientID}
            domain={config.issuerURL}
            redirectUri={config.redirectURL}
        >
            {children}
        </KindeReactProvider>
    );
};
