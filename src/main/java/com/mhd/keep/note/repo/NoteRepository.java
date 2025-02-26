package com.mhd.keep.note.repo;

import com.mhd.keep.note.domain.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByArchivedTrueAndUserId(String userId);
    List<Note> findByPinnedTrueAndUserId(String userId);
    List<Note> findByUserId(String userId);
    List<Note> findByEmailSendFalseAndReadNotificationFalseAndReminderBetween(Date start, Date end);
    List<Note> findByReminderAfterAndReadNotificationFalseAndUserId(Date oneMinuteBefore, String userId);
}
