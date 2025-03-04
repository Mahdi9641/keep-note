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
];

const adminMenu = [
    { text: 'AdminApproval', href: '/AdminApproval', icon: <ArchiveIcon /> },
];

const Layout = ({ children }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [pageName, setPageName] = useState('');
    const [userRoles, setUserRoles] = useState([]);
    const logout = getLogoutFunction();
    const user = getCurrentUser();

    const toggleDrawer = () => {
        setDrawerOpen((prevState) => !prevState);
    };

    useEffect(() => {
        if (user) {
            console.log({ user });
            setUserRoles(user.role || []);
        }
    }, [user]);

    const isAdmin = userRoles.includes('admin');

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    width: '100%',
                    top: 0,
                    left: 0,
                    zIndex: 1300,
                }}
            >
                <Toolbar sx={{
                    justifyContent: 'space-between',
                    height: '64px',
                    padding: '0 20px'
                }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{
                            mr: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                            }
                        }}
                    >
                        <MenuIcon fontSize="large" />
                    </IconButton>
                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            textAlign: 'left',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            color: '#ffffff',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                    >
                        <img
                            src="/keep_2020q4_48dp.png"
                            alt="logo"
                            style={{
                                width: 32,
                                height: 32,
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                            }}
                        />
                        Keep Note / {pageName}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <NotificationBell />
                        <IconButton
                            onClick={async () => await logout()}
                            sx={{
                                color: '#ffffff',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                }
                            }}
                        >
                            <Logout />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer}
                PaperProps={{
                    sx: {
                        mt: '64px',
                        backgroundColor: '#ffffff',
                        boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
                        width: 250,
                    },
                }}
            >
                <Box
                    sx={{
                        width: 250,
                        backgroundColor: '#ffffff',
                        height: '100%',
                    }}
                    role="presentation"
                    onClick={toggleDrawer}
                    onKeyDown={toggleDrawer}
                >
                    <List>
                        {isAdmin
                            ? adminMenu.map((item) => (
                                <React.Fragment key={item.text}>
                                    <Link onClick={() => setPageName(item?.text)} href={item.href} passHref>
                                        <ListItem sx={{
                                            padding: '12px 24px',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                                cursor: 'pointer',
                                                transform: 'translateX(5px)',
                                            },
                                        }}>
                                            <ListItemIcon sx={{
                                                color: '#2c3e50',
                                                minWidth: '40px'
                                            }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.text}
                                                sx={{
                                                    '& .MuiTypography-root': {
                                                        fontWeight: 500,
                                                        color: '#2c3e50'
                                                    }
                                                }}
                                            />
                                        </ListItem>
                                    </Link>
                                    <Divider sx={{ margin: '4px 0' }} />
                                </React.Fragment>
                            ))
                            : menuItems.map((item) => (
                                <React.Fragment key={item.text}>
                                    <Link href={item.href} passHref>
                                        <ListItem
                                            onClick={() => setPageName(item.text)}  // اینجا تغییر کرد
                                            sx={{
                                                padding: '12px 24px',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: '#d5cece',
                                                    cursor: 'pointer',
                                                    transform: 'translateX(5px)',
                                                },
                                            }}
                                        >
                                            <ListItemIcon sx={{ color: '#2c3e50', minWidth: '40px' }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.text} />
                                        </ListItem>
                                    </Link>
                                    <Divider sx={{ margin: '4px 0' }} />
                                </React.Fragment>
                            ))}
                    </List>
                </Box>
            </Drawer>

            <Container sx={{
                mt: 8,
                textAlign: 'right',
                // padding: '24px'
            }}>
                <Box>{children}</Box>
            </Container>
        </>
    );
};

export default Layout;
