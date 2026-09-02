package com.anirban.dto;

import com.anirban.entity.EmploymentType;
import com.anirban.entity.JobStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobResponse {

    private Long id;

    private Long recruiterId;

    private String companyName;

    private String title;

    private String description;

    private String location;

    private EmploymentType employmentType;

    private Integer experienceRequired;

    private Double salaryMin;

    private Double salaryMax;

    private String skills;

    private JobStatus status;

    private LocalDateTime createdAt;

    private LocalDate deadline;

    public JobResponse() {
    }

    public JobResponse(
            Long id,
            Long recruiterId,
            String companyName,
            String title,
            String description,
            String location,
            EmploymentType employmentType,
            Integer experienceRequired,
            Double salaryMin,
            Double salaryMax,
            String skills,
            JobStatus status,
            LocalDateTime createdAt,
            LocalDate deadline) {

        this.id = id;
        this.recruiterId = recruiterId;
        this.companyName = companyName;
        this.title = title;
        this.description = description;
        this.location = location;
        this.employmentType = employmentType;
        this.experienceRequired =
                experienceRequired;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.skills = skills;
        this.status = status;
        this.createdAt = createdAt;
        this.deadline = deadline;
    }

    public Long getId() {
        return id;
    }

    public Long getRecruiterId() {
        return recruiterId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getLocation() {
        return location;
    }

    public EmploymentType getEmploymentType() {
        return employmentType;
    }

    public Integer getExperienceRequired() {
        return experienceRequired;
    }

    public Double getSalaryMin() {
        return salaryMin;
    }

    public Double getSalaryMax() {
        return salaryMax;
    }

    public String getSkills() {
        return skills;
    }

    public JobStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDate getDeadline() {
        return deadline;
    }
}