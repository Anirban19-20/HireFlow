package com.anirban.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anirban.dto.CandidateEvaluationRequest;
import com.anirban.dto.CandidateEvaluationResponse;

import com.anirban.entity.User;

import com.anirban.repository.UserRepository;

import com.anirban.service.CandidateEvaluationService;

@RestController
@RequestMapping(
        "/api/recruiter/evaluations"
)
public class RecruiterCandidateEvaluationController {

    private final CandidateEvaluationService
            candidateEvaluationService;

    private final UserRepository
            userRepository;


    public RecruiterCandidateEvaluationController(
            CandidateEvaluationService candidateEvaluationService,
            UserRepository userRepository) {

        this.candidateEvaluationService =
                candidateEvaluationService;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // GET EVALUATION
    // =====================================================

    @GetMapping(
            "/application/{applicationId}"
    )
    public ResponseEntity<CandidateEvaluationResponse>
    getEvaluation(
            @PathVariable Long applicationId,
            Authentication authentication) {

        Long recruiterId =
                getAuthenticatedUserId(
                        authentication
                );

        CandidateEvaluationResponse response =
                candidateEvaluationService
                        .getEvaluation(
                                applicationId,
                                recruiterId
                        );

        if (response == null) {

            return ResponseEntity
                    .noContent()
                    .build();
        }

        return ResponseEntity.ok(
                response
        );
    }


    // =====================================================
    // CREATE / UPDATE EVALUATION
    // =====================================================

    @PutMapping(
            "/application/{applicationId}"
    )
    public ResponseEntity<CandidateEvaluationResponse>
    saveEvaluation(
            @PathVariable Long applicationId,
            @RequestBody CandidateEvaluationRequest request,
            Authentication authentication) {

        Long recruiterId =
                getAuthenticatedUserId(
                        authentication
                );

        CandidateEvaluationResponse response =
                candidateEvaluationService
                        .saveEvaluation(
                                applicationId,
                                recruiterId,
                                request
                        );

        return ResponseEntity.ok(
                response
        );
    }


    // =====================================================
    // DELETE EVALUATION
    // =====================================================

    @DeleteMapping(
            "/application/{applicationId}"
    )
    public ResponseEntity<Void>
    deleteEvaluation(
            @PathVariable Long applicationId,
            Authentication authentication) {

        Long recruiterId =
                getAuthenticatedUserId(
                        authentication
                );

        candidateEvaluationService
                .deleteEvaluation(
                        applicationId,
                        recruiterId
                );

        return ResponseEntity
                .noContent()
                .build();
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