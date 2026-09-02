package com.anirban.dto;

import com.anirban.entity.InterviewMode;

import java.time.LocalDateTime;

public class InterviewRequest {

    private LocalDateTime scheduledAt;

    private InterviewMode mode;

    private String meetingLink;

    private String location;

    private String notes;

    // Optional.
    // Backend automatically generates a name
    // if frontend does not provide one.
    private String roundName;

    public InterviewRequest() {
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(
            LocalDateTime scheduledAt) {

        this.scheduledAt =
                scheduledAt;
    }

    public InterviewMode getMode() {
        return mode;
    }

    public void setMode(
            InterviewMode mode) {

        this.mode = mode;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(
            String meetingLink) {

        this.meetingLink =
                meetingLink;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(
            String location) {

        this.location =
                location;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(
            String notes) {

        this.notes = notes;
    }

    public String getRoundName() {
        return roundName;
    }

    public void setRoundName(
            String roundName) {

        this.roundName =
                roundName;
    }
}