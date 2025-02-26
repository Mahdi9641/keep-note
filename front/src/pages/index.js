import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { Note, Archive, Email } from '@mui/icons-material';
import { useRouter } from 'next/router';

const Dashboard = () => {
    const [time, setTime] = useState(new Date());
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    return (
        <Box sx={{ padding: 3, backgroundColor: '#dfe0e1', minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="lg" sx={{ textAlign: 'center', paddingTop: 3 }}>
                <Typography sx={{ color: '#4b73cc' }} variant="h4" gutterBottom fontWeight="bold">
                    Keep Notes Application
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                    <Paper elevation={4} sx={{ width: 150, height: 150, borderRadius: '50%', position: 'relative', backgroundColor: '#ffffff' }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                width: '4px',
                                height: '40px',
                                backgroundColor: 'black',
                                top: '35px',
                                left: '50%',
                                transformOrigin: 'bottom',
                                transform: `rotate(${hour}deg)`,
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                width: '3px',
                                height: '50px',
                                backgroundColor: 'gray',
                                top: '25px',
                                left: '50%',
                                transformOrigin: 'bottom',
                                transform: `rotate(${minute}deg)`,
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                width: '2px',
                                height: '60px',
                                backgroundColor: 'red',
                                top: '15px',
                                left: '50%',
                                transformOrigin: 'bottom',
                                transform: `rotate(${second}deg)`,
                            }}
                        />
                    </Paper>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            elevation={3}
                            sx={{ padding: 3, textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => router.push('/Notes')}
                        >
                            <Note sx={{ fontSize: 50, color: 'primary.main', marginBottom: 1 }} />
                            <Typography variant="h6" fontWeight="bold">Notes</Typography>
                            <Typography variant="body1">
                                Write and save notes quickly for future reference.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            elevation={3}
                            sx={{ padding: 3, textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => router.push('/ArchivedNotes')}
                        >
                            <Archive sx={{ fontSize: 50, color: 'secondary.main', marginBottom: 1 }} />
                            <Typography variant="h6" fontWeight="bold">Archive</Typography>
                            <Typography variant="body1">
                                Store important notes in the archive for later access.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper
                            elevation={3}
                            sx={{ padding: 3, textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => router.push('/')}
                        >
                            <Email sx={{ fontSize: 50, color: 'error.main', marginBottom: 1 }} />
                            <Typography variant="h6" fontWeight="bold">Gmail Reminders</Typography>
                            <Typography variant="body1">
                                Receive reminders via Gmail to stay organized.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Dashboard;
