package com.anirban.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anirban.entity.JobOffer;

public interface JobOfferRepository
        extends JpaRepository<
                JobOffer,
                Long> {

    Optional<JobOffer>
    findByApplicationId(
            Long applicationId
    );


    List<JobOffer>
    findByApplicationJobRecruiterIdOrderByCreatedAtDesc(
            Long recruiterId
    );


    List<JobOffer>
    findByApplicationCandidateIdOrderByCreatedAtDesc(
            Long candidateId
    );
}