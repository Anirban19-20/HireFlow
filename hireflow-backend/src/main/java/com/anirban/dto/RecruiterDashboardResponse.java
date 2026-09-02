package com.anirban.dto;

public class RecruiterDashboardResponse {

    private long totalJobs;
    private long openJobs;
    private long closedJobs;

    private long totalApplications;

    private long appliedApplications;
    private long underReviewApplications;
    private long shortlistedApplications;
    private long interviewApplications;
    private long selectedApplications;
    private long rejectedApplications;

    public RecruiterDashboardResponse() {
    }

    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getOpenJobs() {
        return openJobs;
    }

    public void setOpenJobs(long openJobs) {
        this.openJobs = openJobs;
    }

    public long getClosedJobs() {
        return closedJobs;
    }

    public void setClosedJobs(long closedJobs) {
        this.closedJobs = closedJobs;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getAppliedApplications() {
        return appliedApplications;
    }

    public void setAppliedApplications(long appliedApplications) {
        this.appliedApplications = appliedApplications;
    }

    public long getUnderReviewApplications() {
        return underReviewApplications;
    }

    public void setUnderReviewApplications(long underReviewApplications) {
        this.underReviewApplications = underReviewApplications;
    }

    public long getShortlistedApplications() {
        return shortlistedApplications;
    }

    public void setShortlistedApplications(long shortlistedApplications) {
        this.shortlistedApplications = shortlistedApplications;
    }

    public long getInterviewApplications() {
        return interviewApplications;
    }

    public void setInterviewApplications(long interviewApplications) {
        this.interviewApplications = interviewApplications;
    }

    public long getSelectedApplications() {
        return selectedApplications;
    }

    public void setSelectedApplications(long selectedApplications) {
        this.selectedApplications = selectedApplications;
    }

    public long getRejectedApplications() {
        return rejectedApplications;
    }

    public void setRejectedApplications(long rejectedApplications) {
        this.rejectedApplications = rejectedApplications;
    }
}