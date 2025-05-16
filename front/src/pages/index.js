import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, useTheme } from '@mui/material';
import {Note, Archive, Email, Approval, LooksRounded, AbcTwoTone} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {getCurrentUser} from "../auth/provider/KeycloakProvider";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

const Dashboard = () => {
    const [time, setTime] = useState(new Date());
    const router = useRouter();
    const theme = useTheme();
    const [userRoles, setUserRoles] = useState([]);
    const user = getCurrentUser();

    useEffect(() => {
        if (user) {
            setUserRoles(user.role || []);
        }
    }, [user]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const isAdmin = userRoles.includes('admin');

    const getClockHands = () => {
        const hours = time.getHours() % 12;
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const hourDeg = (hours + minutes / 60) * 30;
        const minuteDeg = (minutes + seconds / 60) * 6;
        const secondDeg = seconds * 6;

        return {
            hour: hourDeg,
            minute: minuteDeg,
            second: secondDeg,
        };
    };

    const { hour, minute, second } = getClockHands();

    // Card variants for animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const cardVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    // Create hour markers for clock
    const hourMarkers = Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30) * (Math.PI / 180);
        const x = 60 * Math.sin(angle);
        const y = -60 * Math.cos(angle);
        return (
            <Box
                key={i}
                sx={{
                    position: 'absolute',
                    width: i % 3 === 0 ? '4px' : '2px',
                    height: i % 3 === 0 ? '12px' : '8px',
                    backgroundColor: i % 3 === 0 ? theme.palette.primary.main : '#555',
                    borderRadius: '4px',
                    transform: `translate(${x + 75}px, ${y + 75}px) rotate(${i * 30}deg)`,
                    transformOrigin: 'center',
                }}
            />
        );
    });

    return (
        <Box sx={{
            padding: 3,
            background: 'linear-gradient(145deg, #f0f0f0, #dfe0e1)',
            minHeight: 'calc(100vh - 64px)'
        }}>
            <Container maxWidth="lg" sx={{ textAlign: 'center', paddingTop: 3 }}>
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <Typography
                        sx={{
                            color: theme.palette.primary.main,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                            marginBottom: 4
                        }}
                        variant="h3"
                        fontWeight="bold"
                    >
                        Keep Notes Application
                    </Typography>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}
                >
                    <Paper
                        elevation={6}
                        sx={{
                            width: 180,
                            height: 180,
                            borderRadius: '50%',
                            position: 'relative',
                            backgroundColor: '#ffffff',
                            border: '8px solid #f5f5f5',
                            boxShadow: '0 14px 28px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.12), inset 0 0 20px rgba(0,0,0,0.05)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {/*{hourMarkers}*/}

                        {/* Fixed clock hands alignment */}
                        <Box
                            sx={{
                                position: 'absolute',
                                width: '5px',
                                height: '45px',
                                backgroundColor: '#333',
                                borderRadius: '6px',
                                top: 'calc(50% - 45px)',
                                left: 'calc(50% - 2.5px)',
                                transformOrigin: 'bottom center',
                                transform: `rotate(${hour}deg)`,
                                transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
                                zIndex: 6,
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                width: '4px',
                                height: '65px',
                                backgroundColor: '#666',
                                borderRadius: '6px',
                                top: 'calc(50% - 65px)',
                                left: 'calc(50% - 2px)',
                                transformOrigin: 'bottom center',
                                transform: `rotate(${minute}deg)`,
                                transition: 'transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
                                zIndex: 7
                            }}
                        />
                        <motion.div
                            animate={{ rotate: second }}
                            transition={{
                                type: "tween",
                                ease: "linear",
                                duration: 0
                            }}
                            style={{
                                position: 'absolute',
                                width: '2px',
                                height: '75px',
                                backgroundColor: '#d32f2f',
                                borderRadius: '6px',
                                top: 'calc(50% - 75px)',
                                left: 'calc(50% - 1px)',
                                transformOrigin: 'bottom center',
                                zIndex: 8
                            }}
                        />

                        {/* Center dot */}
                        <Box
                            sx={{
                                position: 'absolute',
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#d32f2f',
                                borderRadius: '50%',
                                zIndex: 10
                            }}
                        />
                    </Paper>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Grid container spacing={4} sx={{ marginTop: 1 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            {!isAdmin && (
                            <motion.div variants={cardVariants}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        borderRadius: '16px',
                                        height: '100%',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px) scale(1.02)',
                                            boxShadow: '0 12px 20px rgba(0,0,0,0.2)',
                                            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
                                            '& .MuiSvgIcon-root': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                                color: theme.palette.primary.dark
                                            }
                                        }
                                    }}
                                    onClick={() => router.push('/Notes')}
                                >
                                    <Note sx={{
                                        fontSize: 60,
                                        color: theme.palette.primary.main,
                                        marginBottom: 2,
                                        transition: 'all 0.3s ease',
                                        filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))'
                                    }} />
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>Notes</Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Write and save notes quickly for future reference.
                                    </Typography>
                                </Paper>
                            </motion.div>
                            )}
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            {!isAdmin && (
                            <motion.div variants={cardVariants}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        borderRadius: '16px',
                                        height: '100%',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px) scale(1.02)',
                                            boxShadow: '0 12px 20px rgba(0,0,0,0.2)',
                                            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
                                            '& .MuiSvgIcon-root': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                                color: theme.palette.secondary.dark
                                            }
                                        }
                                    }}
                                    onClick={() => router.push('/ArchivedNotes')}
                                >
                                    <Archive sx={{
                                        fontSize: 60,
                                        color: theme.palette.secondary.main,
                                        marginBottom: 2,
                                        transition: 'all 0.3s ease',
                                        filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))'
                                    }} />
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>Archive</Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Store important notes in the archive for later access.
                                    </Typography>
                                </Paper>
                            </motion.div>
                            )}
                            {isAdmin && (
                                <motion.div variants={cardVariants}>
                                    <Paper
                                        elevation={3}
                                        sx={{
                                            padding: 4,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            borderRadius: '16px',
                                            height: '100%',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-8px) scale(1.02)',
                                                boxShadow: '0 12px 20px rgba(0,0,0,0.2)',
                                                background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
                                                '& .MuiSvgIcon-root': {
                                                    transform: 'scale(1.1) rotate(5deg)',
                                                    color: theme.palette.success.light
                                                }
                                            }
                                        }}
                                        onClick={() => router.push('/AdminApproval')}
                                    >
                                        <VerifiedUserIcon sx={{
                                            fontSize: 60,
                                            color: theme.palette.success.light,
                                            marginBottom: 2,
                                            transition: 'all 0.3s ease',
                                            filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))'
                                        }} />
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>admin Approval</Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Approve page
                                        </Typography>
                                    </Paper>
                                </motion.div>
                            )}
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            {!isAdmin && (
                            <motion.div variants={cardVariants}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        borderRadius: '16px',
                                        height: '100%',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px) scale(1.02)',
                                            boxShadow: '0 12px 20px rgba(0,0,0,0.2)',
                                            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
                                            '& .MuiSvgIcon-root': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                                color: theme.palette.error.dark
                                            }
                                        }
                                    }}
                                    onClick={() => router.push('/EmailRequest')}
                                >
                                    <Email sx={{
                                        fontSize: 60,
                                        color: theme.palette.error.main,
                                        marginBottom: 2,
                                        transition: 'all 0.3s ease',
                                        filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))'
                                    }} />
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>Gmail Reminders</Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Receive reminders via Gmail to stay organized.
                                    </Typography>
                                </Paper>
                            </motion.div>
                            )}
                        </Grid>
                    </Grid>
                </motion.div>
            </Container>
        </Box>
    );
};

export default Dashboard;
