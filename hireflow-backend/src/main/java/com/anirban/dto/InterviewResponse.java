package com.anirban.dto;

import com.anirban.entity.InterviewMode;
import com.anirban.entity.InterviewStatus;

import java.time.LocalDateTime;

public class InterviewResponse {

    private Long id;

    private Long applicationId;

    private Long jobId;

    private String jobTitle;

    private Long candidateId;

    private String candidateName;

    private String candidateEmail;

    private Integer roundNumber;

    private String roundName;

    private InterviewMode mode;

    private LocalDateTime scheduledAt;

    private String meetingLink;

    private String location;

    private String notes;

    private InterviewStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public InterviewResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id) {

        this.id = id;
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

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(
            String jobTitle) {

        this.jobTitle =
                jobTitle;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(
            Long candidateId) {

        this.candidateId =
                candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(
            String candidateName) {

        this.candidateName =
                candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public void setCandidateEmail(
            String candidateEmail) {

        this.candidateEmail =
                candidateEmail;
    }

    public Integer getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(
            Integer roundNumber) {

        this.roundNumber =
                roundNumber;
    }

    public String getRoundName() {
        return roundName;
    }

    public void setRoundName(
            String roundName) {

        this.roundName =
                roundName;
    }

    public InterviewMode getMode() {
        return mode;
    }

    public void setMode(
            InterviewMode mode) {

        this.mode = mode;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(
            LocalDateTime scheduledAt) {

        this.scheduledAt =
                scheduledAt;
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

    public InterviewStatus getStatus() {
        return status;
    }

    public void setStatus(
            InterviewStatus status) {

        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt =
                createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt) {

        this.updatedAt =
                updatedAt;
    }
}