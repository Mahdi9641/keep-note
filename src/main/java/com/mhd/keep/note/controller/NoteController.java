package com.mhd.keep.note.controller;

import com.mhd.keep.note.domain.Note;
import com.mhd.keep.note.model.NoteModel;
import com.mhd.keep.note.repo.NoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/notes")
@CrossOrigin
public class NoteController {

    private static final Logger logger = LoggerFactory.getLogger(NoteController.class);

    @Autowired
    private NoteRepository noteRepository;

    @GetMapping
    public List<NoteModel> getNotes() {
        Authentication authentication = getUserId();
        logger.info("User {} requested all notes", authentication.getName());
        List<Note> notes = noteRepository.findByUserId(authentication.getName());
        return mapToModel(notes);
    }

    @GetMapping("/archived")
    public List<Note> getArchivedNotes() {
        Authentication authentication = getUserId();
        logger.info("User {} requested archived notes", authentication.getName());
        return noteRepository.findByArchivedTrueAndUserId(authentication.getName());
    }

    @GetMapping("/pinned")
    public List<Note> getPinnedNotes() {
        Authentication authentication = getUserId();
        logger.info("User {} requested pinned notes", authentication.getName());
        return noteRepository.findByPinnedTrueAndUserId(authentication.getName());
    }

    @PostMapping
    public Note addNote(@RequestBody Note note) {
        Authentication authentication = getUserId();
        logger.info("User {} is adding a new note", authentication.getName());
        note.setId(null);
        note.setUserId(authentication.getName());
        note.setEmail(((JwtAuthenticationToken) authentication).getTokenAttributes().get("email").toString());
        return noteRepository.save(note);
    }

    @PutMapping("/{id}")
    public Note updateNote(@PathVariable Long id, @RequestBody Note note) {
        Authentication authentication = getUserId();
        logger.info("User {} is updating note with id {}", authentication.getName(), id);

        Note existingNote = noteRepository.findById(id).orElseThrow(() -> new RuntimeException("Note not found"));

        if (note.getReminder() != null && existingNote.getReminder() != null
                && note.getReminder().after(existingNote.getReminder())) {
            existingNote.setEmailSend(false);
        }

        existingNote.setTitle(note.getTitle());
        existingNote.setContent(note.getContent());
        existingNote.setColor(note.getColor());
        existingNote.setPinned(note.isPinned());
        existingNote.setArchived(note.isArchived());
        existingNote.setReminder(note.getReminder());
        existingNote.setUserId(authentication.getName());
        existingNote.setEmail(((JwtAuthenticationToken) authentication).getTokenAttributes().get("email").toString());

        return noteRepository.save(existingNote);
    }


    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        Authentication authentication = getUserId();
        logger.info("User {} is deleting note with id {}", authentication.getName(), id);
        noteRepository.deleteById(id);
    }

    private List<NoteModel> mapToModel(List<Note> notes) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        return notes.stream().map(note -> {
            String reminderString = null;
            if (note.getReminder() != null) {
                reminderString = formatter.format(note.getReminder());
            }

            return new NoteModel(
                    note.getId(),
                    note.getTitle(),
                    note.getContent(),
                    note.getColor(),
                    note.isPinned(),
                    note.isArchived(),
                    reminderString,
                    note.getUserId(),
                    note.getEmail(),
                    note.isEmailSend()
            );
        }).collect(Collectors.toList());
    }


    private Authentication getUserId() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}
