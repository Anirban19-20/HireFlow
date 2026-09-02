package com.anirban.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anirban.dto.JobOfferRequest;
import com.anirban.dto.JobOfferResponse;
import com.anirban.entity.User;
import com.anirban.repository.UserRepository;
import com.anirban.service.JobOfferService;

@RestController
@RequestMapping(
        "/api/recruiter/offers"
)
public class RecruiterJobOfferController {

    private final JobOfferService
            jobOfferService;

    private final UserRepository
            userRepository;


    public RecruiterJobOfferController(
            JobOfferService jobOfferService,
            UserRepository userRepository) {

        this.jobOfferService =
                jobOfferService;

        this.userRepository =
                userRepository;
    }


    @PutMapping(
            "/application/{applicationId}"
    )
    public ResponseEntity<JobOfferResponse>
    saveDraft(
            @PathVariable Long applicationId,
            @RequestBody JobOfferRequest request,
            Authentication authentication) {

        Long recruiterId =
                getUserId(
                        authentication
                );


        return ResponseEntity.ok(
                jobOfferService.saveDraft(
                        recruiterId,
                        applicationId,
                        request
                )
        );
    }


    @PatchMapping(
            "/{offerId}/send"
    )
    public ResponseEntity<JobOfferResponse>
    sendOffer(
            @PathVariable Long offerId,
            Authentication authentication) {

        Long recruiterId =
                getUserId(
                        authentication
                );


        return ResponseEntity.ok(
                jobOfferService.sendOffer(
                        recruiterId,
                        offerId
                )
        );
    }


    @PatchMapping(
            "/{offerId}/withdraw"
    )
    public ResponseEntity<JobOfferResponse>
    withdrawOffer(
            @PathVariable Long offerId,
            Authentication authentication) {

        Long recruiterId =
                getUserId(
                        authentication
                );


        return ResponseEntity.ok(
                jobOfferService.withdrawOffer(
                        recruiterId,
                        offerId
                )
        );
    }


    @GetMapping(
            "/application/{applicationId}"
    )
    public ResponseEntity<JobOfferResponse>
    getOfferByApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {

        Long recruiterId =
                getUserId(
                        authentication
                );


        return ResponseEntity.ok(
                jobOfferService
                        .getOfferByApplication(
                                recruiterId,
                                applicationId
                        )
        );
    }


    @GetMapping
    public ResponseEntity<List<JobOfferResponse>>
    getRecruiterOffers(
            Authentication authentication) {

        Long recruiterId =
                getUserId(
                        authentication
                );


        return ResponseEntity.ok(
                jobOfferService
                        .getRecruiterOffers(
                                recruiterId
                        )
        );
    }


    private Long getUserId(
            Authentication authentication) {

        if (
                authentication == null ||
                authentication.getName() == null
        ) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }


        User user =
                userRepository
                        .findByEmail(
                                authentication.getName()
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