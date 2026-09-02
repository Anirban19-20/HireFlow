package com.anirban.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anirban.entity.CandidateOnboarding;

public interface CandidateOnboardingRepository
        extends JpaRepository<
                CandidateOnboarding,
                Long> {

    Optional<CandidateOnboarding>
    findByOfferId(
            Long offerId
    );


    List<CandidateOnboarding>
    findByOfferApplicationJobRecruiterIdOrderByCreatedAtDesc(
            Long recruiterId
    );


    List<CandidateOnboarding>
    findByOfferApplicationCandidateIdOrderByCreatedAtDesc(
            Long candidateId
    );
}
