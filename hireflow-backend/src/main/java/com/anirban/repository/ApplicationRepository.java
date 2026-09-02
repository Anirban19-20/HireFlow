package com.anirban.repository;

import com.anirban.entity.Application;
import com.anirban.entity.ApplicationStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    boolean existsByJobIdAndCandidateId(
            Long jobId,
            Long candidateId
    );

    List<Application> findByCandidateIdOrderByAppliedAtDesc(
            Long candidateId
    );

    Optional<Application> findByIdAndCandidateId(
            Long applicationId,
            Long candidateId
    );

    List<Application> findByJobIdOrderByAppliedAtDesc(
            Long jobId
    );

    Optional<Application> findByIdAndJobId(
            Long applicationId,
            Long jobId
    );

    long countByJobRecruiterId(
            Long recruiterId
    );

    long countByJobRecruiterIdAndStatus(
            Long recruiterId,
            ApplicationStatus status
    );

    // =====================================================
    // ADMIN
    // =====================================================

    long countByStatus(
            ApplicationStatus status
    );
}