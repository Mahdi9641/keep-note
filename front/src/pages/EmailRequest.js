import { useState, useEffect } from 'react';
import { Container, TextField, Button, Switch, FormControlLabel } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { getToken } from "../auth/config/keycloak";

export default function EmailRequest() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const getAuthToken = () => localStorage.getItem('token');

    const fetchRequests = async () => {
        try {
            const token = await getToken();
            const response = await fetch('http://172.31.13.30:5000/api/notes/getRequestsByUserId', {
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
        }
    };

    const handleSubmit = async () => {
        try {
            const amount = 1;
            const paymentStatus = true;
            const token = await getToken();
            await fetch(`http://172.31.13.30:5000/api/notes/addRequest?amount=${amount}&paymentStatus=${paymentStatus}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });
            fetchRequests();
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    const columns = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'username', header: 'Username' },
        { accessorKey: 'userEmail', header: 'UserEmail' },
        { accessorKey: 'amount', header: 'Amount' },
        {
            accessorKey: 'paymentStatus',
            header: 'Payment Status',
            Cell: ({ cell }) => cell.getValue() ?
                <span style={{ color: 'green' }}>✔️</span> :
                <span style={{ color: 'red' }}>❌</span>
        },
        {
            accessorKey: 'proUser',
            header: 'Pro User',
            Cell: ({ cell }) => cell.getValue() ?
                <span style={{ color: 'green' }}>✔️</span> :
                <span style={{ color: 'red' }}>❌</span>
        },
        { accessorKey: 'createdDate', header: 'Created Date' },
    ];

    return (
        <Container maxWidth="xl" style={{minHeight: 'calc(100vh - 64px)'}}>
            <h2 style={{ marginTop: '100px' }}>Request Submission</h2>

            <Button
                sx={{ marginTop: '20px' }}
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={requests.length > 0} // Disable button if requests are not empty
            >
                Submit Request
            </Button>

            <h2 style={{ marginTop: '20px' , marginBottom:'30px'}}>Requests List</h2>
            <MaterialReactTable
                columns={columns}
                data={requests}
                renderTopToolbarCustom={() => (
                    <div>
                        <Button
                            sx={{ marginTop: '50px', marginLeft: '10px' }}
                            variant="outlined"
                            color="secondary"
                            onClick={fetchRequests} // Refresh table data
                        >
                            Refresh Table
                        </Button>
                    </div>
                )}
            />
        </Container>
    );
}
