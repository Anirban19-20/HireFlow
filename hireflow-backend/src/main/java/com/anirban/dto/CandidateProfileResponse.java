package com.anirban.dto;

public class CandidateProfileResponse {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String location;
    private String skills;
    private Integer experience;
    private String education;
    private String resumeUrl;

    public CandidateProfileResponse() {
    }

    public CandidateProfileResponse(
            Long id,
            Long userId,
            String name,
            String email,
            String phone,
            String location,
            String skills,
            Integer experience,
            String education,
            String resumeUrl) {

        this.id = id;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.location = location;
        this.skills = skills;
        this.experience = experience;
        this.education = education;
        this.resumeUrl = resumeUrl;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getLocation() {
        return location;
    }

    public String getSkills() {
        return skills;
    }

    public Integer getExperience() {
        return experience;
    }

    public String getEducation() {
        return education;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }
}