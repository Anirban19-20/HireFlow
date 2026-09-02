package com.anirban.service;

import com.anirban.dto.InterviewRequest;
import com.anirban.dto.InterviewResponse;

import com.anirban.entity.Application;
import com.anirban.entity.ApplicationStatus;
import com.anirban.entity.Interview;
import com.anirban.entity.InterviewMode;
import com.anirban.entity.InterviewStatus;
import com.anirban.entity.Job;
import com.anirban.entity.Role;
import com.anirban.entity.User;

import com.anirban.repository.ApplicationRepository;
import com.anirban.repository.InterviewRepository;
import com.anirban.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import java.util.List;
import java.util.Objects;

@Service
public class InterviewServiceImpl
        implements InterviewService {

    private final InterviewRepository
            interviewRepository;

    private final ApplicationRepository
            applicationRepository;

    private final UserRepository
            userRepository;

    private final NotificationService
            notificationService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public InterviewServiceImpl(
            InterviewRepository interviewRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.interviewRepository =
                interviewRepository;

        this.applicationRepository =
                applicationRepository;

        this.userRepository =
                userRepository;

        this.notificationService =
                notificationService;
    }

    // =====================================================
    // RECRUITER - SCHEDULE INTERVIEW
    // =====================================================

    @Override
    @Transactional
    public InterviewResponse scheduleInterview(
            Long recruiterId,
            Long applicationId,
            InterviewRequest request) {

        getRecruiter(
                recruiterId
        );

        // =================================================
        // APPLICATION
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
        // OWNERSHIP
        // =================================================

        validateRecruiterOwnership(
                application,
                recruiterId
        );

        // =================================================
        // APPLICATION STATUS
        // =================================================

        if (
                application.getStatus() !=
                ApplicationStatus.INTERVIEW
        ) {

            throw new RuntimeException(
                    "Application must be in INTERVIEW status before scheduling an interview"
            );
        }

        // =================================================
        // REQUEST
        // =================================================

        validateRequest(
                request
        );

        // =================================================
        // EXISTING ROUNDS
        // =================================================

        List<Interview> existingRounds =
                interviewRepository
                        .findByApplicationIdOrderByRoundNumberAscScheduledAtAsc(
                                applicationId
                        );

        // =================================================
        // PREVENT TWO ACTIVE ROUNDS
        // =================================================

        boolean hasScheduledRound =
                existingRounds
                        .stream()
                        .anyMatch(
                                interview ->
                                        interview.getStatus() ==
                                                InterviewStatus.SCHEDULED
                        );

        if (hasScheduledRound) {

            throw new RuntimeException(
                    "Complete or cancel the currently scheduled interview before scheduling the next round"
            );
        }

        // =================================================
        // NEXT ROUND NUMBER
        // =================================================

        int nextRoundNumber =
                existingRounds
                        .stream()
                        .map(
                                Interview::getRoundNumber
                        )
                        .filter(
                                Objects::nonNull
                        )
                        .max(
                                Integer::compareTo
                        )
                        .orElse(
                                0
                        )
                        + 1;

        // =================================================
        // ROUND NAME
        // =================================================

        String roundName =
                normalize(
                        request.getRoundName()
                );

        if (roundName == null) {

            roundName =
                    "Interview Round "
                            + nextRoundNumber;
        }

        validateRoundName(
                roundName
        );

        // =================================================
        // CREATE
        // =================================================

        Interview interview =
                new Interview();

        interview.setApplication(
                application
        );

        interview.setRoundNumber(
                nextRoundNumber
        );

        interview.setRoundName(
                roundName
        );

        applyRequest(
                interview,
                request
        );

        interview.setStatus(
                InterviewStatus.SCHEDULED
        );

        Interview savedInterview =
                interviewRepository.save(
                        interview
                );

        // =================================================
        // NOTIFICATION
        // =================================================

        notificationService
                .createInterviewScheduledNotification(
                        savedInterview
                );

        return convertToResponse(
                savedInterview
        );
    }

    // =====================================================
    // RECRUITER - UPDATE / RESCHEDULE
    // =====================================================

    @Override
    @Transactional
    public InterviewResponse updateInterview(
            Long recruiterId,
            Long interviewId,
            InterviewRequest request) {

        getRecruiter(
                recruiterId
        );

        Interview interview =
                getRecruiterInterview(
                        interviewId,
                        recruiterId
                );

        // =================================================
        // STATUS
        // =================================================

        if (
                interview.getStatus() ==
                InterviewStatus.CANCELLED
        ) {

            throw new RuntimeException(
                    "Cancelled interview cannot be updated"
            );
        }

        if (
                interview.getStatus() ==
                InterviewStatus.COMPLETED
        ) {

            throw new RuntimeException(
                    "Completed interview cannot be updated"
            );
        }

        validateRequest(
                request
        );

        // =================================================
        // DETECT SCHEDULE CHANGE
        // =================================================

        boolean schedulingChanged =
                hasSchedulingChanged(
                        interview,
                        request
                );

        // =================================================
        // OPTIONAL ROUND NAME UPDATE
        // =================================================

        String requestedRoundName =
                normalize(
                        request.getRoundName()
                );

        if (requestedRoundName != null) {

            validateRoundName(
                    requestedRoundName
            );

            interview.setRoundName(
                    requestedRoundName
            );
        }

        // =================================================
        // UPDATE
        // =================================================

        applyRequest(
                interview,
                request
        );

        Interview savedInterview =
                interviewRepository.save(
                        interview
                );

        // =================================================
        // RESCHEDULE NOTIFICATION
        // =================================================

        if (schedulingChanged) {

            notificationService
                    .createInterviewRescheduledNotification(
                            savedInterview
                    );
        }

        return convertToResponse(
                savedInterview
        );
    }

    // =====================================================
    // RECRUITER - CANCEL
    // =====================================================

    @Override
    @Transactional
    public InterviewResponse cancelInterview(
            Long recruiterId,
            Long interviewId) {

        getRecruiter(
                recruiterId
        );

        Interview interview =
                getRecruiterInterview(
                        interviewId,
                        recruiterId
                );

        if (
                interview.getStatus() ==
                InterviewStatus.CANCELLED
        ) {

            throw new RuntimeException(
                    "Interview is already cancelled"
            );
        }

        if (
                interview.getStatus() ==
                InterviewStatus.COMPLETED
        ) {

            throw new RuntimeException(
                    "Completed interview cannot be cancelled"
            );
        }

        interview.setStatus(
                InterviewStatus.CANCELLED
        );

        Interview savedInterview =
                interviewRepository.save(
                        interview
                );

        notificationService
                .createInterviewCancelledNotification(
                        savedInterview
                );

        return convertToResponse(
                savedInterview
        );
    }

    // =====================================================
    // RECRUITER - COMPLETE
    // =====================================================

    @Override
    @Transactional
    public InterviewResponse completeInterview(
            Long recruiterId,
            Long interviewId) {

        getRecruiter(
                recruiterId
        );

        Interview interview =
                getRecruiterInterview(
                        interviewId,
                        recruiterId
                );

        if (
                interview.getStatus() ==
                InterviewStatus.CANCELLED
        ) {

            throw new RuntimeException(
                    "Cancelled interview cannot be completed"
            );
        }

        if (
                interview.getStatus() ==
                InterviewStatus.COMPLETED
        ) {

            throw new RuntimeException(
                    "Interview is already completed"
            );
        }

        interview.setStatus(
                InterviewStatus.COMPLETED
        );

        Interview savedInterview =
                interviewRepository.save(
                        interview
                );

        notificationService
                .createInterviewCompletedNotification(
                        savedInterview
                );

        return convertToResponse(
                savedInterview
        );
    }

    // =====================================================
    // RECRUITER - GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse>
    getRecruiterInterviews(
            Long recruiterId) {

        getRecruiter(
                recruiterId
        );

        return interviewRepository
                .findByApplicationJobRecruiterIdOrderByScheduledAtAsc(
                        recruiterId
                )
                .stream()
                .map(
                        this::convertToResponse
                )
                .toList();
    }
    
	 // =====================================================
	 // RECRUITER - GET INTERVIEW ROUNDS FOR APPLICATION
	 // =====================================================
	
	 @Override
	 @Transactional(readOnly = true)
	 public List<InterviewResponse>
	 getRecruiterApplicationInterviews(
	         Long recruiterId,
	         Long applicationId) {
	
	     // =================================================
	     // VALIDATE RECRUITER
	     // =================================================
	
	     getRecruiter(
	             recruiterId
	     );
	
	     // =================================================
	     // VALIDATE APPLICATION ID
	     // =================================================
	
	     if (applicationId == null) {
	
	         throw new RuntimeException(
	                 "Application ID is required"
	         );
	     }
	
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
	
	     validateRecruiterOwnership(
	             application,
	             recruiterId
	     );
	
	     // =================================================
	     // LOAD ALL ROUNDS
	     // =================================================
	
	     return interviewRepository
	             .findByApplicationIdOrderByRoundNumberAscScheduledAtAsc(
	                     applicationId
	             )
	             .stream()
	             .map(
	                     this::convertToResponse
	             )
	             .toList();
	 }

    // =====================================================
    // CANDIDATE - GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse>
    getCandidateInterviews(
            Long candidateId) {

        getCandidate(
                candidateId
        );

        return interviewRepository
                .findByApplicationCandidateIdOrderByScheduledAtAsc(
                        candidateId
                )
                .stream()
                .map(
                        this::convertToResponse
                )
                .toList();
    }

    // =====================================================
    // CANDIDATE - GET ONE
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public InterviewResponse getCandidateInterview(
            Long candidateId,
            Long interviewId) {

        getCandidate(
                candidateId
        );

        Interview interview =
                interviewRepository
                        .findByIdAndApplicationCandidateId(
                                interviewId,
                                candidateId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Interview not found"
                                        )
                        );

        return convertToResponse(
                interview
        );
    }

    // =====================================================
    // APPLY REQUEST
    // =====================================================

    private void applyRequest(
            Interview interview,
            InterviewRequest request) {

        interview.setScheduledAt(
                request.getScheduledAt()
        );

        interview.setMode(
                request.getMode()
        );

        interview.setNotes(
                normalize(
                        request.getNotes()
                )
        );

        // =================================================
        // ONLINE
        // =================================================

        if (
                request.getMode() ==
                InterviewMode.ONLINE
        ) {

            interview.setMeetingLink(
                    normalize(
                            request.getMeetingLink()
                    )
            );

            interview.setLocation(
                    null
            );

        } else {

            // =================================================
            // OFFLINE
            // =================================================

            interview.setLocation(
                    normalize(
                            request.getLocation()
                    )
            );

            interview.setMeetingLink(
                    null
            );
        }
    }

    // =====================================================
    // DETECT RESCHEDULE
    // =====================================================

    private boolean hasSchedulingChanged(
            Interview interview,
            InterviewRequest request) {

        if (
                !Objects.equals(
                        interview.getScheduledAt(),
                        request.getScheduledAt()
                )
        ) {

            return true;
        }

        if (
                interview.getMode() !=
                request.getMode()
        ) {

            return true;
        }

        // =================================================
        // COMPARE EFFECTIVE MEETING LINK
        // =================================================

        String currentMeetingLink =
                interview.getMode() ==
                        InterviewMode.ONLINE

                        ? normalize(
                                interview.getMeetingLink()
                        )

                        : null;

        String requestedMeetingLink =
                request.getMode() ==
                        InterviewMode.ONLINE

                        ? normalize(
                                request.getMeetingLink()
                        )

                        : null;

        if (
                !Objects.equals(
                        currentMeetingLink,
                        requestedMeetingLink
                )
        ) {

            return true;
        }

        // =================================================
        // COMPARE EFFECTIVE LOCATION
        // =================================================

        String currentLocation =
                interview.getMode() ==
                        InterviewMode.OFFLINE

                        ? normalize(
                                interview.getLocation()
                        )

                        : null;

        String requestedLocation =
                request.getMode() ==
                        InterviewMode.OFFLINE

                        ? normalize(
                                request.getLocation()
                        )

                        : null;

        return !Objects.equals(
                currentLocation,
                requestedLocation
        );
    }

    // =====================================================
    // VALIDATE REQUEST
    // =====================================================

    private void validateRequest(
            InterviewRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Interview request is required"
            );
        }

        if (
                request.getScheduledAt() ==
                null
        ) {

            throw new RuntimeException(
                    "Interview date and time are required"
            );
        }

        if (
                !request
                        .getScheduledAt()
                        .isAfter(
                                LocalDateTime.now()
                        )
        ) {

            throw new RuntimeException(
                    "Interview date and time must be in the future"
            );
        }

        if (
                request.getMode() ==
                null
        ) {

            throw new RuntimeException(
                    "Interview mode is required"
            );
        }

        // =================================================
        // OPTIONAL ROUND NAME VALIDATION
        // =================================================

        String roundName =
                normalize(
                        request.getRoundName()
                );

        if (roundName != null) {

            validateRoundName(
                    roundName
            );
        }

        // =================================================
        // ONLINE
        // =================================================

        if (
                request.getMode() ==
                InterviewMode.ONLINE
        ) {

            if (
                    request.getMeetingLink() ==
                    null ||
                    request
                            .getMeetingLink()
                            .isBlank()
            ) {

                throw new RuntimeException(
                        "Meeting link is required for online interviews"
                );
            }

            validateMeetingLink(
                    request.getMeetingLink()
            );
        }

        // =================================================
        // OFFLINE
        // =================================================

        if (
                request.getMode() ==
                InterviewMode.OFFLINE
        ) {

            if (
                    request.getLocation() ==
                    null ||
                    request
                            .getLocation()
                            .isBlank()
            ) {

                throw new RuntimeException(
                        "Interview location is required for offline interviews"
                );
            }
        }
    }

    // =====================================================
    // VALIDATE ROUND NAME
    // =====================================================

    private void validateRoundName(
            String roundName) {

        if (roundName == null) {

            return;
        }

        if (
                roundName.length() >
                150
        ) {

            throw new RuntimeException(
                    "Interview round name cannot exceed 150 characters"
            );
        }
    }

    // =====================================================
    // VALIDATE MEETING LINK
    // =====================================================

    private void validateMeetingLink(
            String meetingLink) {

        String value =
                normalize(
                        meetingLink
                );

        if (value == null) {

            throw new RuntimeException(
                    "Meeting link is required for online interviews"
            );
        }

        if (
                !value.startsWith(
                        "http://"
                ) &&
                !value.startsWith(
                        "https://"
                )
        ) {

            throw new RuntimeException(
                    "Meeting link must start with http:// or https://"
            );
        }
    }

    // =====================================================
    // RECRUITER OWNERSHIP
    // =====================================================

    private void validateRecruiterOwnership(
            Application application,
            Long recruiterId) {

        if (
                application == null ||
                application.getJob() == null ||
                application
                        .getJob()
                        .getRecruiter() == null ||
                !application
                        .getJob()
                        .getRecruiter()
                        .getId()
                        .equals(
                                recruiterId
                        )
        ) {

            throw new RuntimeException(
                    "You are not authorized to manage this interview"
            );
        }
    }

    // =====================================================
    // FIND RECRUITER INTERVIEW
    // =====================================================

    private Interview getRecruiterInterview(
            Long interviewId,
            Long recruiterId) {

        if (interviewId == null) {

            throw new RuntimeException(
                    "Interview ID is required"
            );
        }

        return interviewRepository
                .findByIdAndApplicationJobRecruiterId(
                        interviewId,
                        recruiterId
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Interview not found or access denied"
                                )
                );
    }

    // =====================================================
    // RECRUITER
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

        if (
                recruiter.getRole() !=
                Role.RECRUITER
        ) {

            throw new RuntimeException(
                    "Only recruiters can manage interviews"
            );
        }

        return recruiter;
    }

    // =====================================================
    // CANDIDATE
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

        if (
                candidate.getRole() !=
                Role.CANDIDATE
        ) {

            throw new RuntimeException(
                    "Only candidates can view candidate interviews"
            );
        }

        return candidate;
    }

    // =====================================================
    // NORMALIZE
    // =====================================================

    private String normalize(
            String value) {

        if (
                value == null ||
                value.isBlank()
        ) {

            return null;
        }

        return value.trim();
    }

    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    private InterviewResponse convertToResponse(
            Interview interview) {

        if (interview == null) {

            throw new RuntimeException(
                    "Interview cannot be null"
            );
        }

        InterviewResponse response =
                new InterviewResponse();

        response.setId(
                interview.getId()
        );

        response.setRoundNumber(
                interview.getRoundNumber()
        );

        response.setRoundName(
                interview.getRoundName()
        );

        response.setMode(
                interview.getMode()
        );

        response.setScheduledAt(
                interview.getScheduledAt()
        );

        response.setMeetingLink(
                interview.getMeetingLink()
        );

        response.setLocation(
                interview.getLocation()
        );

        response.setNotes(
                interview.getNotes()
        );

        response.setStatus(
                interview.getStatus()
        );

        response.setCreatedAt(
                interview.getCreatedAt()
        );

        response.setUpdatedAt(
                interview.getUpdatedAt()
        );

        Application application =
                interview.getApplication();

        if (application != null) {

            response.setApplicationId(
                    application.getId()
            );

            // =================================================
            // JOB
            // =================================================

            Job job =
                    application.getJob();

            if (job != null) {

                response.setJobId(
                        job.getId()
                );

                response.setJobTitle(
                        job.getTitle()
                );
            }

            // =================================================
            // CANDIDATE
            // =================================================

            User candidate =
                    application.getCandidate();

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
            }
        }

        return response;
    }
}