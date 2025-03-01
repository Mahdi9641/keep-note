import { useState, useEffect } from 'react';
import { Container, Button } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import {getToken} from "../auth/config/keycloak";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminApproval() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = await getToken();
            const response = await fetch('http://172.31.13.30:5000/api/notes/proUser/false', {
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


    const handleVerify = async (id) => {
        try {
            const token = await getToken();
            await fetch(`http://172.31.13.30:5000/api/notes/updateUserToPro/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });
            toast.success('Verify user successfully');
            fetchRequests();
        } catch (error) {
            console.error('Error updating user:', error);
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
        { accessorKey: 'userId', header: 'User ID' },
        { accessorKey: 'createdDate', header: 'Created Date' },
        {
            header: 'Actions',
            Cell: ({ row }) => (
                <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleVerify(row.original.id)}
                >
                    Verify
                </Button>
            )
        }
    ];

    return (
        <Container maxWidth="xl" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <h2 style={{ marginTop: '60px' , marginBottom:'50px'}}>Admin Approval</h2>

            <MaterialReactTable columns={columns} data={requests} />
            <ToastContainer autoClose={2000}/>
        </Container>
    );
}
