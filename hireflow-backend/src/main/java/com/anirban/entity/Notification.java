package com.anirban.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications"
)
public class Notification {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    // =====================================================
    // USER WHO RECEIVES THE NOTIFICATION
    // =====================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // =====================================================
    // TYPE
    // =====================================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 50
    )
    private NotificationType type;

    // =====================================================
    // CONTENT
    // =====================================================

    @Column(
            nullable = false,
            length = 150
    )
    private String title;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String message;

    // =====================================================
    // RELATED APPLICATION / JOB / INTERVIEW
    //
    // We keep IDs instead of full JPA relationships.
    // Notifications remain lightweight.
    // =====================================================

    @Column(
            name = "application_id"
    )
    private Long applicationId;

    @Column(
            name = "job_id"
    )
    private Long jobId;

    @Column(
            name = "interview_id"
    )
    private Long interviewId;

    // =====================================================
    // READ STATUS
    // =====================================================

    @Column(
            name = "is_read",
            nullable = false
    )
    private boolean read = false;

    // =====================================================
    // CREATED DATE
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Notification() {

    }

    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {

            createdAt =
                    LocalDateTime.now();
        }
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

    public User getUser() {

        return user;
    }

    public void setUser(
            User user) {

        this.user = user;
    }

    public NotificationType getType() {

        return type;
    }

    public void setType(
            NotificationType type) {

        this.type = type;
    }

    public String getTitle() {

        return title;
    }

    public void setTitle(
            String title) {

        this.title = title;
    }

    public String getMessage() {

        return message;
    }

    public void setMessage(
            String message) {

        this.message = message;
    }

    public Long getApplicationId() {

        return applicationId;
    }

    public void setApplicationId(
            Long applicationId) {

        this.applicationId =
                applicationId;
    }

    public Long getJobId() {

        return jobId;
    }

    public void setJobId(
            Long jobId) {

        this.jobId = jobId;
    }

    public Long getInterviewId() {

        return interviewId;
    }

    public void setInterviewId(
            Long interviewId) {

        this.interviewId =
                interviewId;
    }

    public boolean isRead() {

        return read;
    }

    public void setRead(
            boolean read) {

        this.read = read;
    }

    public LocalDateTime getCreatedAt() {

        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt =
                createdAt;
    }
}