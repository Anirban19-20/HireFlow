package com.anirban.service;

import com.anirban.dto.CandidateEvaluationRequest;
import com.anirban.dto.CandidateEvaluationResponse;

public interface CandidateEvaluationService {

    CandidateEvaluationResponse getEvaluation(
            Long applicationId,
            Long recruiterId
    );

    CandidateEvaluationResponse saveEvaluation(
            Long applicationId,
            Long recruiterId,
            CandidateEvaluationRequest request
    );

    void deleteEvaluation(
            Long applicationId,
            Long recruiterId
    );
}