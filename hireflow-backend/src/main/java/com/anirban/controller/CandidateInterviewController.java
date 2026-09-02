package com.anirban.controller;

import com.anirban.dto.InterviewResponse;

import com.anirban.entity.User;

import com.anirban.service.InterviewService;
import com.anirban.service.UserService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate/interviews")
public class CandidateInterviewController {

    private final InterviewService
            interviewService;

    private final UserService
            userService;

    public CandidateInterviewController(
            InterviewService interviewService,
            UserService userService) {

        this.interviewService =
                interviewService;

        this.userService =
                userService;
    }

    // =====================================================
    // GET MY INTERVIEWS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<InterviewResponse>>
    getInterviews(
            Authentication authentication) {

        User candidate =
                getAuthenticatedUser(
                        authentication
                );

        return ResponseEntity.ok(
                interviewService
                        .getCandidateInterviews(
                                candidate.getId()
                        )
        );
    }

    // =====================================================
    // GET SINGLE INTERVIEW
    // =====================================================

    @GetMapping("/{interviewId}")
    public ResponseEntity<InterviewResponse>
    getInterview(
            @PathVariable Long interviewId,
            Authentication authentication) {

        User candidate =
                getAuthenticatedUser(
                        authentication
                );

        return ResponseEntity.ok(
                interviewService
                        .getCandidateInterview(
                                candidate.getId(),
                                interviewId
                        )
        );
    }

    // =====================================================
    // AUTHENTICATED USER
    // =====================================================

    private User getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }

        return userService
                .getUserByEmail(
                        authentication.getName()
                );
    }
}