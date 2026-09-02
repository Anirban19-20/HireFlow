package com.anirban.dto;

import com.anirban.entity.EmploymentType;
import com.anirban.entity.JobStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class SavedJobResponse {

    private Long savedJobId;

    private Long jobId;

    private String title;

    private String companyName;

    private String location;

    private EmploymentType employmentType;

    private Integer experienceRequired;

    private Double salaryMin;

    private Double salaryMax;

    private String skills;

    private JobStatus status;

    private LocalDate deadline;

    private LocalDateTime savedAt;

    public SavedJobResponse() {
    }

    public Long getSavedJobId() {
        return savedJobId;
    }

    public void setSavedJobId(Long savedJobId) {
        this.savedJobId = savedJobId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(
            EmploymentType employmentType) {

        this.employmentType = employmentType;
    }

    public Integer getExperienceRequired() {
        return experienceRequired;
    }

    public void setExperienceRequired(
            Integer experienceRequired) {

        this.experienceRequired =
                experienceRequired;
    }

    public Double getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(Double salaryMin) {
        this.salaryMin = salaryMin;
    }

    public Double getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(Double salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}