package com.anirban.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.anirban.entity.OnboardingStatus;
import com.anirban.entity.OfferStatus;

public class CandidateOnboardingResponse {

    private Long id;

    private Long offerId;

    private Long applicationId;

    private Long candidateId;

    private String candidateName;

    private String candidateEmail;

    private Long recruiterId;

    private String recruiterName;

    private Long jobId;

    private String jobTitle;

    private BigDecimal offeredSalary;

    private String currency;

    private OfferStatus offerStatus;

    private OnboardingStatus status;

    private LocalDate joiningDate;

    private LocalTime reportingTime;

    private String reportingLocation;

    private String hrContactName;

    private String hrContactEmail;

    private String hrContactPhone;

    private String instructions;

    private String documentsRequired;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime joinedAt;


    public CandidateOnboardingResponse() {

    }


    public Long getId() {

        return id;
    }

    public void setId(
            Long id) {

        this.id =
                id;
    }


    public Long getOfferId() {

        return offerId;
    }

    public void setOfferId(
            Long offerId) {

        this.offerId =
                offerId;
    }


    public Long getApplicationId() {

        return applicationId;
    }

    public void setApplicationId(
            Long applicationId) {

        this.applicationId =
                applicationId;
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


    public Long getRecruiterId() {

        return recruiterId;
    }

    public void setRecruiterId(
            Long recruiterId) {

        this.recruiterId =
                recruiterId;
    }


    public String getRecruiterName() {

        return recruiterName;
    }

    public void setRecruiterName(
            String recruiterName) {

        this.recruiterName =
                recruiterName;
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


    public OfferStatus getOfferStatus() {

        return offerStatus;
    }

    public void setOfferStatus(
            OfferStatus offerStatus) {

        this.offerStatus =
                offerStatus;
    }


    public OnboardingStatus getStatus() {

        return status;
    }

    public void setStatus(
            OnboardingStatus status) {

        this.status =
                status;
    }


    public LocalDate getJoiningDate() {

        return joiningDate;
    }

    public void setJoiningDate(
            LocalDate joiningDate) {

        this.joiningDate =
                joiningDate;
    }


    public LocalTime getReportingTime() {

        return reportingTime;
    }

    public void setReportingTime(
            LocalTime reportingTime) {

        this.reportingTime =
                reportingTime;
    }


    public String getReportingLocation() {

        return reportingLocation;
    }

    public void setReportingLocation(
            String reportingLocation) {

        this.reportingLocation =
                reportingLocation;
    }


    public String getHrContactName() {

        return hrContactName;
    }

    public void setHrContactName(
            String hrContactName) {

        this.hrContactName =
                hrContactName;
    }


    public String getHrContactEmail() {

        return hrContactEmail;
    }

    public void setHrContactEmail(
            String hrContactEmail) {

        this.hrContactEmail =
                hrContactEmail;
    }


    public String getHrContactPhone() {

        return hrContactPhone;
    }

    public void setHrContactPhone(
            String hrContactPhone) {

        this.hrContactPhone =
                hrContactPhone;
    }


    public String getInstructions() {

        return instructions;
    }

    public void setInstructions(
            String instructions) {

        this.instructions =
                instructions;
    }


    public String getDocumentsRequired() {

        return documentsRequired;
    }

    public void setDocumentsRequired(
            String documentsRequired) {

        this.documentsRequired =
                documentsRequired;
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


    public LocalDateTime getJoinedAt() {

        return joinedAt;
    }

    public void setJoinedAt(
            LocalDateTime joinedAt) {

        this.joinedAt =
                joinedAt;
    }
}
