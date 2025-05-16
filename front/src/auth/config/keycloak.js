"use client";

import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: 'http://localhost:6060', // URL Keycloak خود را جایگزین کنید
    realm: 'note', // Realm Keycloak خود را جایگزین کنید
    clientId: 'dashboard', // Client ID Keycloak خود را جایگزین کنید
};

let keycloak;

if (typeof window !== 'undefined') {
    console.log({keycloakConfig})
    keycloak = new Keycloak(keycloakConfig);
}

let isInitialized = false;

export const initKeycloak = () => {
    if (!isInitialized && keycloak) {
        isInitialized = true;
        return keycloak
            .init({
                onLoad: 'login-required',
                redirectUri: 'http://localhost:3000/', // این URI باید با تنظیمات Keycloak مطابقت داشته باشد
                checkLoginIframe: false,
            })
            .then(authenticated => {
                if (authenticated) {
                    console.log('User is authenticated');
                } else {
                    console.warn('User is not authenticated');
                }
                return authenticated;
            })
            .catch(err => {
                isInitialized = false;
                console.error('Failed to initialize Keycloak', err);
                throw err;
            });
    }
    return Promise.resolve(keycloak?.authenticated ?? false);
};

export const logout = () => {
    if (keycloak) {
        keycloak.logout();
    }
};

export const getToken = async () => {
    if (keycloak) {
        // بررسی انقضای توکن
        if (keycloak.isTokenExpired()) {
            try {
                await keycloak.updateToken(30);
            } catch (error) {
                console.error('Failed to refresh the token', error);
                keycloak.logout();
                return null;
            }
        }
        return keycloak.token ?? null;
    }
    return null;
};

export { keycloak };
