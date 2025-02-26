package com.mhd.keep.note.model;

import java.util.Date;

public class NoteModel {
    private Long id;
    private String title;
    private String content;
    private String color;
    private boolean pinned;
    private boolean archived;
    private String reminder;
    private String userId;
    private String email;
    private boolean emailSend;
    private boolean readNotification;


    public NoteModel(Long id, String title, String content, String color, boolean pinned, boolean archived, String reminder, String userId, String email, boolean emailSend, boolean readNotification) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.color = color;
        this.pinned = pinned;
        this.archived = archived;
        this.reminder = reminder;
        this.userId = userId;
        this.email = email;
        this.emailSend = emailSend;
        this.readNotification = readNotification;
    }

    public boolean isReadNotification() {
        return readNotification;
    }

    public void setReadNotification(boolean readNotification) {
        this.readNotification = readNotification;
    }

    public NoteModel() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public boolean isPinned() {
        return pinned;
    }

    public void setPinned(boolean pinned) {
        this.pinned = pinned;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public String getReminder() {
        return reminder;
    }

    public void setReminder(String reminder) {
        this.reminder = reminder;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isEmailSend() {
        return emailSend;
    }

    public void setEmailSend(boolean emailSend) {
        this.emailSend = emailSend;
    }
}
