import { useState, useEffect } from 'react';
import { Typography, Paper, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, ToggleButtonGroup, ToggleButton, FormControlLabel, Checkbox } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {getToken} from "../auth/config/keycloak";

export default function ArchivedNotes() {
    const [notes, setNotes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const colorOptions = ['#fff9c4', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb'];

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        const token = await getToken();
        fetch('http://localhost:5000/api/notes/archived', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(data => setNotes(data));
    };

    const handleOpenDialog = (note) => {
        setSelectedNote(note);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedNote(null);
    };

    const unarchiveNote = async () => {
        const token = await getToken();
        const updatedNote = { ...selectedNote, archived: false };
        await fetch(`http://localhost:5000/api/notes/${selectedNote.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedNote),
        });
        toast.info('Note unarchived successfully');
        setNotes(notes.filter(note => note.id !== selectedNote.id));
        handleCloseDialog();
    };

    const deleteNote = async () => {
        const token = await getToken();
        await fetch(`http://localhost:5000/api/notes/${selectedNote.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        setNotes(notes.filter((note) => note.id !== selectedNote.id));
        toast.warning('Note deleted successfully');
        handleCloseDialog();
    };

    const updateNote = async () => {
        const token = await getToken();
        const updatedNote = {
            ...selectedNote,
            reminder: selectedNote.reminder ? new Date(selectedNote.reminder).toISOString() : ''
        };
        await fetch(`http://localhost:5000/api/notes/${selectedNote.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedNote),
        });
        toast.success('Note updated successfully');
        fetchNotes();
        handleCloseDialog();
    };

    return (
        <Box sx={{ padding: 2, backgroundColor: '#dfe0e1', minHeight: 'calc(100vh - 64px)' }}>
            <Typography variant="h6" sx={{ marginBottom: 3, color: '#000000' }}>
                Archived Notes
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <NoteBox key={note.id} note={note} onClick={() => handleOpenDialog(note)} />
                    ))
                ) : (
                    <Typography variant="body1" sx={{ color: '#000', textAlign: 'center' }}>
                        You don't have any archived notes.
                    </Typography>
                )}
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <div style={{backgroundColor:'#efeeed'}}>
                <DialogTitle>Edit Archived Note</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        label="Title"
                        name="title"
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={selectedNote?.title || ''}
                        onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        label="Content"
                        name="content"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={selectedNote?.content || ''}
                        onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                        sx={{ mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            Color:
                        </Typography>
                        <ToggleButtonGroup
                            value={selectedNote?.color || ''}
                            exclusive
                            onChange={(event, newColor) => {
                                if (newColor !== null) {
                                    setSelectedNote({ ...selectedNote, color: newColor });
                                }
                            }}
                            aria-label="choose note color"
                        >
                            {colorOptions.map((color) => (
                                <ToggleButton
                                    key={color}
                                    value={color}
                                    aria-label={color}
                                    sx={{
                                        backgroundColor: color,
                                        minWidth: '32px',
                                        minHeight: '32px',
                                        border: '1px solid #ccc',
                                        '&.Mui-selected': {
                                            border: '2px solid #000',
                                            backgroundColor: color,
                                        },
                                    }}
                                />
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedNote?.pinned || false}
                                    onChange={() => setSelectedNote({ ...selectedNote, pinned: !selectedNote.pinned })}
                                    name="pinned"
                                />
                            }
                            label="Pin"
                            sx={{ m: 0 }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedNote?.archived || false}
                                    onChange={() => setSelectedNote({ ...selectedNote, archived: !selectedNote.archived })}
                                    name="archived"
                                />
                            }
                            label="Archive"
                            sx={{ m: 0 }}
                        />
                    </Box>
                    <TextField
                        label="Reminder"
                        name="reminder"
                        type="datetime-local"
                        variant="outlined"
                        fullWidth
                        value={selectedNote?.reminder ? selectedNote.reminder.substring(0, 16) : ''}
                        onChange={(e) => setSelectedNote({ ...selectedNote, reminder: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            updateNote();
                        }}
                        size="small"
                        variant="contained"
                        sx={{ backgroundColor: 'gray' }}
                    >
                        Save Changes
                    </Button>
                    <Button
                        onClick={unarchiveNote}
                        size="small"
                        variant="contained"
                        sx={{ backgroundColor: 'gray' }}
                    >
                        Unarchive
                    </Button>
                    <Button
                        onClick={deleteNote}
                        size="small"
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={handleCloseDialog}
                        variant="contained"
                        size="small"
                        sx={{ backgroundColor: 'gray' }}
                    >
                        Close
                    </Button>
                </DialogActions>
                </div>
            </Dialog>
            <ToastContainer autoClose={2000} />
        </Box>
    );
}

const NoteBox = ({ note, onClick }) => (
    <Paper
        onClick={onClick}
        sx={{
            backgroundColor: note.color || '#fff9c4',
            p: 1,
            borderRadius: 4,
            boxShadow: '0px 1px 4px rgba(60,64,67,0.3)',
            cursor: 'pointer',
            width: 130,
            height: 100,
            minWidth: 100,
            minHeight: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center',
            overflow: 'hidden',
            flexShrink: 0
        }}
    >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, width: '100%' }} noWrap>
            {note.title}
        </Typography>
        <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '0.7rem', width: '100%' }} noWrap>
            {note.content}
        </Typography>
        {note.reminder ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, color: '#757575' }}>
                <AccessTimeIcon sx={{ fontSize: 12, mr: 0.3 }} />
                <Typography variant="caption">
                    {note.reminder.substring(0, 19)}
                </Typography>
            </Box>
        ) : (
            <Typography variant="caption" sx={{ mt: 0.3, color: '#757575' }}>
                <AccessTimeIcon sx={{ fontSize: 12, mr: 0.3 }} />
                <Typography variant="caption">
                    no reminder
                </Typography>
            </Typography>
        )}
    </Paper>
);
