package com.anirban.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "saved_jobs",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_saved_job_candidate_job",
            columnNames = {
                "candidate_id",
                "job_id"
            }
        )
    }
)
public class SavedJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "candidate_id",
        nullable = false
    )
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "job_id",
        nullable = false
    )
    private Job job;

    @Column(
        name = "saved_at",
        nullable = false
    )
    private LocalDateTime savedAt;

    public SavedJob() {
    }

    @PrePersist
    protected void onCreate() {

        if (savedAt == null) {
            savedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public User getCandidate() {
        return candidate;
    }

    public void setCandidate(User candidate) {
        this.candidate = candidate;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}