package com.anirban.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anirban.dto.JobOfferResponse;
import com.anirban.entity.User;
import com.anirban.repository.UserRepository;
import com.anirban.service.JobOfferService;

@RestController
@RequestMapping(
        "/api/candidate/offers"
)
public class CandidateJobOfferController {

    private final JobOfferService
            jobOfferService;

    private final UserRepository
            userRepository;


    public CandidateJobOfferController(
            JobOfferService jobOfferService,
            UserRepository userRepository) {

        this.jobOfferService =
                jobOfferService;

        this.userRepository =
                userRepository;
    }


    @GetMapping
    public ResponseEntity<List<JobOfferResponse>>
    getOffers(
            Authentication authentication) {

        Long candidateId =
                getUserId(
                        authentication
                );


        return ResponseEntity.ok(
                jobOfferService
                        .getCandidateOffers(
                                candidateId
                        )
        );
    }


    @PatchMapping(
            "/{offerId}/accept"
    )
    public ResponseEntity<JobOfferResponse>
    acceptOffer(
            @PathVariable Long offerId,
            Authentication authentication) {

        Long candidateId =
                getUserId(
                        authentication
                );


        return ResponseEntity.ok(
                jobOfferService
                        .acceptOffer(
                                candidateId,
                                offerId
                        )
        );
    }


    @PatchMapping(
            "/{offerId}/reject"
    )
    public ResponseEntity<JobOfferResponse>
    rejectOffer(
            @PathVariable Long offerId,
            Authentication authentication) {

        Long candidateId =
                getUserId(
                        authentication
                );


        return ResponseEntity.ok(
                jobOfferService
                        .rejectOffer(
                                candidateId,
                                offerId
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