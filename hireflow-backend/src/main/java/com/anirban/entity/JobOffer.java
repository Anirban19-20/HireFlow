package com.anirban.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
        name = "job_offers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_job_offer_application",
                        columnNames = "application_id"
                )
        }
)
public class JobOffer {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // =====================================================
    // APPLICATION
    // =====================================================

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "application_id",
            nullable = false,
            unique = true
    )
    private Application application;


    // =====================================================
    // OFFER DETAILS
    // =====================================================

    @Column(
            name = "offered_salary",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal offeredSalary;


    @Column(
            name = "currency",
            nullable = false,
            length = 10
    )
    private String currency;


    @Column(
            name = "joining_date",
            nullable = false
    )
    private LocalDate joiningDate;


    @Column(
            name = "expires_at",
            nullable = false
    )
    private LocalDateTime expiresAt;


    @Column(
            name = "message",
            columnDefinition = "TEXT"
    )
    private String message;


    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private OfferStatus status;


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
            name = "sent_at"
    )
    private LocalDateTime sentAt;


    @Column(
            name = "responded_at"
    )
    private LocalDateTime respondedAt;


    public JobOffer() {

    }


    @PrePersist
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt =
                now;

        updatedAt =
                now;

        if (
                status == null
        ) {

            status =
                    OfferStatus.DRAFT;
        }

        if (
                currency == null ||
                currency.isBlank()
        ) {

            currency =
                    "INR";
        }
    }


    @PreUpdate
    public void preUpdate() {

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


    public Application getApplication() {

        return application;
    }

    public void setApplication(
            Application application) {

        this.application =
                application;
    }


    public BigDecimal getOfferedSalary() {

        return offeredSalary;
    }

    public void setOfferedSalary(
            BigDecimal offeredSalary) {

        this.offeredSalary =
                offeredSalary;
    }


    public String getCurrency() {

        return currency;
    }

    public void setCurrency(
            String currency) {

        this.currency =
                currency;
    }


    public LocalDate getJoiningDate() {

        return joiningDate;
    }

    public void setJoiningDate(
            LocalDate joiningDate) {

        this.joiningDate =
                joiningDate;
    }


    public LocalDateTime getExpiresAt() {

        return expiresAt;
    }

    public void setExpiresAt(
            LocalDateTime expiresAt) {

        this.expiresAt =
                expiresAt;
    }


    public String getMessage() {

        return message;
    }

    public void setMessage(
            String message) {

        this.message =
                message;
    }


    public OfferStatus getStatus() {

        return status;
    }

    public void setStatus(
            OfferStatus status) {

        this.status =
                status;
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


    public LocalDateTime getSentAt() {

        return sentAt;
    }

    public void setSentAt(
            LocalDateTime sentAt) {

        this.sentAt =
                sentAt;
    }


    public LocalDateTime getRespondedAt() {

        return respondedAt;
    }

    public void setRespondedAt(
            LocalDateTime respondedAt) {

        this.respondedAt =
                respondedAt;
    }
}