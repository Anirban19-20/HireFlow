package com.anirban.service;

import java.util.List;

import com.anirban.dto.CandidateOnboardingRequest;
import com.anirban.dto.CandidateOnboardingResponse;
import com.anirban.entity.JobOffer;
import com.anirban.entity.OnboardingStatus;

public interface CandidateOnboardingService {

    CandidateOnboardingResponse ensureOnboardingForOffer(
            Long recruiterId,
            Long offerId
    );


    CandidateOnboardingResponse ensureOnboardingForAcceptedOffer(
            JobOffer offer
    );


    CandidateOnboardingResponse updateOnboarding(
            Long recruiterId,
            Long onboardingId,
            CandidateOnboardingRequest request
    );


    CandidateOnboardingResponse updateStatus(
            Long recruiterId,
            Long onboardingId,
            OnboardingStatus status
    );


    List<CandidateOnboardingResponse> getRecruiterOnboardings(
            Long recruiterId
    );


    CandidateOnboardingResponse getRecruiterOnboarding(
            Long recruiterId,
            Long onboardingId
    );


    List<CandidateOnboardingResponse> getCandidateOnboardings(
            Long candidateId
    );


    CandidateOnboardingResponse getCandidateOnboarding(
            Long candidateId,
            Long onboardingId
    );
}
