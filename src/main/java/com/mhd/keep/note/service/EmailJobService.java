package com.mhd.keep.note.service;

import com.mhd.keep.note.domain.Note;
import com.mhd.keep.note.domain.Request;
import com.mhd.keep.note.repo.NoteRepository;
import com.mhd.keep.note.repo.RequestRepository;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.Date;
import java.util.List;

@Service
public class EmailJobService {

    private static final Logger logger = LoggerFactory.getLogger(EmailJobService.class);

    private final NoteRepository noteRepository;
    private final RequestRepository requestRepository;
    private final JavaMailSender mailSender;

    @Autowired
    public EmailJobService(NoteRepository noteRepository, RequestRepository requestRepository, JavaMailSender mailSender) {
        this.noteRepository = noteRepository;
        this.requestRepository = requestRepository;
        this.mailSender = mailSender;
    }

    @Scheduled(fixedDelay = 10000)
    public void sendEmailReminders() {
        Date now = new Date();
        Date twentyMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

        List<Note> notesToNotify = noteRepository.findByEmailSendFalseAndReadNotificationFalseAndReminderBetween(now, twentyMinutesLater);
        logger.info("Found {} notes for email reminders", notesToNotify.size());

        for (Note note : notesToNotify) {
            try {
                List<Request> requests = requestRepository.findByUserIdAndProUserTrue(note.getUserId());

                if (!requests.isEmpty()) {
                    sendEmail(note);
                    note.setEmailSend(true);
                    noteRepository.save(note);
                    logger.info("Email sent to userId {} for note id {}", note.getUserId(), note.getId());
                }
            } catch (Exception e) {
                logger.error("Failed to send email for note id {}: {}", note.getId(), e.getMessage());
            }
        }
    }


    private void sendEmail(Note note) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "utf-8");


            helper.setTo(note.getEmail());
            helper.setSubject("Reminder: " + note.getTitle());
            helper.setFrom(new InternetAddress("testmahdi49@gmail.com", "Keep Note"));

            Date now = new Date();
            Date reminderTime = note.getReminder();
            long diffMillis = reminderTime.getTime() - now.getTime();

            String timeRemaining;
            if(diffMillis > 0) {
                long diffSeconds = diffMillis / 1000;
                long diffMinutes = diffSeconds / 60;
                long diffHours = diffMinutes / 60;
                long diffDays = diffHours / 24;

                long hours = diffHours % 24;
                long minutes = diffMinutes % 60;

                timeRemaining = String.format("%d days, %d hours, %d minutes", diffDays, hours, minutes);
            } else {
                timeRemaining = "Reminder time has passed";
            }

            String emailText = "Dear user,\n\nThis is a reminder for your note:\n\n" +
                    "Title: " + note.getTitle() + "\n" +
                    "Content: " + note.getContent() + "\n" +
                    "Reminder Time: " + reminderTime + "\n" +
                    "Time Remaining: " + timeRemaining + "\n\n" +
                    "Please take necessary actions.\n\nBest regards,\nYour Keep Note Reminder Service";

            String htmlContent = "<html><body>" +
                    "<h2 style='color: #3498db;'>📌 Reminder for Your Note</h2>" +
                    "<p><b>Title:</b> " + note.getTitle() + "</p>" +
                    "<p><b>Content:</b> " + note.getContent() + "</p>" +
                    "<p>⏳ <b>Reminder Time:</b> " + reminderTime + "</p>" +
                    "<p>⏳ <b>Time Remaining:</b> " + timeRemaining + "</p>" +
                    "<hr>" +
                    "<p><img src='cid:avatar' width='50' height='50' style='border-radius: 50%;' alt='Sender Avatar'/> " +
                    "<b>Your Keep Note Reminder Service</b></p>" +
                    "</body></html>";

            helper.setText(htmlContent, true);
            FileSystemResource avatar = new FileSystemResource(new File("src/main/resources/static/images/reminder.png"));
            helper.addInline("avatar", avatar);
            mailSender.send(mimeMessage);
            logger.info("Sent email reminder to {} for note id {}", note.getEmail(), note.getId());
        } catch (Exception e) {
            logger.error("Error sending email", e);
        }
    }
}

