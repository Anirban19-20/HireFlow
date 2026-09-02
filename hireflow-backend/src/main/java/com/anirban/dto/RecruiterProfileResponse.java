package com.anirban.dto;

public class RecruiterProfileResponse {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String companyName;
    private String companyDescription;
    private String website;

    public RecruiterProfileResponse() {
    }

    public RecruiterProfileResponse(
            Long id,
            Long userId,
            String name,
            String email,
            String companyName,
            String companyDescription,
            String website) {

        this.id = id;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.companyName = companyName;
        this.companyDescription = companyDescription;
        this.website = website;
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

    public String getCompanyName() {
        return companyName;
    }

    public String getCompanyDescription() {
        return companyDescription;
    }

    public String getWebsite() {
        return website;
    }
}