package com.anirban.controller;

import com.anirban.dto.ApplicationRequest;
import com.anirban.dto.ApplicationResponse;
import com.anirban.dto.ApplicationStatusHistoryResponse;
import com.anirban.entity.User;
import com.anirban.service.ApplicationService;
import com.anirban.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate/applications")
@CrossOrigin(origins = "*")
public class CandidateApplicationController {

    private final ApplicationService applicationService;
    private final UserService userService;

    public CandidateApplicationController(
            ApplicationService applicationService,
            UserService userService) {

        this.applicationService =
                applicationService;

        this.userService =
                userService;
    }

    @PostMapping("/job/{jobId}")
    public ResponseEntity<ApplicationResponse>
    applyForJob(
            @PathVariable Long jobId,
            @RequestBody ApplicationRequest request,
            Authentication authentication) {

        User candidate =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                applicationService.applyForJob(
                        jobId,
                        candidate.getId(),
                        request
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>>
    getMyApplications(
            Authentication authentication) {

        User candidate =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                applicationService
                        .getCandidateApplications(
                                candidate.getId()
                        )
        );
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse>
    getApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {

        User candidate =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                applicationService
                        .getCandidateApplication(
                                applicationId,
                                candidate.getId()
                        )
        );
    }

    @DeleteMapping("/{applicationId}")
    public ResponseEntity<String>
    withdrawApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {

        User candidate =
                userService.getUserByEmail(
                        authentication.getName()
                );

        applicationService.withdrawApplication(
                applicationId,
                candidate.getId()
        );

        return ResponseEntity.ok(
                "Application withdrawn successfully"
        );
    }
    @GetMapping("/{applicationId}/history")
    public ResponseEntity<List<ApplicationStatusHistoryResponse>>
    getApplicationHistory(
            @PathVariable Long applicationId,
            Authentication authentication) {

        User user =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                applicationService.getApplicationStatusHistory(
                        applicationId,
                        user.getId()
                )
        );
    }
}