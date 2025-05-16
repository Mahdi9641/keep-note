package com.mhd.keep.note.controller;

import com.mhd.keep.note.domain.Note;
import com.mhd.keep.note.domain.Request;
import com.mhd.keep.note.model.NoteModel;
import com.mhd.keep.note.repo.NoteRepository;
import com.mhd.keep.note.repo.RequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/notes")
@CrossOrigin
public class NoteController {

    private static final Logger logger = LoggerFactory.getLogger(NoteController.class);

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private RequestRepository requestRepository;


    @PostMapping("/updateReadNotification")
    public ResponseEntity<?> updateReadNotification(@RequestBody Map<String, Object> payload) {
        Long noteId = ((Number) payload.get("noteId")).longValue();
        boolean readNotification = (Boolean) payload.get("readNotification");

        noteRepository.findById(noteId).ifPresent(note -> {
            note.setReadNotification(readNotification);
            noteRepository.save(note);
        });
        return ResponseEntity.ok("Note updated successfully");
    }

    @GetMapping("/getNotesWithDueReminders")
    public List<NoteModel> getNotesWithDueReminders(Authentication authentication) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date now = new Date();

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(now);
        calendar.add(Calendar.MINUTE, 5);
        Date fiveMinutesLater = calendar.getTime();

        String userId = authentication.getName();
        logger.info("User {} requested their notes", userId);

        List<Note> notes = noteRepository.findByReminderBetweenAndReadNotificationFalseAndUserId(now, fiveMinutesLater, userId);

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
                    note.isEmailSend(),
                    note.isReadNotification()
            );
        }).collect(Collectors.toList());
    }


    @GetMapping
    public List<NoteModel> getNotes() {
        Authentication authentication = getUserId();
        logger.info("User {} requested all notes", authentication.getName());
        List<Note> notes = noteRepository.findByUserId(authentication.getName());
        return mapToModel(notes);
    }

    @GetMapping("/archived")
    public List<NoteModel> getArchivedNotes() {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Authentication authentication = getUserId();
        logger.info("User {} requested archived notes", authentication.getName());
        List<Note> notes = noteRepository.findByArchivedTrueAndUserId(authentication.getName());

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
                    note.isEmailSend(),
                    note.isReadNotification()
            );
        }).collect(Collectors.toList());
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


    @PostMapping("/addRequest")
    public Request addRequest(@RequestParam BigDecimal amount,
                              @RequestParam boolean paymentStatus) {
        Request request = new Request();
        Authentication authentication = getUserId();
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String email =  (String) jwtAuth.getTokenAttributes().get("email");
            String username =  (String) jwtAuth.getTokenAttributes().get("preferred_username");
            request.setUserEmail(email);
            request.setUsername(username);
        }
        request.setAmount(amount);
        request.setPaymentStatus(paymentStatus);
        request.setUserId(authentication.getName());
        request.setProUser(false);
        request.setCreatedDate(new Date());
        return requestRepository.save(request);
    }

    @GetMapping("/getRequestsByUserId")
    public List<Request> getRequestsByUserId() {
        Authentication authentication = getUserId();
        return requestRepository.findByUserId(authentication.getName());
    }

    @GetMapping("/proUser/false")
    public List<Request> getRequestsWithProUserFalse() {
        return requestRepository.findByProUserFalse();
    }

    @PutMapping("/updateUserToPro/{id}")
    public Request updateUserToPro(@PathVariable Long id) {
        Request request = requestRepository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        request.setProUser(true);
        return requestRepository.save(request);
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
                    note.isEmailSend(),
                    note.isReadNotification()
            );
        }).collect(Collectors.toList());
    }


    private Authentication getUserId() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}
