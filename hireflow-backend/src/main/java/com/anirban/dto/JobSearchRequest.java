package com.anirban.dto;

import com.anirban.entity.EmploymentType;

public class JobSearchRequest {

    private String keyword;

    private String location;

    private EmploymentType employmentType;

    private Integer minExperience;

    private Double maxSalary;

    private String skill;

    public JobSearchRequest() {
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
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

    public Integer getMinExperience() {
        return minExperience;
    }

    public void setMinExperience(
            Integer minExperience) {

        this.minExperience = minExperience;
    }

    public Double getMaxSalary() {
        return maxSalary;
    }

    public void setMaxSalary(Double maxSalary) {
        this.maxSalary = maxSalary;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }
}