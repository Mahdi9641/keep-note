"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initKeycloak, keycloak } from '../config/keycloak';

let logoutFunction = () => {};
let currentUser = null; // متغیر خارجی برای ذخیره اطلاعات کاربر

const KeycloakContext = createContext({
    initialized: false,
    authenticated: false,
    user: null,
    logout: () => {},
});

export const KeycloakProvider = ({ children }) => {
    const [initialized, setInitialized] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            initKeycloak()
                .then(auth => {
                    setAuthenticated(auth);
                    if (keycloak && auth) {
                        const tokenParsed = keycloak.tokenParsed || {};
                        const subPart = tokenParsed.sub.includes(':') ? tokenParsed.sub.split(':').pop() : tokenParsed.sub;
                        const userData = {
                            name: tokenParsed.preferred_username || 'Unknown User',
                            email: tokenParsed.email || 'No Email',
                            sub: subPart || 'No Sub',
                        };

                        setUser(userData);
                        currentUser = userData; // مقداردهی متغیر خارجی
                    }
                    setInitialized(true);
                })
                .catch(err => {
                    console.error('Failed to initialize Keycloak', err);
                    setInitialized(false);
                });
        }
    }, []);

    logoutFunction = async () => {
        console.log("hhhhhmhmhmhmhm")
        await keycloak.logout();
        // window.location.href = "/login";
    };

    return (
        <KeycloakContext.Provider value={{ initialized, authenticated, user, logout: logoutFunction }}>
            {children}
        </KeycloakContext.Provider>
    );
};

export const useKeycloak = () => useContext(KeycloakContext);

// گرفتن تابع logout و اطلاعات کاربر به‌صورت مستقل
export const getLogoutFunction = () => logoutFunction;
export const getCurrentUser = () => currentUser;
