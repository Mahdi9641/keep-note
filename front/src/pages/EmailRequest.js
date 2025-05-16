import { useState, useEffect } from 'react';
import {
    Container,
    Button,
    Typography,
    Box,
    Paper
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { getToken } from "../auth/config/keycloak";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';

export default function EmailRequest() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const getAuthToken = () => localStorage.getItem('token');

    const fetchRequests = async () => {
        try {
            const token = await getToken();
            const response = await fetch('http://localhost:5000/api/notes/getRequestsByUserId', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Failed to fetch requests');
        }
    };

    const handleSubmit = async () => {
        try {
            const amount = 1;
            const paymentStatus = true;
            const token = await getToken();
            await fetch(`http://localhost:5000/api/notes/addRequest?amount=${amount}&paymentStatus=${paymentStatus}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });
            toast.success('Request Submitted Successfully', {
                position: "top-right",
                theme: "colored"
            });
            fetchRequests();
        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Failed to submit request');
        }
    };

    const columns = [
        {
            accessorKey: 'id',
            header: 'ID',
            size: 100
        },
        {
            accessorKey: 'username',
            header: 'Username',
            Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {cell.getValue()}
                </Typography>
            )
        },
        {
            accessorKey: 'userEmail',
            header: 'User Email',
            Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ color: '#1976d2' }}>
                    {cell.getValue()}
                </Typography>
            )
        },
        {
            accessorKey: 'amount',
            header: 'Amount',
            Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ${cell.getValue()}
                </Typography>
            )
        },
        {
            accessorKey: 'paymentStatus',
            header: 'Payment Status',
            Cell: ({ cell }) => (
                <Box sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: '16px',
                    backgroundColor: cell.getValue() ? '#e8f5e9' : '#ffebee',
                    color: cell.getValue() ? '#2e7d32' : '#d32f2f',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                }}>
                    {cell.getValue() ? 'Paid' : 'Unpaid'}
                </Box>
            )
        },
        {
            accessorKey: 'proUser',
            header: 'Pro User',
            Cell: ({ cell }) => (
                <Box sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: '16px',
                    backgroundColor: cell.getValue() ? '#e3f2fd' : '#f5f5f5',
                    color: cell.getValue() ? '#1976d2' : '#757575',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                }}>
                    {cell.getValue() ? 'Pro' : 'Basic'}
                </Box>
            )
        },
        {
            accessorKey: 'createdDate',
            header: 'Created Date',
            Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ color: '#666' }}>
                    {new Date(cell.getValue()).toLocaleString()}
                </Typography>
            )
        },
    ];

    return (
        <Container maxWidth="xl" sx={{
            minHeight: 'calc(100vh - 64px)',
            py: 4,
            mt: 8
        }}>
            <Paper elevation={0} sx={{
                p: 4,
                borderRadius: 2,
                background: 'linear-gradient(145deg, #f6f7f9, #ffffff)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <Typography
                    variant="h4"
                    sx={{
                        mb: 4,
                        color: '#2c3e50',
                        fontWeight: 700,
                        textAlign: 'center'
                    }}
                >
                    Email Request Management
                </Typography>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 6
                }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={requests.length > 0}
                        startIcon={<SendIcon />}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            backgroundColor: '#4CAF50',
                            '&:hover': {
                                backgroundColor: '#43A047'
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#f5f5f5',
                                color: '#bdbdbd'
                            }
                        }}
                    >
                        Submit New Request
                    </Button>
                </Box>

                <Typography
                    variant="h5"
                    sx={{
                        mb: 3,
                        color: '#2c3e50',
                        fontWeight: 600
                    }}
                >
                    Request History
                </Typography>

                <MaterialReactTable
                    columns={columns}
                    data={requests}
                    enableTopToolbar={true}
                    enableBottomToolbar={true}
                    enableColumnFilters={true}
                    enablePagination={true}
                    enableSorting={true}
                    muiTableProps={{
                        sx: {
                            tableLayout: 'fixed',
                            '& .MuiTableCell-root': {
                                py: 2
                            }
                        }
                    }}
                    renderTopToolbarCustomActions={() => (
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={fetchRequests}
                            startIcon={<RefreshIcon />}
                            sx={{
                                ml: 2,
                                borderRadius: 2,
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                            }}
                        >
                            Refresh
                        </Button>
                    )}
                />
            </Paper>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </Container>
    );
}
