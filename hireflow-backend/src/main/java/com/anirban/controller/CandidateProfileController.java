package com.anirban.controller;

import com.anirban.dto.CandidateProfileRequest;
import com.anirban.dto.CandidateProfileResponse;
import com.anirban.entity.User;
import com.anirban.service.CandidateProfileService;
import com.anirban.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/candidate/profile")
@CrossOrigin(origins = "*")
public class CandidateProfileController {

    private final CandidateProfileService profileService;
    private final UserService userService;


    public CandidateProfileController(
            CandidateProfileService profileService,
            UserService userService) {

        this.profileService = profileService;
        this.userService = userService;
    }


    // =====================================================
    // CREATE PROFILE
    // =====================================================

    @PostMapping
    public ResponseEntity<CandidateProfileResponse>
    createProfile(
            Authentication authentication,
            @RequestBody CandidateProfileRequest request) {

        User user =
                getAuthenticatedUser(
                        authentication
                );


        CandidateProfileResponse response =
                profileService.createProfile(
                        user.getId(),
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
    // GET PROFILE
    // =====================================================

    @GetMapping
    public ResponseEntity<CandidateProfileResponse>
    getProfile(
            Authentication authentication) {

        User user =
                getAuthenticatedUser(
                        authentication
                );


        CandidateProfileResponse response =
                profileService.getProfile(
                        user.getId()
                );


        return ResponseEntity.ok(
                response
        );
    }


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    @PutMapping
    public ResponseEntity<CandidateProfileResponse>
    updateProfile(
            Authentication authentication,
            @RequestBody CandidateProfileRequest request) {

        User user =
                getAuthenticatedUser(
                        authentication
                );


        CandidateProfileResponse response =
                profileService.updateProfile(
                        user.getId(),
                        request
                );


        return ResponseEntity.ok(
                response
        );
    }


    // =====================================================
    // UPLOAD / REPLACE RESUME
    // =====================================================

    @PostMapping("/resume")
    public ResponseEntity<CandidateProfileResponse>
    uploadResume(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {

        User user =
                getAuthenticatedUser(
                        authentication
                );


        CandidateProfileResponse response =
                profileService.uploadResume(
                        user.getId(),
                        file
                );


        return ResponseEntity.ok(
                response
        );
    }


    // =====================================================
    // DELETE RESUME
    // =====================================================

    @DeleteMapping("/resume")
    public ResponseEntity<CandidateProfileResponse>
    deleteResume(
            Authentication authentication) {

        User user =
                getAuthenticatedUser(
                        authentication
                );


        CandidateProfileResponse response =
                profileService.deleteResume(
                        user.getId()
                );


        return ResponseEntity.ok(
                response
        );
    }


    // =====================================================
    // AUTHENTICATED USER
    // =====================================================

    private User getAuthenticatedUser(
            Authentication authentication) {

        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }


        return userService.getUserByEmail(
                authentication.getName()
        );
    }
}