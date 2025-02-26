import { useState, useEffect } from "react";
import {
    Badge, IconButton, Menu, MenuItem, Typography, ListItemText, ListItemIcon, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Box
} from "@mui/material";
import { Notifications, CheckCircle, MarkUnreadChatAlt, DoneAll } from "@mui/icons-material";
import { getToken } from "../auth/config/keycloak";

export default function NotificationBell() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notes, setNotes] = useState([]);
    const [readNotes, setReadNotes] = useState(new Set());
    const [openModal, setOpenModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        fetchNotes();
        const interval = setInterval(fetchNotes, 30 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        requestNotificationPermission(); // در اولین اجرا، درخواست مجوز می‌کند
        fetchNotes();
        const interval = setInterval(fetchNotes, 30 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotes = async () => {
        try {
            const token = await getToken();
            const response = await fetch("http://172.31.13.30:5000/api/notes/getNotesWithDueReminders", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch notes");
            }

            const data = await response.json();
            setNotes(data);
            if (Notification.permission === "denied") {
                await requestNotificationPermission();
            }

            // فقط اگر مجوز صادر شده بود، نوتیفیکیشن نمایش بده
            if (Notification.permission === "granted") {
                data.forEach((note) => {
                    if (!readNotes.has(note.id)) {
                        showNotification(note);
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        }
    };

    const requestNotificationPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                console.warn("User denied notification permission");
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
        }
    };

    const showNotification = (note) => {
        if (Notification.permission === "granted") {
            new Notification("Keep Note", {
                body: `${note.title}\n${note.content}`,
                icon: "/keep_2020q4_48dp.png",
                tag: note.id,
                silent: false,
            });
        }
    };



    const handleOpenModal = (note) => {
        setSelectedNote(note);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedNote(null);
    };

    const markAsRead = async () => {
        if (!selectedNote) return;
        try {
            const token = await getToken();
            const response = await fetch("http://172.31.13.30:5000/api/notes/updateReadNotification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ noteId: selectedNote.id, readNotification: true }),
            });

            if (!response.ok) {
                throw new Error("Failed to update note");
            }

            setReadNotes((prevReadNotes) => new Set(prevReadNotes).add(selectedNote.id));
            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== selectedNote.id));

        } catch (error) {
            console.error("Error updating note:", error);
        } finally {
            handleCloseModal();
        }
    };

    const getTimeDifference = (reminder) => {
        if (!reminder) return "";

        const reminderTime = new Date(reminder);
        const now = new Date();
        const diffMs = reminderTime - now;
        const diffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));

        if (diffMs > 0) {
            return `${diffMinutes} minutes remaining`;
        } else {
            return `${diffMinutes} minutes ago`;
        }

    };


    return (
        <>
            <IconButton
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ position: "relative" }}
            >
                <Badge badgeContent={notes.length} color="error">
                    <Notifications />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    sx: { width: 300, maxHeight: 400, overflowY: "auto" },
                }}
            >
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <MenuItem
                            key={note.id}
                            onClick={() => handleOpenModal(note)}
                            sx={{
                                backgroundColor: readNotes.has(note.id) ? "#e8f5e9" : "transparent",
                                "&:hover": { backgroundColor: "#c8e6c9" },
                            }}
                        >
                            <ListItemIcon>
                                {readNotes.has(note.id) ? (
                                    <CheckCircle fontSize="small" sx={{ color: "green" }} />
                                ) : (
                                    <MarkUnreadChatAlt fontSize="small" sx={{ color: "orange" }} />
                                )}
                            </ListItemIcon>
                            {/*<ListItemText primary={note.title} />*/}
                            <ListItemText
                                primary={note.title}
                                secondary={getTimeDifference(note.reminder)}
                            />
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>
                        <Typography variant="body2">No new notifications</Typography>
                    </MenuItem>
                )}
            </Menu>

            {/* --- Styled Modal --- */}
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: 4,
                        boxShadow: 10,
                        p: 2,
                        textAlign: "center",
                    },
                }}
            >
                <DialogTitle sx={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                    {selectedNote?.title}
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body1" sx={{ color: "#555", mb: 2 }}>
                        {selectedNote?.content}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "#888", fontStyle: "italic" }}>
                        {getTimeDifference(selectedNote?.reminder)}
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <CheckCircle sx={{ fontSize: 50, color: "#4caf50" }} />
                        <Typography variant="subtitle2" sx={{ color: "#666" }}>
                            Mark this notification as read?
                        </Typography>
                    </Box>
                </DialogContent>


                <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                    <Button onClick={handleCloseModal} color="secondary" sx={{ fontWeight: "bold" }}>
                        Close
                    </Button>
                    <Button
                        onClick={markAsRead}
                        variant="contained"
                        sx={{
                            backgroundColor: "#4caf50",
                            color: "white",
                            "&:hover": { backgroundColor: "#388e3c" },
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <DoneAll fontSize="small" />
                        Mark as Read
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
