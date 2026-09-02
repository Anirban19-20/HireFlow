package com.anirban.controller;

import com.anirban.dto.RecruiterProfileRequest;
import com.anirban.dto.RecruiterProfileResponse;

import com.anirban.entity.User;

import com.anirban.service.RecruiterProfileService;
import com.anirban.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recruiter/profile")
public class RecruiterProfileController {

    private final RecruiterProfileService
            profileService;

    private final UserService
            userService;

    public RecruiterProfileController(
            RecruiterProfileService profileService,
            UserService userService) {

        this.profileService =
                profileService;

        this.userService =
                userService;
    }

    // =====================================================
    // CREATE RECRUITER PROFILE
    // =====================================================

    @PostMapping
    public ResponseEntity<RecruiterProfileResponse>
    createProfile(
            Authentication authentication,
            @RequestBody RecruiterProfileRequest request) {

        // =================================================
        // GET LOGGED-IN RECRUITER
        // =================================================

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        // =================================================
        // CREATE PROFILE
        // =================================================

        RecruiterProfileResponse response =
                profileService.createProfile(
                        recruiter.getId(),
                        request
                );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(response);
    }

    // =====================================================
    // GET RECRUITER PROFILE
    // =====================================================

    @GetMapping
    public ResponseEntity<RecruiterProfileResponse>
    getProfile(
            Authentication authentication) {

        // =================================================
        // GET LOGGED-IN RECRUITER
        // =================================================

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        // =================================================
        // GET PROFILE
        // =================================================

        RecruiterProfileResponse response =
                profileService.getProfile(
                        recruiter.getId()
                );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // UPDATE RECRUITER PROFILE
    // =====================================================

    @PutMapping
    public ResponseEntity<RecruiterProfileResponse>
    updateProfile(
            Authentication authentication,
            @RequestBody RecruiterProfileRequest request) {

        // =================================================
        // GET LOGGED-IN RECRUITER
        // =================================================

        User recruiter =
                getAuthenticatedRecruiter(
                        authentication
                );

        // =================================================
        // UPDATE PROFILE
        // =================================================

        RecruiterProfileResponse response =
                profileService.updateProfile(
                        recruiter.getId(),
                        request
                );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // GET AUTHENTICATED USER
    // =====================================================

    private User getAuthenticatedRecruiter(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }

        String email =
                authentication.getName();

        if (email == null ||
                email.isBlank()) {

            throw new RuntimeException(
                    "Authenticated user email is missing"
            );
        }

        return userService
                .getUserByEmail(
                        email
                );
    }
}