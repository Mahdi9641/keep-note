import {useEffect, useState} from 'react';
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
    Typography
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {getToken} from "../auth/config/keycloak";
import PushPinIcon from '@mui/icons-material/PushPin';

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
        const {name, value, type, checked} = e.target;
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
            toast.success('note created successfully');
            fetchNotes();
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Failed to add note. Please try again.');
        }
    };

    const deleteNote = async (id) => {
        const token = await getToken();
        await fetch(`http://172.31.13.30:5000/api/notes/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        setNotes(notes.filter((note) => note.id !== id));
        toast.warning('note delete successfully');
        fetchNotes();
    };

    const toggleStatus = async (note, field) => {
        const updatedNote = {...note, [field]: !note[field]};
        updateNote(updatedNote);
    };

    const updateNote = async (updatedNote) => {
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
        toast.success('note update successfully');
        fetchNotes();
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
        <Paper
            sx={{
                backgroundColor: note.color,
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
            onClick={() => handleOpenModal(note)}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 'bold',
                        mb: 0.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '80%'
                    }}
                >
                    {note.title}
                </Typography>
                <PushPinIcon
                    sx={{ color: note.pinned ? '#000000' : '#757575', cursor: 'pointer' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(note, 'pinned');
                    }}
                />
            </Box>
            <Typography
                variant="body2"
                noWrap
                sx={{
                    flexGrow: 1,
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%'
                }}
            >
                {note.content}
            </Typography>
            {note.reminder ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.3, color: '#757575' }}>
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
    return (
        <Box sx={{padding: 2, backgroundColor: '#dfe0e1', minHeight: 'calc(100vh - 64px)'}}>
            <div>
                <Typography variant="h6" sx={{marginBottom: 3, color: '#000000'}}>My Notes</Typography>
            </div>
            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: '#ebe6e691',
                    borderRadius: 1,
                    boxShadow: '0px 1px 3px rgba(60,64,67,0.3)',
                    maxWidth: 400,
                    margin: '0 auto'
                }}
            >
                <Box sx={{textAlign: 'center', mb: 1}}>
                    <TextField
                        label="Title"
                        name="title"
                        variant="outlined"
                        size="small"
                        value={form.title}
                        onChange={handleChange}
                        sx={{width: '80%', mb: 1}}
                    />
                </Box>
                <TextField
                    label="Content"
                    name="content"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={2}
                    value={form.content}
                    onChange={handleChange}
                    sx={{mb: 1}}
                />
                <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                    <Typography variant="body2" sx={{mr: 1}}>
                        Color:
                    </Typography>
                    <ToggleButtonGroup
                        value={form.color}
                        exclusive
                        onChange={(event, newColor) => {
                            if (newColor !== null) {
                                setForm({...form, color: newColor});
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
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={form.pinned}
                                onChange={handleChange}
                                name="pinned"
                            />
                        }
                        label="Pin"
                        sx={{m: 0}}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={form.archived}
                                onChange={handleChange}
                                name="archived"
                            />
                        }
                        label="Archive"
                        sx={{m: 0}}
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
                    InputLabelProps={{shrink: true}}
                    sx={{mb: 1}}
                />
                <Box sx={{textAlign: 'center'}}>
                    <Button sx={{backgroundColor: "gray"}} variant="contained" onClick={addNote} size="small">
                        Add Note
                    </Button>
                </Box>
            </Paper>
            <Box>
                {notes.length === 0 ? (
                    <Box
                        sx={{
                            paddingTop: '20px',
                            color: '#000',
                            textAlign: 'center',
                            mt: 2,
                            borderRadius: '16px',
                            border: '1px solid #ccc',
                            p: 2,
                            maxWidth: '400px',
                            mx: 'auto'
                        }}
                    >
                        <Typography variant="body1">
                            You don't have any notes. Start by writing a note.
                        </Typography>
                    </Box>

                ) : (
                    <>
                        {pinnedNotes.length > 0 && (
                            <>
                                <Typography variant="h6" sx={{color: "#5f6368", mb: 1}}>
                                    Pinned Notes
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                    {pinnedNotes.map((note) => (
                                        <NoteBox key={note.id} note={note}/>
                                    ))}
                                </Box>
                            </>
                        )}
                        {otherNotes.length > 0 && (
                            <>
                                <Typography variant="h6" sx={{color: "#5f6368", mt: 2, mb: 1}}>
                                    Others
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                    {otherNotes.map((note) => (
                                        <NoteBox key={note.id} note={note}/>
                                    ))}
                                </Box>
                            </>
                        )}
                    </>
                )}
            </Box>
            {selectedNote && (
                <Dialog open={true} onClose={handleCloseModal} fullWidth maxWidth="sm">
                    <div style={{backgroundColor: '#efeeed'}}>
                        <DialogTitle>Edit Note</DialogTitle>
                        <DialogContent dividers>
                            <TextField
                                label="Title"
                                name="title"
                                variant="outlined"
                                fullWidth
                                size="small"
                                value={selectedNote.title}
                                onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
                                sx={{mb: 1}}
                            />
                            <TextField
                                label="Content"
                                name="content"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                value={selectedNote.content}
                                onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
                                sx={{mb: 1}}
                            />
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                <Typography variant="body2" sx={{mr: 1}}>
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
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedNote.pinned}
                                            onChange={() => setSelectedNote({
                                                ...selectedNote,
                                                pinned: !selectedNote.pinned
                                            })}
                                            name="pinned"
                                        />
                                    }
                                    label="Pin"
                                    sx={{m: 0}}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedNote.archived}
                                            onChange={() => setSelectedNote({
                                                ...selectedNote,
                                                archived: !selectedNote.archived
                                            })}
                                            name="archived"
                                        />
                                    }
                                    label="Archive"
                                    sx={{m: 0}}
                                />
                            </Box>
                            <TextField
                                label="Reminder"
                                name="reminder"
                                type="datetime-local"
                                variant="outlined"
                                fullWidth
                                value={selectedNote.reminder ? selectedNote.reminder.substring(0, 16) : ''}
                                onChange={(e) => setSelectedNote({...selectedNote, reminder: e.target.value})}
                                InputLabelProps={{shrink: true}}
                                sx={{mb: 1}}
                            />
                        </DialogContent>
                        <DialogActions>
                                {/*<Button*/}
                                {/*    onClick={() => {*/}
                                {/*        toggleStatus(selectedNote, 'pinned');*/}
                                {/*        handleCloseModal();*/}
                                {/*    }}*/}
                                {/*    size="small"*/}
                                {/*    variant="contained"*/}
                                {/*    sx={{backgroundColor: 'gray'}}*/}
                                {/*>*/}
                                {/*    {selectedNote.pinned ? 'Unpin' : 'Pin'}*/}
                                {/*</Button>*/}
                            <Button
                                onClick={() => {
                                    toggleStatus(selectedNote, 'archived');
                                    handleCloseModal();
                                }}
                                variant="contained"
                                sx={{backgroundColor: 'gray'}}
                                size="small"
                            >
                                {selectedNote.archived ? 'Unarchive' : 'Archive'}
                            </Button>
                            <Button
                                onClick={async () => {
                                    await updateNote(selectedNote);
                                    handleCloseModal();
                                }}
                                size="small"
                                variant="contained"
                                sx={{backgroundColor: 'gray'}}
                            >
                                Save Changes
                            </Button>
                            <Button
                                onClick={async () => {
                                    await deleteNote(selectedNote.id);
                                    handleCloseModal();
                                }}
                                size="small"
                                color="error"
                                variant="contained"
                            >
                                delete
                            </Button>
                            <Button onClick={handleCloseModal} variant="contained" size="small"
                                    sx={{backgroundColor: 'gray'}}>
                                Close
                            </Button>
                        </DialogActions>
                    </div>
                </Dialog>
                )}
            <ToastContainer autoClose={2000}/>
        </Box>
    );
}
