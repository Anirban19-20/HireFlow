package com.anirban.repository;

import com.anirban.entity.EmploymentType;
import com.anirban.entity.Job;
import com.anirban.entity.JobStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobRepository
        extends JpaRepository<Job, Long> {

    List<Job> findByRecruiterId(
            Long recruiterId
    );

    Optional<Job> findByIdAndRecruiterId(
            Long id,
            Long recruiterId
    );

    List<Job> findByStatus(
            JobStatus status
    );

    List<Job> findByStatusAndTitleContainingIgnoreCase(
            JobStatus status,
            String title
    );

    List<Job> findByStatusAndLocationContainingIgnoreCase(
            JobStatus status,
            String location
    );

    List<Job> findByStatusAndEmploymentType(
            JobStatus status,
            EmploymentType employmentType
    );

    long countByRecruiterId(
            Long recruiterId
    );

    long countByRecruiterIdAndStatus(
            Long recruiterId,
            JobStatus status
    );

    // =====================================================
    // ADMIN
    // =====================================================

    long countByStatus(
            JobStatus status
    );
}