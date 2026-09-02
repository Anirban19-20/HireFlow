package com.anirban.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.anirban.entity.OfferStatus;

public class JobOfferResponse {

    private Long id;

    private Long applicationId;

    private Long jobId;

    private String jobTitle;

    private Long candidateId;

    private String candidateName;

    private String candidateEmail;

    private BigDecimal offeredSalary;

    private String currency;

    private LocalDate joiningDate;

    private LocalDateTime expiresAt;

    private String message;

    private OfferStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime sentAt;

    private LocalDateTime respondedAt;


    public JobOfferResponse() {

    }


    public Long getId() {

        return id;
    }

    public void setId(
            Long id) {

        this.id =
                id;
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

        this.jobId =
                jobId;
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


    public BigDecimal getOfferedSalary() {

        return offeredSalary;
    }

    public void setOfferedSalary(
            BigDecimal offeredSalary) {

        this.offeredSalary =
                offeredSalary;
    }


    public String getCurrency() {

        return currency;
    }

    public void setCurrency(
            String currency) {

        this.currency =
                currency;
    }


    public LocalDate getJoiningDate() {

        return joiningDate;
    }

    public void setJoiningDate(
            LocalDate joiningDate) {

        this.joiningDate =
                joiningDate;
    }


    public LocalDateTime getExpiresAt() {

        return expiresAt;
    }

    public void setExpiresAt(
            LocalDateTime expiresAt) {

        this.expiresAt =
                expiresAt;
    }


    public String getMessage() {

        return message;
    }

    public void setMessage(
            String message) {

        this.message =
                message;
    }


    public OfferStatus getStatus() {

        return status;
    }

    public void setStatus(
            OfferStatus status) {

        this.status =
                status;
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


    public LocalDateTime getSentAt() {

        return sentAt;
    }

    public void setSentAt(
            LocalDateTime sentAt) {

        this.sentAt =
                sentAt;
    }


    public LocalDateTime getRespondedAt() {

        return respondedAt;
    }

    public void setRespondedAt(
            LocalDateTime respondedAt) {

        this.respondedAt =
                respondedAt;
    }
}