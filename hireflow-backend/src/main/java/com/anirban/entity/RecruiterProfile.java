package com.anirban.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "recruiter_profiles",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = "user_id"
                )
        }
)
public class RecruiterProfile {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @OneToOne
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    @Column(nullable = false)
    private String companyName;

    @Column(columnDefinition = "TEXT")
    private String companyDescription;

    private String website;

    public RecruiterProfile() {
    }

    public RecruiterProfile(
            User user) {

        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id) {

        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(
            User user) {

        this.user = user;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(
            String companyName) {

        this.companyName =
                companyName;
    }

    public String
    getCompanyDescription() {

        return companyDescription;
    }

    public void setCompanyDescription(
            String companyDescription) {

        this.companyDescription =
                companyDescription;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(
            String website) {

        this.website =
                website;
    }
}