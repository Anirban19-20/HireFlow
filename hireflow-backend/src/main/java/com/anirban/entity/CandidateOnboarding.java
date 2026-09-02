package com.anirban.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "candidate_onboardings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_candidate_onboarding_offer",
                        columnNames = "offer_id"
                )
        }
)
public class CandidateOnboarding {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // =====================================================
    // ACCEPTED JOB OFFER
    // =====================================================

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "offer_id",
            nullable = false,
            unique = true
    )
    private JobOffer offer;


    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "status",
            nullable = false,
            length = 40
    )
    private OnboardingStatus status;


    // =====================================================
    // JOINING DETAILS
    // =====================================================

    @Column(
            name = "joining_date",
            nullable = false
    )
    private LocalDate joiningDate;


    @Column(
            name = "reporting_time"
    )
    private LocalTime reportingTime;


    @Column(
            name = "reporting_location",
            length = 500
    )
    private String reportingLocation;


    // =====================================================
    // HR CONTACT
    // =====================================================

    @Column(
            name = "hr_contact_name",
            length = 150
    )
    private String hrContactName;


    @Column(
            name = "hr_contact_email",
            length = 255
    )
    private String hrContactEmail;


    @Column(
            name = "hr_contact_phone",
            length = 50
    )
    private String hrContactPhone;


    // =====================================================
    // ONBOARDING INFORMATION
    // =====================================================

    @Column(
            name = "instructions",
            columnDefinition = "TEXT"
    )
    private String instructions;


    @Column(
            name = "documents_required",
            columnDefinition = "TEXT"
    )
    private String documentsRequired;


    // =====================================================
    // AUDIT
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;


    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;


    @Column(
            name = "joined_at"
    )
    private LocalDateTime joinedAt;


    public CandidateOnboarding() {

    }


    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (
                createdAt == null
        ) {

            createdAt =
                    now;
        }

        updatedAt =
                now;

        if (
                status == null
        ) {

            status =
                    OnboardingStatus.JOINING_PENDING;
        }
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }


    public Long getId() {

        return id;
    }

    public void setId(
            Long id) {

        this.id =
                id;
    }


    public JobOffer getOffer() {

        return offer;
    }

    public void setOffer(
            JobOffer offer) {

        this.offer =
                offer;
    }


    public OnboardingStatus getStatus() {

        return status;
    }

    public void setStatus(
            OnboardingStatus status) {

        this.status =
                status;
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


    public LocalDateTime getCreatedAt() {

        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt =
                createdAt;
    }


    public LocalDateTime getUpdatedAt() {

        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt) {

        this.updatedAt =
                updatedAt;
    }


    public LocalDateTime getJoinedAt() {

        return joinedAt;
    }

    public void setJoinedAt(
            LocalDateTime joinedAt) {

        this.joinedAt =
                joinedAt;
    }
}
