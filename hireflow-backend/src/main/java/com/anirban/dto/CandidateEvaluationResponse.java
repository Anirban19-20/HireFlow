package com.anirban.dto;

import java.time.LocalDateTime;

public class CandidateEvaluationResponse {

    private Long id;

    private Long applicationId;

    private Long candidateId;

    private String candidateName;

    private Long jobId;

    private String jobTitle;

    private Integer technicalSkills;

    private Integer communication;

    private Integer relevantExperience;

    private Integer cultureFit;

    private Integer interviewPerformance;

    private Double overallScore;

    private String privateNotes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    public CandidateEvaluationResponse() {

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


    public Integer getTechnicalSkills() {

        return technicalSkills;
    }

    public void setTechnicalSkills(
            Integer technicalSkills) {

        this.technicalSkills =
                technicalSkills;
    }


    public Integer getCommunication() {

        return communication;
    }

    public void setCommunication(
            Integer communication) {

        this.communication =
                communication;
    }


    public Integer getRelevantExperience() {

        return relevantExperience;
    }

    public void setRelevantExperience(
            Integer relevantExperience) {

        this.relevantExperience =
                relevantExperience;
    }


    public Integer getCultureFit() {

        return cultureFit;
    }

    public void setCultureFit(
            Integer cultureFit) {

        this.cultureFit =
                cultureFit;
    }


    public Integer getInterviewPerformance() {

        return interviewPerformance;
    }

    public void setInterviewPerformance(
            Integer interviewPerformance) {

        this.interviewPerformance =
                interviewPerformance;
    }


    public Double getOverallScore() {

        return overallScore;
    }

    public void setOverallScore(
            Double overallScore) {

        this.overallScore =
                overallScore;
    }


    public String getPrivateNotes() {

        return privateNotes;
    }

    public void setPrivateNotes(
            String privateNotes) {

        this.privateNotes =
                privateNotes;
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