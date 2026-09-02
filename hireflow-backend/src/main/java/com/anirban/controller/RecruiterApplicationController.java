package com.anirban.controller;

import com.anirban.dto.ApplicationResponse;
import com.anirban.dto.RecruiterApplicationResponse;
import com.anirban.entity.ApplicationStatus;
import com.anirban.entity.User;
import com.anirban.service.ApplicationService;
import com.anirban.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter")
@CrossOrigin(origins = "*")
public class RecruiterApplicationController {

    private final ApplicationService applicationService;
    private final UserService userService;

    public RecruiterApplicationController(
            ApplicationService applicationService,
            UserService userService) {

        this.applicationService =
                applicationService;

        this.userService =
                userService;
    }

    // =====================================================
    // GET APPLICATIONS FOR A JOB
    //
    // GET:
    // /api/recruiter/applications/job/{jobId}
    //
    // Returns basic ApplicationResponse
    // =====================================================

    @GetMapping("/applications/job/{jobId}")
    public ResponseEntity<List<ApplicationResponse>>
    getJobApplications(
            @PathVariable Long jobId,
            Authentication authentication) {

        // =================================================
        // GET LOGGED-IN RECRUITER
        // =================================================

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        // =================================================
        // GET APPLICATIONS
        // =================================================

        List<ApplicationResponse> applications =
                applicationService
                        .getJobApplications(
                                jobId,
                                recruiter.getId()
                        );

        return ResponseEntity.ok(
                applications
        );
    }

    // =====================================================
    // GET RECRUITER APPLICATION DETAILS
    //
    // GET:
    // /api/recruiter/jobs/{jobId}/applications
    //
    // This is the endpoint used by JobApplications.js
    // =====================================================

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<List<RecruiterApplicationResponse>>
    getApplicationsForJob(
            @PathVariable Long jobId,
            Authentication authentication) {

        // =================================================
        // GET LOGGED-IN RECRUITER
        // =================================================

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        // =================================================
        // GET APPLICATIONS
        // =================================================

        List<RecruiterApplicationResponse> applications =
                applicationService
                        .getApplicationsForJob(
                                jobId,
                                recruiter.getId()
                        );

        return ResponseEntity.ok(
                applications
        );
    }

    // =====================================================
    // UPDATE APPLICATION STATUS
    //
    // PUT:
    // /api/recruiter/applications/{applicationId}/status
    //
    // Example:
    // ?status=UNDER_REVIEW
    // =====================================================

    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<ApplicationResponse>
    updateStatus(
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status,
            Authentication authentication) {

        // =================================================
        // GET LOGGED-IN RECRUITER
        // =================================================

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        // =================================================
        // UPDATE STATUS
        // =================================================

        ApplicationResponse updatedApplication =
                applicationService
                        .updateApplicationStatus(
                                applicationId,
                                recruiter.getId(),
                                status
                        );

        return ResponseEntity.ok(
                updatedApplication
        );
    }

    // =====================================================
    // HELPER
    // GET AUTHENTICATED RECRUITER
    // =====================================================

    private User getAuthenticatedRecruiter(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "Recruiter authentication is required"
            );
        }

        return userService
                .getUserByEmail(
                        authentication.getName()
                );
    }
}