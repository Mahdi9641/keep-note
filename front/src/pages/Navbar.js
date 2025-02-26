import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Box,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DescriptionIcon from '@mui/icons-material/Description';
import ArchiveIcon from '@mui/icons-material/Archive';
import Link from 'next/link';
import { Home, Logout } from '@mui/icons-material';
import { getCurrentUser, getLogoutFunction } from "../auth/provider/KeycloakProvider";
import NotificationBell from "./NotificationBell";

const menuItems = [
    { text: 'Home', href: '/', icon: <Home /> },
    { text: 'Notes', href: '/Notes', icon: <DescriptionIcon /> },
    { text: 'ArchivedNotes', href: '/ArchivedNotes', icon: <ArchiveIcon /> },
    { text: 'EmailRequest', href: '/EmailRequest', icon: <ArchiveIcon /> },
    { text: 'AdminApproval', href: '/AdminApproval', icon: <ArchiveIcon /> },
];

const Layout = ({ children }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [pageName, setPageName] = useState('');
    const [userRoles, setUserRoles] = useState([]);
    const logout = getLogoutFunction();
    const user = getCurrentUser();

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    useEffect(() => {
        if (user) {
            console.log({user})
            // Assuming user.roles is an array containing the user's roles
            setUserRoles(user.role || []);
        }
    }, [user]);

    const isAdmin = userRoles.includes('admin');

    const filteredMenuItems = isAdmin
        ? menuItems
        : menuItems.filter(item => item.text !== 'AdminApproval');

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: '#8b8a80',
                    boxShadow: 3,
                    width: '100%',
                    top: 0,
                    left: 0,
                    zIndex: 1300,
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer(true)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon fontSize="large" />
                    </IconButton>
                    <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                        <img src="/keep_2020q4_48dp.png" alt="logo" style={{ width: 32, height: 32 }} />
                        Keep Note / {pageName}
                    </Typography>

                    <NotificationBell />

                    <Logout onClick={async () => await logout()} />
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                PaperProps={{
                    sx: { mt: '64px', backgroundColor: '#f5f5f5' },
                }}
            >
                <Box
                    sx={{
                        width: 250,
                        transition: 'all 0.3s ease-in-out',
                    }}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    <List>
                        {filteredMenuItems.map((item, index) => (
                            <React.Fragment key={item.text}>
                                <Link
                                    onClick={() => setPageName(item?.text)}
                                    href={item.href}
                                    passHref
                                >
                                    <ListItem>
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} />
                                    </ListItem>
                                </Link>

                                {index < filteredMenuItems.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Container sx={{ mt: 8, textAlign: 'right' }}>
                <Box>{children}</Box>
            </Container>
        </>
    );
};

export default Layout;
