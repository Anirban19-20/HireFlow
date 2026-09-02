package com.anirban.dto;

import java.time.LocalDateTime;

import com.anirban.entity.ApplicationStatus;

public class RecruiterApplicationResponse {

    private Long applicationId;

    private Long jobId;

    private String jobTitle;

    private Long candidateId;

    private String candidateName;

    private String candidateEmail;

    // =====================================================
    // CANDIDATE PROFILE
    // =====================================================

    private String candidatePhone;

    private String candidateLocation;

    private String candidateSkills;

    private Integer candidateExperience;

    private String candidateEducation;

    // =====================================================
    // APPLICATION
    // =====================================================

    private String resumeUrl;

    private String coverLetter;

    private ApplicationStatus status;

    private LocalDateTime appliedAt;


    public RecruiterApplicationResponse() {

    }


    // =====================================================
    // APPLICATION ID
    // =====================================================

    public Long getApplicationId() {

        return applicationId;
    }

    public void setApplicationId(
            Long applicationId) {

        this.applicationId =
                applicationId;
    }


    // =====================================================
    // JOB ID
    // =====================================================

    public Long getJobId() {

        return jobId;
    }

    public void setJobId(
            Long jobId) {

        this.jobId =
                jobId;
    }


    // =====================================================
    // JOB TITLE
    // =====================================================

    public String getJobTitle() {

        return jobTitle;
    }

    public void setJobTitle(
            String jobTitle) {

        this.jobTitle =
                jobTitle;
    }


    // =====================================================
    // CANDIDATE ID
    // =====================================================

    public Long getCandidateId() {

        return candidateId;
    }

    public void setCandidateId(
            Long candidateId) {

        this.candidateId =
                candidateId;
    }


    // =====================================================
    // CANDIDATE NAME
    // =====================================================

    public String getCandidateName() {

        return candidateName;
    }

    public void setCandidateName(
            String candidateName) {

        this.candidateName =
                candidateName;
    }


    // =====================================================
    // CANDIDATE EMAIL
    // =====================================================

    public String getCandidateEmail() {

        return candidateEmail;
    }

    public void setCandidateEmail(
            String candidateEmail) {

        this.candidateEmail =
                candidateEmail;
    }


    // =====================================================
    // CANDIDATE PHONE
    // =====================================================

    public String getCandidatePhone() {

        return candidatePhone;
    }

    public void setCandidatePhone(
            String candidatePhone) {

        this.candidatePhone =
                candidatePhone;
    }


    // =====================================================
    // CANDIDATE LOCATION
    // =====================================================

    public String getCandidateLocation() {

        return candidateLocation;
    }

    public void setCandidateLocation(
            String candidateLocation) {

        this.candidateLocation =
                candidateLocation;
    }


    // =====================================================
    // CANDIDATE SKILLS
    // =====================================================

    public String getCandidateSkills() {

        return candidateSkills;
    }

    public void setCandidateSkills(
            String candidateSkills) {

        this.candidateSkills =
                candidateSkills;
    }


    // =====================================================
    // CANDIDATE EXPERIENCE
    // =====================================================

    public Integer getCandidateExperience() {

        return candidateExperience;
    }

    public void setCandidateExperience(
            Integer candidateExperience) {

        this.candidateExperience =
                candidateExperience;
    }


    // =====================================================
    // CANDIDATE EDUCATION
    // =====================================================

    public String getCandidateEducation() {

        return candidateEducation;
    }

    public void setCandidateEducation(
            String candidateEducation) {

        this.candidateEducation =
                candidateEducation;
    }


    // =====================================================
    // RESUME
    // =====================================================

    public String getResumeUrl() {

        return resumeUrl;
    }

    public void setResumeUrl(
            String resumeUrl) {

        this.resumeUrl =
                resumeUrl;
    }


    // =====================================================
    // COVER LETTER
    // =====================================================

    public String getCoverLetter() {

        return coverLetter;
    }

    public void setCoverLetter(
            String coverLetter) {

        this.coverLetter =
                coverLetter;
    }


    // =====================================================
    // STATUS
    // =====================================================

    public ApplicationStatus getStatus() {

        return status;
    }

    public void setStatus(
            ApplicationStatus status) {

        this.status =
                status;
    }


    // =====================================================
    // APPLIED AT
    // =====================================================

    public LocalDateTime getAppliedAt() {

        return appliedAt;
    }

    public void setAppliedAt(
            LocalDateTime appliedAt) {

        this.appliedAt =
                appliedAt;
    }
}