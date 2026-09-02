package com.anirban.dto;

public class RecruiterProfileRequest {

    private String companyName;
    private String companyDescription;
    private String website;

    public RecruiterProfileRequest() {
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyDescription() {
        return companyDescription;
    }

    public void setCompanyDescription(
            String companyDescription) {

        this.companyDescription = companyDescription;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }
}