package com.anirban.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class CandidateOnboardingRequest {

    private LocalDate joiningDate;

    private LocalTime reportingTime;

    private String reportingLocation;

    private String hrContactName;

    private String hrContactEmail;

    private String hrContactPhone;

    private String instructions;

    private String documentsRequired;


    public CandidateOnboardingRequest() {

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
}
