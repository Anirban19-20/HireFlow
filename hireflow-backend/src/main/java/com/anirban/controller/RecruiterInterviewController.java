package com.anirban.controller;

import com.anirban.dto.InterviewRequest;
import com.anirban.dto.InterviewResponse;

import com.anirban.entity.User;

import com.anirban.repository.UserRepository;

import com.anirban.service.InterviewService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(
        "/api/recruiter/interviews"
)
@PreAuthorize(
        "hasRole('RECRUITER')"
)
public class RecruiterInterviewController {

    private final InterviewService
            interviewService;

    private final UserRepository
            userRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public RecruiterInterviewController(
            InterviewService interviewService,
            UserRepository userRepository) {

        this.interviewService =
                interviewService;

        this.userRepository =
                userRepository;
    }

    // =====================================================
    // GET AUTHENTICATED RECRUITER
    // =====================================================

    private User getAuthenticatedRecruiter(
            Authentication authentication) {

        if (
                authentication == null ||
                authentication.getName() == null
        ) {

            throw new RuntimeException(
                    "Recruiter authentication is required"
            );
        }

        String email =
                authentication
                        .getName();

        return userRepository
                .findByEmail(
                        email
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Authenticated recruiter not found"
                                )
                );
    }

    // =====================================================
    // SCHEDULE INTERVIEW / NEXT ROUND
    // =====================================================

    @PostMapping(
            "/application/{applicationId}"
    )
    public ResponseEntity<InterviewResponse>
    scheduleInterview(
            @PathVariable
            Long applicationId,

            @RequestBody
            InterviewRequest request,

            Authentication authentication) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        InterviewResponse response =
                interviewService
                        .scheduleInterview(
                                recruiter.getId(),
                                applicationId,
                                request
                        );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        response
                );
    }

    // =====================================================
    // GET ALL ROUNDS FOR ONE APPLICATION
    // =====================================================

    @GetMapping(
            "/application/{applicationId}"
    )
    public ResponseEntity<List<InterviewResponse>>
    getApplicationInterviews(
            @PathVariable
            Long applicationId,

            Authentication authentication) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        List<InterviewResponse> response =
                interviewService
                        .getRecruiterApplicationInterviews(
                                recruiter.getId(),
                                applicationId
                        );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // UPDATE / RESCHEDULE INTERVIEW
    // =====================================================

    @PutMapping(
            "/{interviewId}"
    )
    public ResponseEntity<InterviewResponse>
    updateInterview(
            @PathVariable
            Long interviewId,

            @RequestBody
            InterviewRequest request,

            Authentication authentication) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        InterviewResponse response =
                interviewService
                        .updateInterview(
                                recruiter.getId(),
                                interviewId,
                                request
                        );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // CANCEL INTERVIEW
    // =====================================================

    @PatchMapping(
            "/{interviewId}/cancel"
    )
    public ResponseEntity<InterviewResponse>
    cancelInterview(
            @PathVariable
            Long interviewId,

            Authentication authentication) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        InterviewResponse response =
                interviewService
                        .cancelInterview(
                                recruiter.getId(),
                                interviewId
                        );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // COMPLETE INTERVIEW
    // =====================================================

    @PatchMapping(
            "/{interviewId}/complete"
    )
    public ResponseEntity<InterviewResponse>
    completeInterview(
            @PathVariable
            Long interviewId,

            Authentication authentication) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        InterviewResponse response =
                interviewService
                        .completeInterview(
                                recruiter.getId(),
                                interviewId
                        );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // GET ALL RECRUITER INTERVIEWS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<InterviewResponse>>
    getRecruiterInterviews(
            Authentication authentication) {

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        List<InterviewResponse> response =
                interviewService
                        .getRecruiterInterviews(
                                recruiter.getId()
                        );

        return ResponseEntity.ok(
                response
        );
    }
}