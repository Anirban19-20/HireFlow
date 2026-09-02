package com.anirban.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "interviews",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_interview_application_round",
                        columnNames = {
                                "application_id",
                                "round_number"
                        }
                )
        }
)
public class Interview {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    // =====================================================
    // APPLICATION
    // =====================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "application_id",
            nullable = false
    )
    private Application application;

    // =====================================================
    // ROUND
    // =====================================================

    @Column(
            name = "round_number",
            nullable = false
    )
    private Integer roundNumber;

    @Column(
            name = "round_name",
            nullable = false,
            length = 150
    )
    private String roundName;

    // =====================================================
    // INTERVIEW DATE / TIME
    // =====================================================

    @Column(
            name = "scheduled_at",
            nullable = false
    )
    private LocalDateTime scheduledAt;

    // =====================================================
    // MODE
    // =====================================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 20
    )
    private InterviewMode mode;

    // =====================================================
    // ONLINE MEETING LINK
    // =====================================================

    @Column(
            name = "meeting_link",
            length = 1000
    )
    private String meetingLink;

    // =====================================================
    // OFFLINE LOCATION
    // =====================================================

    @Column(
            length = 500
    )
    private String location;

    // =====================================================
    // NOTES
    // =====================================================

    @Column(
            columnDefinition = "TEXT"
    )
    private String notes;

    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 30
    )
    private InterviewStatus status;

    // =====================================================
    // CREATED / UPDATED
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Interview() {
    }

    // =====================================================
    // LIFECYCLE
    // =====================================================

    @PrePersist
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {

            createdAt = now;
        }

        updatedAt = now;

        if (status == null) {

            status =
                    InterviewStatus.SCHEDULED;
        }

        if (roundNumber == null) {

            roundNumber = 1;
        }

        if (
                roundName == null ||
                roundName.isBlank()
        ) {

            roundName =
                    "Interview Round "
                            + roundNumber;
        }
    }

    @PreUpdate
    public void preUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(
            Long id) {

        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(
            Application application) {

        this.application =
                application;
    }

    public Integer getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(
            Integer roundNumber) {

        this.roundNumber =
                roundNumber;
    }

    public String getRoundName() {
        return roundName;
    }

    public void setRoundName(
            String roundName) {

        this.roundName =
                roundName;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(
            LocalDateTime scheduledAt) {

        this.scheduledAt =
                scheduledAt;
    }

    public InterviewMode getMode() {
        return mode;
    }

    public void setMode(
            InterviewMode mode) {

        this.mode = mode;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(
            String meetingLink) {

        this.meetingLink =
                meetingLink;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(
            String location) {

        this.location =
                location;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(
            String notes) {

        this.notes = notes;
    }

    public InterviewStatus getStatus() {
        return status;
    }

    public void setStatus(
            InterviewStatus status) {

        this.status = status;
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
}