"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initKeycloak, keycloak } from '../config/keycloak';
import {Box, CircularProgress, Typography} from "@mui/material";

let logoutFunction = () => {};
let currentUser = null;

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
                        console.log({tokenParsed})
                        const subPart = tokenParsed.sub.includes(':') ? tokenParsed.sub.split(':').pop() : tokenParsed.sub;
                        const roles = tokenParsed?.resource_access?.['dashboard']?.roles?.includes('admin') ? 'admin' : null;
                        const userData = {
                            name: tokenParsed.preferred_username || 'Unknown User',
                            email: tokenParsed.email || 'No Email',
                            sub: subPart || 'No Sub',
                            role:roles || 'No Role'
                        };

                        setUser(userData);
                        currentUser = userData;
                        const firstLogin = sessionStorage.getItem('firstLogin');
                        if (!firstLogin) {
                            sessionStorage.setItem('firstLogin', 'true');
                            window.location.href = "/";
                        }
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
        sessionStorage.removeItem('firstLogin');
        await keycloak.logout();
        // window.location.href = "/login";
    };

    if (!initialized) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh"
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    loading...
                </Typography>
            </Box>
        );
    }

    return (
        <KeycloakContext.Provider value={{ initialized, authenticated, user, logout: logoutFunction }}>
            {children}
        </KeycloakContext.Provider>
    );
};

export const useKeycloak = () => useContext(KeycloakContext);

// گرفتن تابع logout و اطلاعات کاربر به‌صورت مستقل
export const getLogoutFunction = () => logoutFunction;
export const  getCurrentUser = () => currentUser;
