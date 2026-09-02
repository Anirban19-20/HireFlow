package com.anirban.repository;

import com.anirban.entity.SavedJob;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedJobRepository
        extends JpaRepository<SavedJob, Long> {

    boolean existsByCandidateIdAndJobId(
            Long candidateId,
            Long jobId
    );

    List<SavedJob>
    findByCandidateIdOrderBySavedAtDesc(
            Long candidateId
    );

    Optional<SavedJob>
    findByCandidateIdAndJobId(
            Long candidateId,
            Long jobId
    );
}