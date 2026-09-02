package com.anirban.service;

import java.util.List;

import com.anirban.dto.JobOfferRequest;
import com.anirban.dto.JobOfferResponse;

public interface JobOfferService {

    JobOfferResponse saveDraft(
            Long recruiterId,
            Long applicationId,
            JobOfferRequest request
    );


    JobOfferResponse sendOffer(
            Long recruiterId,
            Long offerId
    );


    JobOfferResponse withdrawOffer(
            Long recruiterId,
            Long offerId
    );


    JobOfferResponse getOfferByApplication(
            Long recruiterId,
            Long applicationId
    );


    List<JobOfferResponse> getRecruiterOffers(
            Long recruiterId
    );


    List<JobOfferResponse> getCandidateOffers(
            Long candidateId
    );


    JobOfferResponse acceptOffer(
            Long candidateId,
            Long offerId
    );


    JobOfferResponse rejectOffer(
            Long candidateId,
            Long offerId
    );
}