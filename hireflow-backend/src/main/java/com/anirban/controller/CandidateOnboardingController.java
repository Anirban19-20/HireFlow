package com.anirban.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anirban.dto.CandidateOnboardingResponse;

import com.anirban.entity.User;

import com.anirban.repository.UserRepository;

import com.anirban.service.CandidateOnboardingService;

@RestController
@RequestMapping(
        "/api/candidate/onboarding"
)
public class CandidateOnboardingController {

    private final CandidateOnboardingService
            candidateOnboardingService;

    private final UserRepository
            userRepository;


    public CandidateOnboardingController(
            CandidateOnboardingService candidateOnboardingService,
            UserRepository userRepository) {

        this.candidateOnboardingService =
                candidateOnboardingService;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // LIST MY ONBOARDINGS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<CandidateOnboardingResponse>>
    getMyOnboardings(
            Authentication authentication) {

        Long candidateId =
                getAuthenticatedUserId(
                        authentication
                );

        return ResponseEntity.ok(
                candidateOnboardingService
                        .getCandidateOnboardings(
                                candidateId
                        )
        );
    }


    // =====================================================
    // GET MY ONBOARDING
    // =====================================================

    @GetMapping(
            "/{onboardingId}"
    )
    public ResponseEntity<CandidateOnboardingResponse>
    getMyOnboarding(
            @PathVariable Long onboardingId,
            Authentication authentication) {

        Long candidateId =
                getAuthenticatedUserId(
                        authentication
                );

        return ResponseEntity.ok(
                candidateOnboardingService
                        .getCandidateOnboarding(
                                candidateId,
                                onboardingId
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
