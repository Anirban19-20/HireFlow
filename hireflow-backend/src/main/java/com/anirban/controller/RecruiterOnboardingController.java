package com.anirban.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anirban.dto.CandidateOnboardingRequest;
import com.anirban.dto.CandidateOnboardingResponse;
import com.anirban.dto.CandidateOnboardingStatusRequest;

import com.anirban.entity.User;

import com.anirban.repository.UserRepository;

import com.anirban.service.CandidateOnboardingService;

@RestController
@RequestMapping(
        "/api/recruiter/onboarding"
)
public class RecruiterOnboardingController {

    private final CandidateOnboardingService
            candidateOnboardingService;

    private final UserRepository
            userRepository;


    public RecruiterOnboardingController(
            CandidateOnboardingService candidateOnboardingService,
            UserRepository userRepository) {

        this.candidateOnboardingService =
                candidateOnboardingService;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // LIST ONBOARDINGS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<CandidateOnboardingResponse>>
    getOnboardings(
            Authentication authentication) {

        Long recruiterId =
                getAuthenticatedUserId(
                        authentication
                );

        return ResponseEntity.ok(
                candidateOnboardingService
                        .getRecruiterOnboardings(
                                recruiterId
                        )
        );
    }


    // =====================================================
    // GET ONBOARDING
    // =====================================================

    @GetMapping(
            "/{onboardingId}"
    )
    public ResponseEntity<CandidateOnboardingResponse>
    getOnboarding(
            @PathVariable Long onboardingId,
            Authentication authentication) {

        Long recruiterId =
                getAuthenticatedUserId(
                        authentication
                );

        return ResponseEntity.ok(
                candidateOnboardingService
                        .getRecruiterOnboarding(
                                recruiterId,
                                onboardingId
                        )
        );
    }


    // =====================================================
    // CREATE / ENSURE FOR ACCEPTED OFFER
    // =====================================================

    @PostMapping(
            "/offer/{offerId}"
    )
    public ResponseEntity<CandidateOnboardingResponse>
    ensureOnboarding(
            @PathVariable Long offerId,
            Authentication authentication) {

        Long recruiterId =
                getAuthenticatedUserId(
                        authentication
                );

        return ResponseEntity.ok(
                candidateOnboardingService
                        .ensureOnboardingForOffer(
                                recruiterId,
                                offerId
                        )
        );
    }


    // =====================================================
    // UPDATE JOINING DETAILS
    // =====================================================

    @PutMapping(
            "/{onboardingId}"
    )
    public ResponseEntity<CandidateOnboardingResponse>
    updateOnboarding(
            @PathVariable Long onboardingId,
            @RequestBody CandidateOnboardingRequest request,
            Authentication authentication) {

        Long recruiterId =
                getAuthenticatedUserId(
                        authentication
                );

        return ResponseEntity.ok(
                candidateOnboardingService
                        .updateOnboarding(
                                recruiterId,
                                onboardingId,
                                request
                        )
        );
    }


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @PatchMapping(
            "/{onboardingId}/status"
    )
    public ResponseEntity<CandidateOnboardingResponse>
    updateStatus(
            @PathVariable Long onboardingId,
            @RequestBody CandidateOnboardingStatusRequest request,
            Authentication authentication) {

        if (
                request == null ||
                request.getStatus() == null
        ) {

            throw new RuntimeException(
                    "Onboarding status is required"
            );
        }

        Long recruiterId =
                getAuthenticatedUserId(
                        authentication
                );

        return ResponseEntity.ok(
                candidateOnboardingService
                        .updateStatus(
                                recruiterId,
                                onboardingId,
                                request.getStatus()
                        )
        );
    }


    // =====================================================
    // AUTHENTICATED USER ID
    // =====================================================

    private Long getAuthenticatedUserId(
            Authentication authentication) {

        if (
                authentication == null ||
                authentication.getName() == null
        ) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(
                                email
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Authenticated user not found"
                                        )
                        );

        return user.getId();
    }
}
