import { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    FormControlLabel,
    Checkbox,
    IconButton,
    Fade
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "../auth/config/keycloak";
import { motion, AnimatePresence } from 'framer-motion';

export default function ArchivedNotes() {
    const [notes, setNotes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const colorOptions = ['#fff9c4', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb'];

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const token = await getToken();
            const res = await fetch('http://172.31.13.30:5000/api/notes/archived', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setNotes(data);
        } catch (error) {
            toast.error('Failed to fetch archived notes');
        }
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
        try {
            const token = await getToken();
            const updatedNote = { ...selectedNote, archived: false };
            await fetch(`http://172.31.13.30:5000/api/notes/${selectedNote.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedNote),
            });
            toast.success('Note unarchived successfully', {
                position: "top-right",
                theme: "colored"
            });
            setNotes(notes.filter(note => note.id !== selectedNote.id));
            handleCloseDialog();
        } catch (error) {
            toast.error('Failed to unarchive note');
        }
    };

    const deleteNote = async () => {
        try {
            const token = await getToken();
            await fetch(`http://172.31.13.30:5000/api/notes/${selectedNote.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setNotes(notes.filter((note) => note.id !== selectedNote.id));
            toast.success('Note deleted successfully', {
                position: "top-right",
                theme: "colored"
            });
            handleCloseDialog();
        } catch (error) {
            toast.error('Failed to delete note');
        }
    };

    const updateNote = async () => {
        try {
            const token = await getToken();
            const updatedNote = {
                ...selectedNote,
                reminder: selectedNote.reminder ? new Date(selectedNote.reminder).toISOString() : ''
            };
            await fetch(`http://172.31.13.30:5000/api/notes/${selectedNote.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedNote),
            });
            toast.success('Note updated successfully', {
                position: "top-right",
                theme: "colored"
            });
            fetchNotes();
            handleCloseDialog();
        } catch (error) {
            toast.error('Failed to update note');
        }
    };

    const NoteBox = ({ note, onClick }) => (
        <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Paper
                onClick={onClick}
                sx={{
                    backgroundColor: note.color || '#fff9c4',
                    p: 2,
                    borderRadius: 2,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    minWidth: 250,
                    minHeight: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    }
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {note.title}
                </Typography>
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
                    {note.reminder ? (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                        }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            {new Date(note.reminder).toLocaleString()}
                        </Box>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                        }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            No reminder
                        </Box>
                    )}
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
                    Archived Notes
                </Typography>
            </motion.div>

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
                                No archived notes found.
                            </Typography>
                        </Paper>
                    </motion.div>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: 3,
                            position: 'relative'
                        }}
                    >
                        <AnimatePresence>
                            {notes.map((note) => (
                                <NoteBox
                                    key={note.id}
                                    note={note}
                                    onClick={() => handleOpenDialog(note)}
                                />
                            ))}
                        </AnimatePresence>
                    </Box>
                )}
            </Box>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
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
                            Edit Archived Note
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
                            <TextField
                                label="Reminder"
                                type="datetime-local"
                                fullWidth
                                value={selectedNote.reminder ? selectedNote.reminder.substring(0, 16) : ''}
                                onChange={(e) => setSelectedNote({...selectedNote, reminder: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                                sx={{ mb: 2 }}
                            />
                        </DialogContent>
                        <DialogActions sx={{ p: 2, gap: 1 }}>
                            <Button
                                onClick={unarchiveNote}
                                variant="contained"
                                color="primary"
                                startIcon={<UnarchiveIcon />}
                            >
                                Unarchive
                            </Button>
                            <Button
                                onClick={deleteNote}
                                variant="contained"
                                color="error"
                                startIcon={<DeleteIcon />}
                            >
                                Delete
                            </Button>
                            <Button
                                onClick={updateNote}
                                variant="contained"
                                color="success"
                            >
                                Save Changes
                            </Button>
                            <Button
                                onClick={handleCloseDialog}
                                variant="outlined"
                            >
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
