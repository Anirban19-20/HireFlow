package com.anirban.dto;

public class CandidateEvaluationRequest {

    private Integer technicalSkills;

    private Integer communication;

    private Integer relevantExperience;

    private Integer cultureFit;

    private Integer interviewPerformance;

    private String privateNotes;


    public CandidateEvaluationRequest() {

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


    public String getPrivateNotes() {

        return privateNotes;
    }

    public void setPrivateNotes(
            String privateNotes) {

        this.privateNotes =
                privateNotes;
    }
}