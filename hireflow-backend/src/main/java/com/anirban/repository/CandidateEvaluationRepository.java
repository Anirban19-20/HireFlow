package com.anirban.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anirban.entity.CandidateEvaluation;

public interface CandidateEvaluationRepository
        extends JpaRepository<
                CandidateEvaluation,
                Long> {

    Optional<CandidateEvaluation>
    findByApplicationIdAndRecruiterId(
            Long applicationId,
            Long recruiterId
    );
}