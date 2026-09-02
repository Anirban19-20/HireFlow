package com.anirban.dto;

import com.anirban.entity.EmploymentType;

import java.time.LocalDate;

public class JobRequest {

    private String title;

    private String description;

    private String location;

    private EmploymentType employmentType;

    private Integer experienceRequired;

    private Double salaryMin;

    private Double salaryMax;

    private String skills;

    private LocalDate deadline;

    public JobRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description) {

        this.description = description;
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

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }
}