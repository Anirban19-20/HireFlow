package com.anirban.service;

import com.anirban.dto.RecruiterDashboardResponse;
import com.anirban.entity.ApplicationStatus;
import com.anirban.entity.JobStatus;
import com.anirban.repository.ApplicationRepository;
import com.anirban.repository.JobRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecruiterDashboardServiceImpl
        implements RecruiterDashboardService {

    private final JobRepository jobRepository;

    private final ApplicationRepository applicationRepository;

    public RecruiterDashboardServiceImpl(
            JobRepository jobRepository,
            ApplicationRepository applicationRepository) {

        this.jobRepository = jobRepository;
        this.applicationRepository =
                applicationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public RecruiterDashboardResponse getDashboard(
            Long recruiterId) {

        RecruiterDashboardResponse response =
                new RecruiterDashboardResponse();

        // =========================
        // JOBS
        // =========================

        long totalJobs =
                jobRepository.countByRecruiterId(
                        recruiterId
                );

        long openJobs =
                jobRepository.countByRecruiterIdAndStatus(
                        recruiterId,
                        JobStatus.OPEN
                );

        long closedJobs =
                totalJobs - openJobs;

        response.setTotalJobs(totalJobs);
        response.setOpenJobs(openJobs);
        response.setClosedJobs(closedJobs);

        // =========================
        // APPLICATIONS
        // =========================

        long totalApplications =
                applicationRepository
                        .countByJobRecruiterId(
                                recruiterId
                        );

        response.setTotalApplications(
                totalApplications
        );

        response.setAppliedApplications(
                applicationRepository
                        .countByJobRecruiterIdAndStatus(
                                recruiterId,
                                ApplicationStatus.APPLIED
                        )
        );

        response.setUnderReviewApplications(
                applicationRepository
                        .countByJobRecruiterIdAndStatus(
                                recruiterId,
                                ApplicationStatus.UNDER_REVIEW
                        )
        );

        response.setShortlistedApplications(
                applicationRepository
                        .countByJobRecruiterIdAndStatus(
                                recruiterId,
                                ApplicationStatus.SHORTLISTED
                        )
        );

        response.setInterviewApplications(
                applicationRepository
                        .countByJobRecruiterIdAndStatus(
                                recruiterId,
                                ApplicationStatus.INTERVIEW
                        )
        );

        response.setSelectedApplications(
                applicationRepository
                        .countByJobRecruiterIdAndStatus(
                                recruiterId,
                                ApplicationStatus.SELECTED
                        )
        );

        response.setRejectedApplications(
                applicationRepository
                        .countByJobRecruiterIdAndStatus(
                                recruiterId,
                                ApplicationStatus.REJECTED
                        )
        );

        return response;
    }
}