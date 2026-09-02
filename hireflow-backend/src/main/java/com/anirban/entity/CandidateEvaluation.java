package com.anirban.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "candidate_evaluations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_candidate_evaluation_application_recruiter",
                        columnNames = {
                                "application_id",
                                "recruiter_id"
                        }
                )
        }
)
public class CandidateEvaluation {

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
    // RECRUITER
    // =====================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "recruiter_id",
            nullable = false
    )
    private User recruiter;


    // =====================================================
    // SCORES - 1 TO 5
    // =====================================================

    @Column(
            name = "technical_skills",
            nullable = false
    )
    private Integer technicalSkills;


    @Column(
            name = "communication",
            nullable = false
    )
    private Integer communication;


    @Column(
            name = "relevant_experience",
            nullable = false
    )
    private Integer relevantExperience;


    @Column(
            name = "culture_fit",
            nullable = false
    )
    private Integer cultureFit;


    @Column(
            name = "interview_performance",
            nullable = false
    )
    private Integer interviewPerformance;


    // =====================================================
    // OVERALL SCORE
    // =====================================================

    @Column(
            name = "overall_score",
            nullable = false
    )
    private Double overallScore;


    // =====================================================
    // PRIVATE NOTES
    // =====================================================

    @Column(
            name = "private_notes",
            columnDefinition = "TEXT"
    )
    private String privateNotes;


    // =====================================================
    // TIMESTAMPS
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


    // =====================================================
    // DEFAULT CONSTRUCTOR
    // =====================================================

    public CandidateEvaluation() {

    }


    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt =
                now;

        updatedAt =
                now;
    }


    // =====================================================
    // PRE UPDATE
    // =====================================================

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


    public User getRecruiter() {

        return recruiter;
    }

    public void setRecruiter(
            User recruiter) {

        this.recruiter =
                recruiter;
    }


    public Integer getTechnicalSkills() {

        return technicalSkills;
    }

    public void setTechnicalSkills(
            Integer technicalSkills) {

        this.technicalSkills =
                technicalSkills;
    }


    public Integer getCommunication() {

        return communication;
    }

    public void setCommunication(
            Integer communication) {

        this.communication =
                communication;
    }


    public Integer getRelevantExperience() {

        return relevantExperience;
    }

    public void setRelevantExperience(
            Integer relevantExperience) {

        this.relevantExperience =
                relevantExperience;
    }


    public Integer getCultureFit() {

        return cultureFit;
    }

    public void setCultureFit(
            Integer cultureFit) {

        this.cultureFit =
                cultureFit;
    }


    public Integer getInterviewPerformance() {

        return interviewPerformance;
    }

    public void setInterviewPerformance(
            Integer interviewPerformance) {

        this.interviewPerformance =
                interviewPerformance;
    }


    public Double getOverallScore() {

        return overallScore;
    }

    public void setOverallScore(
            Double overallScore) {

        this.overallScore =
                overallScore;
    }


    public String getPrivateNotes() {

        return privateNotes;
    }

    public void setPrivateNotes(
            String privateNotes) {

        this.privateNotes =
                privateNotes;
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