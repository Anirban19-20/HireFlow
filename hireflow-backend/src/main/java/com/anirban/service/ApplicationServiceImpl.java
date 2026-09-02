package com.anirban.service;

import com.anirban.dto.ApplicationRequest;
import com.anirban.dto.ApplicationResponse;
import com.anirban.dto.ApplicationStatusHistoryResponse;
import com.anirban.dto.RecruiterApplicationResponse;

import com.anirban.entity.Application;
import com.anirban.entity.ApplicationStatus;
import com.anirban.entity.ApplicationStatusHistory;
import com.anirban.entity.CandidateProfile;
import com.anirban.entity.Job;
import com.anirban.entity.JobStatus;
import com.anirban.entity.RecruiterProfile;
import com.anirban.entity.Role;
import com.anirban.entity.User;

import com.anirban.repository.ApplicationRepository;
import com.anirban.repository.ApplicationStatusHistoryRepository;
import com.anirban.repository.CandidateProfileRepository;
import com.anirban.repository.JobRepository;
import com.anirban.repository.RecruiterProfileRepository;
import com.anirban.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicationServiceImpl
        implements ApplicationService {

    private final ApplicationStatusHistoryRepository
            statusHistoryRepository;

    private final ApplicationRepository
            applicationRepository;

    private final JobRepository
            jobRepository;

    private final UserRepository
            userRepository;

    private final CandidateProfileRepository
            candidateProfileRepository;

    private final RecruiterProfileRepository
            recruiterProfileRepository;

    private final NotificationService
            notificationService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ApplicationServiceImpl(
            ApplicationRepository applicationRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            ApplicationStatusHistoryRepository statusHistoryRepository,
            CandidateProfileRepository candidateProfileRepository,
            RecruiterProfileRepository recruiterProfileRepository,
            NotificationService notificationService) {

        this.applicationRepository =
                applicationRepository;

        this.jobRepository =
                jobRepository;

        this.userRepository =
                userRepository;

        this.statusHistoryRepository =
                statusHistoryRepository;

        this.candidateProfileRepository =
                candidateProfileRepository;

        this.recruiterProfileRepository =
                recruiterProfileRepository;

        this.notificationService =
                notificationService;
    }


    // =====================================================
    // CANDIDATE - APPLY FOR JOB
    // =====================================================

    @Override
    @Transactional
    public ApplicationResponse applyForJob(
            Long jobId,
            Long candidateId,
            ApplicationRequest request) {

        // =================================================
        // VALIDATE CANDIDATE
        // =================================================

        User candidate =
                getCandidate(
                        candidateId
                );


        // =================================================
        // FIND CANDIDATE PROFILE
        // =================================================

        CandidateProfile candidateProfile =
                candidateProfileRepository
                        .findByUserId(
                                candidateId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Candidate profile not found"
                                        )
                        );


        // =================================================
        // REQUIRE RESUME
        // =================================================

        if (candidateProfile.getResumeUrl() == null ||
                candidateProfile
                        .getResumeUrl()
                        .isBlank()) {

            throw new RuntimeException(
                    "Please upload your resume before applying"
            );
        }


        // =================================================
        // FIND JOB
        // =================================================

        Job job =
                jobRepository
                        .findById(
                                jobId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job not found"
                                        )
                        );


        // =================================================
        // JOB MUST BE OPEN
        // =================================================

        if (job.getStatus() !=
                JobStatus.OPEN) {

            throw new RuntimeException(
                    "This job is not open for applications"
            );
        }


        // =================================================
        // PREVENT DUPLICATE APPLICATION
        // =================================================

        if (applicationRepository
                .existsByJobIdAndCandidateId(
                        jobId,
                        candidateId
                )) {

            throw new RuntimeException(
                    "You have already applied for this job"
            );
        }


        // =================================================
        // CREATE APPLICATION
        // =================================================

        Application application =
                new Application();

        application.setJob(
                job
        );

        application.setCandidate(
                candidate
        );


        // =================================================
        // STORE RESUME USED AT APPLICATION TIME
        // =================================================

        application.setResumeUrl(
                candidateProfile.getResumeUrl()
        );


        // =================================================
        // COVER LETTER
        // =================================================

        if (request != null &&
                request.getCoverLetter() != null &&
                !request
                        .getCoverLetter()
                        .isBlank()) {

            application.setCoverLetter(
                    request
                            .getCoverLetter()
                            .trim()
            );

        } else {

            application.setCoverLetter(
                    null
            );
        }


        // =================================================
        // INITIAL STATUS
        // =================================================

        application.setStatus(
                ApplicationStatus.APPLIED
        );


        // =================================================
        // SAVE APPLICATION
        // =================================================

        Application savedApplication =
                applicationRepository.save(
                        application
                );


        // =================================================
        // CREATE INITIAL STATUS HISTORY
        // =================================================

        ApplicationStatusHistory history =
                new ApplicationStatusHistory();

        history.setApplication(
                savedApplication
        );

        history.setOldStatus(
                null
        );

        history.setNewStatus(
                ApplicationStatus.APPLIED
        );

        history.setChangedBy(
                candidate
        );

        statusHistoryRepository.save(
                history
        );


        // =================================================
        // NOTIFY RECRUITER ABOUT NEW APPLICATION
        // =================================================

        notificationService
                .createNewApplicationNotification(
                        savedApplication
                );


        return convertToResponse(
                savedApplication
        );
    }


    // =====================================================
    // CANDIDATE - GET ALL APPLICATIONS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse>
    getCandidateApplications(
            Long candidateId) {

        getCandidate(
                candidateId
        );

        return applicationRepository
                .findByCandidateIdOrderByAppliedAtDesc(
                        candidateId
                )
                .stream()
                .map(
                        this::convertToResponse
                )
                .toList();
    }


    // =====================================================
    // CANDIDATE - GET SINGLE APPLICATION
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse
    getCandidateApplication(
            Long applicationId,
            Long candidateId) {

        getCandidate(
                candidateId
        );

        Application application =
                applicationRepository
                        .findByIdAndCandidateId(
                                applicationId,
                                candidateId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Application not found"
                                        )
                        );

        return convertToResponse(
                application
        );
    }


    // =====================================================
    // CANDIDATE - WITHDRAW APPLICATION
    // =====================================================

    @Override
    @Transactional
    public void withdrawApplication(
            Long applicationId,
            Long candidateId) {

        User candidate =
                getCandidate(
                        candidateId
                );

        Application application =
                applicationRepository
                        .findByIdAndCandidateId(
                                applicationId,
                                candidateId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Application not found"
                                        )
                        );

        ApplicationStatus currentStatus =
                application.getStatus();


        // =================================================
        // CURRENT STATUS REQUIRED
        // =================================================

        if (currentStatus == null) {

            throw new RuntimeException(
                    "Current application status is missing"
            );
        }


        // =================================================
        // SELECTED CANNOT BE WITHDRAWN
        // =================================================

        if (currentStatus ==
                ApplicationStatus.SELECTED) {

            throw new RuntimeException(
                    "Selected application cannot be withdrawn"
            );
        }


        // =================================================
        // REJECTED CANNOT BE WITHDRAWN
        // =================================================

        if (currentStatus ==
                ApplicationStatus.REJECTED) {

            throw new RuntimeException(
                    "Rejected application cannot be withdrawn"
            );
        }


        // =================================================
        // ALREADY WITHDRAWN
        // =================================================

        if (currentStatus ==
                ApplicationStatus.WITHDRAWN) {

            throw new RuntimeException(
                    "Application is already withdrawn"
            );
        }


        ApplicationStatus oldStatus =
                currentStatus;


        // =================================================
        // WITHDRAW
        // =================================================

        application.setStatus(
                ApplicationStatus.WITHDRAWN
        );

        Application savedApplication =
                applicationRepository.save(
                        application
                );


        // =================================================
        // RECORD HISTORY
        // =================================================

        ApplicationStatusHistory history =
                new ApplicationStatusHistory();

        history.setApplication(
                savedApplication
        );

        history.setOldStatus(
                oldStatus
        );

        history.setNewStatus(
                ApplicationStatus.WITHDRAWN
        );

        history.setChangedBy(
                candidate
        );

        statusHistoryRepository.save(
                history
        );


        // =================================================
        // NOTIFY RECRUITER
        // =================================================

        notificationService
                .createApplicationWithdrawnNotification(
                        savedApplication
                );
    }


    // =====================================================
    // RECRUITER - GET JOB APPLICATIONS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse>
    getJobApplications(
            Long jobId,
            Long recruiterId) {

        getRecruiter(
                recruiterId
        );

        Job job =
                jobRepository
                        .findByIdAndRecruiterId(
                                jobId,
                                recruiterId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job not found or access denied"
                                        )
                        );

        return applicationRepository
                .findByJobIdOrderByAppliedAtDesc(
                        job.getId()
                )
                .stream()
                .map(
                        this::convertToResponse
                )
                .toList();
    }


    // =====================================================
    // RECRUITER - UPDATE APPLICATION STATUS
    // =====================================================

    @Override
    @Transactional
    public ApplicationResponse
    updateApplicationStatus(
            Long applicationId,
            Long recruiterId,
            ApplicationStatus status) {

        User recruiter =
                getRecruiter(
                        recruiterId
                );


        // =================================================
        // FIND APPLICATION
        // =================================================

        Application application =
                applicationRepository
                        .findById(
                                applicationId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Application not found"
                                        )
                        );


        // =================================================
        // VERIFY RECRUITER OWNS JOB
        // =================================================

        Job job =
                application.getJob();

        if (job == null ||
                job.getRecruiter() == null ||
                !job
                        .getRecruiter()
                        .getId()
                        .equals(
                                recruiterId
                        )) {

            throw new RuntimeException(
                    "You are not authorized to update this application"
            );
        }


        // =================================================
        // STATUS REQUIRED
        // =================================================

        if (status == null) {

            throw new RuntimeException(
                    "Application status is required"
            );
        }


        ApplicationStatus oldStatus =
                application.getStatus();


        // =================================================
        // CURRENT STATUS REQUIRED
        // =================================================

        if (oldStatus == null) {

            throw new RuntimeException(
                    "Current application status is missing"
            );
        }


        // =================================================
        // SAME STATUS
        // =================================================

        if (oldStatus ==
                status) {

            throw new RuntimeException(
                    "Application already has this status"
            );
        }


        // =================================================
        // RECRUITER CANNOT WITHDRAW
        // =================================================

        if (status ==
                ApplicationStatus.WITHDRAWN) {

            throw new RuntimeException(
                    "Only candidates can withdraw applications"
            );
        }


        // =================================================
        // VALIDATE WORKFLOW
        // =================================================

        validateStatusTransition(
                oldStatus,
                status
        );


        // =================================================
        // UPDATE STATUS
        // =================================================

        application.setStatus(
                status
        );

        Application savedApplication =
                applicationRepository.save(
                        application
                );


        // =================================================
        // SAVE STATUS HISTORY
        // =================================================

        ApplicationStatusHistory history =
                new ApplicationStatusHistory();

        history.setApplication(
                savedApplication
        );

        history.setOldStatus(
                oldStatus
        );

        history.setNewStatus(
                status
        );

        history.setChangedBy(
                recruiter
        );

        statusHistoryRepository.save(
                history
        );


        // =================================================
        // NOTIFY CANDIDATE
        // =================================================

        notificationService
                .createApplicationStatusNotification(
                        savedApplication,
                        status
                );


        return convertToResponse(
                savedApplication
        );
    }


    // =====================================================
    // VALIDATE APPLICATION STATUS TRANSITION
    // =====================================================

    private void validateStatusTransition(
            ApplicationStatus currentStatus,
            ApplicationStatus newStatus) {

        if (currentStatus == null) {

            throw new RuntimeException(
                    "Current application status is missing"
            );
        }

        if (newStatus == null) {

            throw new RuntimeException(
                    "New application status is required"
            );
        }


        boolean allowed =
                switch (currentStatus) {

                    case APPLIED ->

                            newStatus ==
                                    ApplicationStatus.UNDER_REVIEW
                            ||
                            newStatus ==
                                    ApplicationStatus.REJECTED;


                    case UNDER_REVIEW ->

                            newStatus ==
                                    ApplicationStatus.SHORTLISTED
                            ||
                            newStatus ==
                                    ApplicationStatus.REJECTED;


                    case SHORTLISTED ->

                            newStatus ==
                                    ApplicationStatus.INTERVIEW
                            ||
                            newStatus ==
                                    ApplicationStatus.REJECTED;


                    case INTERVIEW ->

                            newStatus ==
                                    ApplicationStatus.SELECTED
                            ||
                            newStatus ==
                                    ApplicationStatus.REJECTED;


                    case SELECTED,
                         REJECTED,
                         WITHDRAWN -> false;
                };


        if (!allowed) {

            throw new RuntimeException(
                    "Invalid application status transition from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }
    }


    // =====================================================
    // APPLICATION STATUS HISTORY
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationStatusHistoryResponse>
    getApplicationStatusHistory(
            Long applicationId,
            Long userId) {

        // =================================================
        // FIND APPLICATION
        // =================================================

        Application application =
                applicationRepository
                        .findById(
                                applicationId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Application not found"
                                        )
                        );


        // =================================================
        // CHECK CANDIDATE ACCESS
        // =================================================

        boolean isCandidate =
                application.getCandidate() != null
                        &&
                        application
                                .getCandidate()
                                .getId()
                                .equals(
                                        userId
                                );


        // =================================================
        // CHECK RECRUITER ACCESS
        // =================================================

        boolean isRecruiter =
                application.getJob() != null
                        &&
                        application
                                .getJob()
                                .getRecruiter() != null
                        &&
                        application
                                .getJob()
                                .getRecruiter()
                                .getId()
                                .equals(
                                        userId
                                );


        // =================================================
        // ACCESS CHECK
        // =================================================

        if (!isCandidate &&
                !isRecruiter) {

            throw new RuntimeException(
                    "You are not authorized to view this history"
            );
        }


        // =================================================
        // RETURN STATUS HISTORY
        // =================================================

        return statusHistoryRepository
                .findByApplicationIdOrderByChangedAtAsc(
                        applicationId
                )
                .stream()
                .map(
                        history -> {

                            ApplicationStatusHistoryResponse response =
                                    new ApplicationStatusHistoryResponse();

                            response.setId(
                                    history.getId()
                            );

                            response.setApplicationId(
                                    history
                                            .getApplication()
                                            .getId()
                            );

                            response.setOldStatus(
                                    history.getOldStatus()
                            );

                            response.setNewStatus(
                                    history.getNewStatus()
                            );

                            response.setChangedAt(
                                    history.getChangedAt()
                            );


                            // =====================================
                            // CHANGED BY
                            // =====================================

                            if (history.getChangedBy() !=
                                    null) {

                                User changedBy =
                                        history.getChangedBy();

                                response.setChangedById(
                                        changedBy.getId()
                                );

                                response.setChangedByName(
                                        changedBy.getName()
                                );

                                if (changedBy.getRole() !=
                                        null) {

                                    response.setChangedByRole(
                                            changedBy
                                                    .getRole()
                                                    .name()
                                    );
                                }
                            }

                            return response;
                        }
                )
                .toList();
    }


    // =====================================================
    // RECRUITER - DETAILED APPLICATIONS FOR JOB
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<RecruiterApplicationResponse>
    getApplicationsForJob(
            Long jobId,
            Long recruiterId) {

        // =================================================
        // VALIDATE RECRUITER
        // =================================================

        getRecruiter(
                recruiterId
        );


        // =================================================
        // FIND JOB OWNED BY RECRUITER
        // =================================================

        Job job =
                jobRepository
                        .findByIdAndRecruiterId(
                                jobId,
                                recruiterId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job not found or you are not authorized to view its applications"
                                        )
                        );


        // =================================================
        // GET APPLICATIONS
        // =================================================

        List<Application> applications =
                applicationRepository
                        .findByJobIdOrderByAppliedAtDesc(
                                jobId
                        );


        // =================================================
        // CONVERT TO DETAILED RECRUITER RESPONSE
        // =================================================

        return applications
                .stream()
                .map(
                        application -> {

                            RecruiterApplicationResponse response =
                                    new RecruiterApplicationResponse();


                            // =====================================
                            // APPLICATION
                            // =====================================

                            response.setApplicationId(
                                    application.getId()
                            );


                            // =====================================
                            // JOB
                            // =====================================

                            response.setJobId(
                                    job.getId()
                            );

                            response.setJobTitle(
                                    job.getTitle()
                            );


                            // =====================================
                            // CANDIDATE ACCOUNT
                            // =====================================

                            User candidate =
                                    application.getCandidate();

                            CandidateProfile candidateProfile =
                                    null;


                            if (candidate != null) {

                                response.setCandidateId(
                                        candidate.getId()
                                );

                                response.setCandidateName(
                                        candidate.getName()
                                );

                                response.setCandidateEmail(
                                        candidate.getEmail()
                                );


                                // =================================
                                // CANDIDATE PROFILE
                                // =================================

                                candidateProfile =
                                        candidateProfileRepository
                                                .findByUserId(
                                                        candidate.getId()
                                                )
                                                .orElse(
                                                        null
                                                );


                                if (candidateProfile != null) {

                                    response.setCandidatePhone(
                                            candidateProfile
                                                    .getPhone()
                                    );

                                    response.setCandidateLocation(
                                            candidateProfile
                                                    .getLocation()
                                    );

                                    response.setCandidateSkills(
                                            candidateProfile
                                                    .getSkills()
                                    );

                                    response.setCandidateExperience(
                                            candidateProfile
                                                    .getExperience()
                                    );

                                    response.setCandidateEducation(
                                            candidateProfile
                                                    .getEducation()
                                    );
                                }
                            }


                            // =====================================
                            // RESUME
                            // Prefer the candidate's current profile
                            // resume. Fall back to the resume snapshot
                            // stored when the application was created.
                            // =====================================

                            response.setResumeUrl(
                                    resolveResumeUrl(
                                            candidateProfile,
                                            application.getResumeUrl()
                                    )
                            );


                            // =====================================
                            // COVER LETTER
                            // =====================================

                            response.setCoverLetter(
                                    application
                                            .getCoverLetter()
                            );


                            // =====================================
                            // STATUS
                            // =====================================

                            response.setStatus(
                                    application
                                            .getStatus()
                            );


                            // =====================================
                            // APPLIED DATE
                            // =====================================

                            response.setAppliedAt(
                                    application
                                            .getAppliedAt()
                            );


                            return response;
                        }
                )
                .toList();
    }


    // =====================================================
    // VALIDATE CANDIDATE
    // =====================================================

    private User getCandidate(
            Long candidateId) {

        if (candidateId == null) {

            throw new RuntimeException(
                    "Candidate ID is required"
            );
        }

        User candidate =
                userRepository
                        .findById(
                                candidateId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Candidate not found"
                                        )
                        );

        if (candidate.getRole() !=
                Role.CANDIDATE) {

            throw new RuntimeException(
                    "Only candidates can perform this action"
            );
        }

        return candidate;
    }


    // =====================================================
    // VALIDATE RECRUITER
    // =====================================================

    private User getRecruiter(
            Long recruiterId) {

        if (recruiterId == null) {

            throw new RuntimeException(
                    "Recruiter ID is required"
            );
        }

        User recruiter =
                userRepository
                        .findById(
                                recruiterId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Recruiter not found"
                                        )
                        );

        if (recruiter.getRole() !=
                Role.RECRUITER) {

            throw new RuntimeException(
                    "Only recruiters can perform this action"
            );
        }

        return recruiter;
    }


    // =====================================================
    // GET COMPANY NAME
    // =====================================================

    private String getCompanyName(
            Job job) {

        if (job == null) {

            return "Company";
        }

        User recruiter =
                job.getRecruiter();

        if (recruiter == null) {

            return "Company";
        }

        RecruiterProfile recruiterProfile =
                recruiterProfileRepository
                        .findByUserId(
                                recruiter.getId()
                        )
                        .orElse(
                                null
                        );

        if (recruiterProfile == null) {

            return "Company";
        }

        String companyName =
                recruiterProfile
                        .getCompanyName();

        if (companyName == null ||
                companyName.isBlank()) {

            return "Company";
        }

        return companyName.trim();
    }


    // =====================================================
    // RESOLVE RESUME URL
    // =====================================================

    private String resolveResumeUrl(
            CandidateProfile candidateProfile,
            String applicationResumeUrl) {

        /*
         * Prefer the candidate's latest resume from the
         * candidate profile.
         *
         * This fixes older applications that may still have
         * a placeholder or outdated application-time URL.
         */
        if (candidateProfile != null &&
                candidateProfile.getResumeUrl() != null &&
                !candidateProfile
                        .getResumeUrl()
                        .isBlank()) {

            return candidateProfile
                    .getResumeUrl()
                    .trim();
        }


        /*
         * Fallback:
         * If no current profile resume exists, use the resume
         * snapshot that was stored when the candidate applied.
         */
        if (applicationResumeUrl != null &&
                !applicationResumeUrl.isBlank()) {

            return applicationResumeUrl.trim();
        }


        return null;
    }


    // =====================================================
    // APPLICATION ENTITY -> DTO
    // =====================================================

    private ApplicationResponse convertToResponse(
            Application application) {

        // =================================================
        // VALIDATE APPLICATION
        // =================================================

        if (application == null) {

            throw new RuntimeException(
                    "Application cannot be null"
            );
        }


        // =================================================
        // JOB
        // =================================================

        Job job =
                application.getJob();

        if (job == null) {

            throw new RuntimeException(
                    "Application job information is missing"
            );
        }


        // =================================================
        // CANDIDATE
        // =================================================

        User candidate =
                application.getCandidate();

        if (candidate == null) {

            throw new RuntimeException(
                    "Application candidate information is missing"
            );
        }


        // =================================================
        // CURRENT CANDIDATE PROFILE
        // =================================================

        CandidateProfile candidateProfile =
                candidateProfileRepository
                        .findByUserId(
                                candidate.getId()
                        )
                        .orElse(
                                null
                        );


        // =================================================
        // RESPONSE
        // =================================================

        ApplicationResponse response =
                new ApplicationResponse();


        // =================================================
        // APPLICATION ID
        // =================================================

        response.setId(
                application.getId()
        );


        // =================================================
        // STATUS
        // =================================================

        response.setStatus(
                application.getStatus()
        );


        // =================================================
        // APPLIED DATE
        // =================================================

        response.setAppliedAt(
                application.getAppliedAt()
        );


        // =================================================
        // RESUME
        //
        // Use latest candidate profile resume first.
        // If unavailable, use application-time resume.
        // =================================================

        response.setResumeUrl(
                resolveResumeUrl(
                        candidateProfile,
                        application.getResumeUrl()
                )
        );


        // =================================================
        // COVER LETTER
        // =================================================

        response.setCoverLetter(
                application.getCoverLetter()
        );


        // =================================================
        // JOB
        // =================================================

        response.setJobId(
                job.getId()
        );

        response.setJobTitle(
                job.getTitle()
        );


        // =================================================
        // COMPANY
        // =================================================

        response.setCompanyName(
                getCompanyName(
                        job
                )
        );


        // =================================================
        // CANDIDATE
        // =================================================

        response.setCandidateId(
                candidate.getId()
        );

        response.setCandidateName(
                candidate.getName()
        );

        response.setCandidateEmail(
                candidate.getEmail()
        );


        return response;
    }
}