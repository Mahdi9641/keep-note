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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function AdminApproval() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = await getToken();
            const response = await fetch('http://localhost:5000/api/notes/proUser/false', {
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

    const handleVerify = async (id) => {
        try {
            const token = await getToken();
            await fetch(`http://localhost:5000/api/notes/updateUserToPro/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });
            toast.success('User verified successfully', {
                position: "top-right",
                theme: "colored"
            });
            fetchRequests();
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to verify user');
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
            accessorKey: 'userId',
            header: 'User ID',
            Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ color: '#666' }}>
                    {cell.getValue()}
                </Typography>
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
        {
            header: 'Actions',
            Cell: ({ row }) => (
                <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleVerify(row.original.id)}
                    startIcon={<VerifiedUserIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 2,
                        '&:hover': {
                            backgroundColor: '#2e7d32'
                        }
                    }}
                >
                    Verify
                </Button>
            )
        }
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
                    Admin Approval
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
                            Refresh Table
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
