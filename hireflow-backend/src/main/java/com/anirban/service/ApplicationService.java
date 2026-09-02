package com.anirban.service;

import com.anirban.dto.ApplicationRequest;
import com.anirban.dto.ApplicationResponse;
import com.anirban.dto.ApplicationStatusHistoryResponse;
import com.anirban.dto.RecruiterApplicationResponse;
import com.anirban.entity.ApplicationStatus;

import java.util.List;

public interface ApplicationService {

    ApplicationResponse applyForJob(
            Long jobId,
            Long candidateId,
            ApplicationRequest request
    );

    List<ApplicationResponse> getCandidateApplications(
            Long candidateId
    );

    ApplicationResponse getCandidateApplication(
            Long applicationId,
            Long candidateId
    );

    void withdrawApplication(
            Long applicationId,
            Long candidateId
    );

    List<ApplicationResponse> getJobApplications(
            Long jobId,
            Long recruiterId
    );

    ApplicationResponse updateApplicationStatus(
            Long applicationId,
            Long recruiterId,
            ApplicationStatus status
    );
    List<ApplicationStatusHistoryResponse> getApplicationStatusHistory(
            Long applicationId,
            Long userId
    );
    
    List<RecruiterApplicationResponse>
    getApplicationsForJob(
            Long jobId,
            Long recruiterId
    );
}