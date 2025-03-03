import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    IconButton,
    Fade,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "../auth/config/keycloak";
import PushPinIcon from '@mui/icons-material/PushPin';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [form, setForm] = useState({
        title: '',
        content: '',
        color: '#fff9c4',
        pinned: false,
        archived: false,
        reminder: ''
    });
    const colorOptions = ['#fff9c4', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb'];
    const [selectedNote, setSelectedNote] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        const token = await getToken();
        const res = await fetch('http://172.31.13.30:5000/api/notes', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
        const data = await res.json();
        setNotes(data);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const addNote = async () => {
        if (!form.title.trim() && !form.content.trim()) return;
        try {
            const token = await getToken();
            const noteToSend = {
                ...form,
                reminder: form.reminder ? new Date(form.reminder).toISOString() : ''
            };
            const res = await fetch('http://172.31.13.30:5000/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(noteToSend),
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const savedNote = await res.json();
            setNotes([...notes, savedNote]);
            setForm({
                title: '',
                content: '',
                color: '#fff9c4',
                pinned: false,
                archived: false,
                reminder: '',
            });
            toast.success('Note created successfully', {
                position: "top-right",
                theme: "colored"
            });
            fetchNotes();
        } catch (error) {
            console.error('Error adding note:', error);
            toast.error('Failed to add note', {
                position: "top-right",
                theme: "colored"
            });
        }
    };

    const deleteNote = async (id) => {
        try {
            const token = await getToken();
            await fetch(`http://172.31.13.30:5000/api/notes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setNotes(notes.filter((note) => note.id !== id));
            toast.warning('Note deleted successfully', {
                position: "top-right",
                theme: "colored"
            });
            fetchNotes();
        } catch (error) {
            toast.error('Failed to delete note', {
                position: "top-right",
                theme: "colored"
            });
        }
    };

    const toggleStatus = async (note, field) => {
        const updatedNote = { ...note, [field]: !note[field] };
        updateNote(updatedNote);
    };

    const updateNote = async (updatedNote) => {
        try {
            updatedNote.reminder = updatedNote.reminder ? new Date(updatedNote.reminder).toISOString() : '';
            const token = await getToken();
            await fetch(`http://172.31.13.30:5000/api/notes/${updatedNote.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedNote),
            });
            setNotes(notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
            toast.success('Note updated successfully', {
                position: "top-right",
                theme: "colored"
            });
            fetchNotes();
        } catch (error) {
            toast.error('Failed to update note', {
                position: "top-right",
                theme: "colored"
            });
        }
    };

    const pinnedNotes = notes.filter(note => note.pinned && !note.archived);
    const otherNotes = notes.filter(note => !note.pinned && !note.archived);

    const handleOpenModal = (note) => {
        setSelectedNote(note);
    };

    const handleCloseModal = () => {
        setSelectedNote(null);
    };

    const NoteBox = ({ note }) => (
        <motion.div
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 20 }}
            transition={{ duration: 0.3 }}
        >
            <Paper
                elevation={3}
                sx={{
                    backgroundColor: note.color,
                    p: 2,
                    borderRadius: 2,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    minWidth: 200,
                    minHeight: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    }
                }}
                onClick={() => handleOpenModal(note)}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '80%'
                        }}
                    >
                        {note.title}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(note, 'pinned');
                        }}
                        sx={{
                            color: note.pinned ? 'primary.main' : 'text.secondary',
                            '&:hover': { color: 'primary.main' }
                        }}
                    >
                        <PushPinIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Typography
                    variant="body2"
                    sx={{
                        flexGrow: 1,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 2
                    }}
                >
                    {note.content}
                </Typography>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 'auto'
                }}>
                    {note.reminder && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                        }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            {new Date(note.reminder).toLocaleString()}
                        </Box>
                    )}
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                        }}
                        sx={{
                            color: 'error.main',
                            opacity: 0.7,
                            '&:hover': {
                                opacity: 1,
                                backgroundColor: 'error.light'
                            }
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Paper>
        </motion.div>
    );

    return (
        <Box sx={{
            padding: 3,
            backgroundColor: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
            background: 'linear-gradient(145deg, #f6f7f9, #ffffff)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        mb: 4,
                        color: '#2c3e50',
                        fontWeight: 700,
                        textAlign: 'center',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    My Notes
                </Typography>
            </motion.div>

            <Paper
                elevation={4}
                sx={{
                    p: 3,
                    mb: 4,
                    maxWidth: 600,
                    margin: '0 auto',
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
            >
                <TextField
                    label="Title"
                    name="title"
                    variant="outlined"
                    fullWidth
                    value={form.title}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Content"
                    name="content"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={form.content}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Color:
                    </Typography>
                    <ToggleButtonGroup
                        value={form.color}
                        exclusive
                        onChange={(event, newColor) => {
                            if (newColor !== null) {
                                setForm({ ...form, color: newColor });
                            }
                        }}
                        sx={{ flexWrap: 'wrap' }}
                    >
                        {colorOptions.map((color) => (
                            <ToggleButton
                                key={color}
                                value={color}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    m: 0.5,
                                    backgroundColor: color,
                                    border: form.color === color ? '2px solid #000' : '1px solid #ccc',
                                    '&.Mui-selected': {
                                        backgroundColor: color,
                                        transform: 'scale(1.1)',
                                    },
                                }}
                            />
                        ))}
                    </ToggleButtonGroup>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={form.pinned}
                                onChange={handleChange}
                                name="pinned"
                                color="primary"
                            />
                        }
                        label="Pin Note"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={form.archived}
                                onChange={handleChange}
                                name="archived"
                                color="secondary"
                            />
                        }
                        label="Archive"
                    />
                </Box>
                <TextField
                    label="Reminder"
                    name="reminder"
                    type="datetime-local"
                    variant="outlined"
                    fullWidth
                    value={form.reminder}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    onClick={addNote}
                    fullWidth
                    sx={{
                        backgroundColor: '#4CAF50',
                        '&:hover': {
                            backgroundColor: '#45a049'
                        }
                    }}
                >
                    Add Note
                </Button>
            </Paper>

            <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
                {notes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.9)',
                            }}
                        >
                            <Typography variant="h6" color="text.secondary">
                                No notes yet. Start by creating one!
                            </Typography>
                        </Paper>
                    </motion.div>
                ) : (
                    <>
                        {pinnedNotes.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'text.secondary',
                                        mb: 2,
                                        fontWeight: 600
                                    }}
                                >
                                    Pinned Notes
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                        gap: 3
                                    }}
                                >
                                    {pinnedNotes.map((note) => (
                                        <NoteBox key={note.id} note={note} />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {otherNotes.length > 0 && (
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'text.secondary',
                                        mb: 2,
                                        fontWeight: 600
                                    }}
                                >
                                    Other Notes
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                        gap: 3
                                    }}
                                >
                                    {otherNotes.map((note) => (
                                        <NoteBox key={note.id} note={note} />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </Box>

            <Dialog
                open={!!selectedNote}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="sm"
                TransitionComponent={Fade}
                transitionDuration={300}
            >
                {selectedNote && (
                    <Box sx={{ backgroundColor: selectedNote.color }}>
                        <DialogTitle sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            Edit Note
                            <IconButton
                                onClick={() => toggleStatus(selectedNote, 'pinned')}
                                color={selectedNote.pinned ? "primary" : "default"}
                            >
                                <PushPinIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            <TextField
                                label="Title"
                                fullWidth
                                value={selectedNote.title}
                                onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Content"
                                fullWidth
                                multiline
                                rows={4}
                                value={selectedNote.content}
                                onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="body2" sx={{ mr: 2 }}>
                                    Color:
                                </Typography>
                                <ToggleButtonGroup
                                    value={selectedNote.color}
                                    exclusive
                                    onChange={(event, newColor) => {
                                        if (newColor !== null) {
                                            setSelectedNote({...selectedNote, color: newColor});
                                        }
                                    }}
                                >
                                    {colorOptions.map((color) => (
                                        <ToggleButton
                                            key={color}
                                            value={color}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                m: 0.5,
                                                backgroundColor: color,
                                                border: selectedNote.color === color ? '2px solid #000' : '1px solid #ccc',
                                            }}
                                        />
                                    ))}
                                </ToggleButtonGroup>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedNote.archived}
                                            onChange={() => setSelectedNote({
                                                ...selectedNote,
                                                archived: !selectedNote.archived
                                            })}
                                        />
                                    }
                                    label="Archive"
                                />
                            </Box>
                            <TextField
                                label="Reminder"
                                type="datetime-local"
                                fullWidth
                                value={selectedNote.reminder ? selectedNote.reminder.substring(0, 16) : ''}
                                onChange={(e) => setSelectedNote({...selectedNote, reminder: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                            />
                        </DialogContent>
                        <DialogActions sx={{ p: 2, gap: 1 }}>
                            <Button
                                onClick={() => {
                                    deleteNote(selectedNote.id);
                                    handleCloseModal();
                                }}
                                color="error"
                                variant="contained"
                                startIcon={<DeleteIcon />}
                            >
                                Delete
                            </Button>
                            <Button
                                onClick={() => {
                                    updateNote(selectedNote);
                                    handleCloseModal();
                                }}
                                color="primary"
                                variant="contained"
                            >
                                Save Changes
                            </Button>
                            <Button onClick={handleCloseModal}>
                                Cancel
                            </Button>
                        </DialogActions>
                    </Box>
                )}
            </Dialog>
            <ToastContainer position="top-right" autoClose={3000} />
        </Box>
    );
}
