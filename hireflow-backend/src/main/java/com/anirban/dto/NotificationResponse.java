package com.anirban.dto;

import com.anirban.entity.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;

    private NotificationType type;

    private String title;

    private String message;

    private Long applicationId;

    private Long jobId;

    private Long interviewId;

    private boolean read;

    private LocalDateTime createdAt;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public NotificationResponse() {

    }

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Long getId() {

        return id;
    }

    public void setId(
            Long id) {

        this.id = id;
    }

    public NotificationType getType() {

        return type;
    }

    public void setType(
            NotificationType type) {

        this.type = type;
    }

    public String getTitle() {

        return title;
    }

    public void setTitle(
            String title) {

        this.title = title;
    }

    public String getMessage() {

        return message;
    }

    public void setMessage(
            String message) {

        this.message = message;
    }

    public Long getApplicationId() {

        return applicationId;
    }

    public void setApplicationId(
            Long applicationId) {

        this.applicationId =
                applicationId;
    }

    public Long getJobId() {

        return jobId;
    }

    public void setJobId(
            Long jobId) {

        this.jobId = jobId;
    }

    public Long getInterviewId() {

        return interviewId;
    }

    public void setInterviewId(
            Long interviewId) {

        this.interviewId =
                interviewId;
    }

    public boolean isRead() {

        return read;
    }

    public void setRead(
            boolean read) {

        this.read = read;
    }

    public LocalDateTime getCreatedAt() {

        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt =
                createdAt;
    }
}