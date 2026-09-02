package com.anirban.controller;

import com.anirban.entity.Role;
import com.anirban.entity.User;

import com.anirban.repository.UserRepository;

import com.anirban.service.OfferLetterPdfService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class OfferLetterController {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    OfferLetterController.class
            );


    private final OfferLetterPdfService
            offerLetterPdfService;

    private final UserRepository
            userRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public OfferLetterController(
            OfferLetterPdfService offerLetterPdfService,
            UserRepository userRepository) {

        this.offerLetterPdfService =
                offerLetterPdfService;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // RECRUITER - DOWNLOAD / PREVIEW OFFER LETTER
    // =====================================================

    @PreAuthorize(
            "hasRole('RECRUITER')"
    )
    @GetMapping(
            "/api/recruiter/offers/{offerId}/letter"
    )
    public ResponseEntity<byte[]>
    downloadRecruiterOfferLetter(
            @PathVariable
            Long offerId,

            Authentication authentication) {

        // =================================================
        // VALIDATE OFFER ID
        // =================================================

        validateOfferId(
                offerId
        );


        // =================================================
        // CURRENT RECRUITER
        // =================================================

        User recruiter =
                getCurrentUser(
                        authentication,
                        Role.RECRUITER
                );


        try {

            // =============================================
            // GENERATE PDF
            // =============================================

            byte[] pdf =
                    offerLetterPdfService
                            .generateForRecruiter(
                                    recruiter.getId(),
                                    offerId
                            );


            // =============================================
            // VALIDATE GENERATED PDF
            // =============================================

            validateGeneratedPdf(
                    pdf,
                    offerId
            );


            LOGGER.info(
                    "Offer letter generated successfully "
                            + "for recruiterId={}, offerId={}, size={} bytes",
                    recruiter.getId(),
                    offerId,
                    pdf.length
            );


            // =============================================
            // RETURN PDF
            // =============================================

            return buildPdfResponse(
                    pdf,
                    offerId
            );

        } catch (RuntimeException exception) {

            LOGGER.error(
                    "Failed to generate recruiter offer letter. "
                            + "recruiterId={}, offerId={}, reason={}",
                    recruiter.getId(),
                    offerId,
                    exception.getMessage(),
                    exception
            );

            /*
             * Do not replace the original exception message.
             *
             * Your GlobalExceptionHandler can return this
             * message as JSON and the React blob error parser
             * can display it.
             */
            throw exception;
        }
    }


    // =====================================================
    // CANDIDATE - DOWNLOAD OFFER LETTER
    // =====================================================

    @PreAuthorize(
            "hasRole('CANDIDATE')"
    )
    @GetMapping(
            "/api/candidate/offers/{offerId}/letter"
    )
    public ResponseEntity<byte[]>
    downloadCandidateOfferLetter(
            @PathVariable
            Long offerId,

            Authentication authentication) {

        // =================================================
        // VALIDATE OFFER ID
        // =================================================

        validateOfferId(
                offerId
        );


        // =================================================
        // CURRENT CANDIDATE
        // =================================================

        User candidate =
                getCurrentUser(
                        authentication,
                        Role.CANDIDATE
                );


        try {

            // =============================================
            // GENERATE PDF
            // =============================================

            byte[] pdf =
                    offerLetterPdfService
                            .generateForCandidate(
                                    candidate.getId(),
                                    offerId
                            );


            // =============================================
            // VALIDATE GENERATED PDF
            // =============================================

            validateGeneratedPdf(
                    pdf,
                    offerId
            );


            LOGGER.info(
                    "Offer letter generated successfully "
                            + "for candidateId={}, offerId={}, size={} bytes",
                    candidate.getId(),
                    offerId,
                    pdf.length
            );


            // =============================================
            // RETURN PDF
            // =============================================

            return buildPdfResponse(
                    pdf,
                    offerId
            );

        } catch (RuntimeException exception) {

            LOGGER.error(
                    "Failed to generate candidate offer letter. "
                            + "candidateId={}, offerId={}, reason={}",
                    candidate.getId(),
                    offerId,
                    exception.getMessage(),
                    exception
            );


            /*
             * Preserve the actual backend error.
             *
             * Examples:
             *
             * Job offer not found
             *
             * You are not authorized to access this
             * offer letter
             *
             * Draft offer letter is not available
             * to candidate
             *
             * Unable to generate offer letter PDF
             */
            throw exception;
        }
    }


    // =====================================================
    // CURRENT AUTHENTICATED USER
    // =====================================================

    private User getCurrentUser(
            Authentication authentication,
            Role expectedRole) {

        // =================================================
        // AUTHENTICATION REQUIRED
        // =================================================

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }


        // =================================================
        // EMAIL
        // =================================================

        String email =
                authentication.getName();


        if (email == null ||
                email.isBlank()) {

            throw new RuntimeException(
                    "Authenticated user email is missing"
            );
        }


        // =================================================
        // FIND USER
        // =================================================

        User user =
                userRepository
                        .findByEmail(
                                email.trim()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Authenticated user not found"
                                        )
                        );


        // =================================================
        // ROLE REQUIRED
        // =================================================

        if (user.getRole() == null) {

            throw new RuntimeException(
                    "Authenticated user role is missing"
            );
        }


        if (expectedRole != null &&
                user.getRole() != expectedRole) {

            throw new RuntimeException(
                    "You are not authorized to access this offer letter"
            );
        }


        // =================================================
        // ID REQUIRED
        // =================================================

        if (user.getId() == null) {

            throw new RuntimeException(
                    "Authenticated user ID is missing"
            );
        }


        return user;
    }


    // =====================================================
    // VALIDATE OFFER ID
    // =====================================================

    private void validateOfferId(
            Long offerId) {

        if (offerId == null) {

            throw new RuntimeException(
                    "Offer ID is required"
            );
        }


        if (offerId <= 0) {

            throw new RuntimeException(
                    "Invalid offer ID"
            );
        }
    }


    // =====================================================
    // VALIDATE GENERATED PDF
    // =====================================================

    private void validateGeneratedPdf(
            byte[] pdf,
            Long offerId) {

        if (pdf == null) {

            throw new RuntimeException(
                    "Offer letter PDF generation returned no data "
                            + "for offer "
                            + offerId
            );
        }


        if (pdf.length == 0) {

            throw new RuntimeException(
                    "Generated offer letter PDF is empty "
                            + "for offer "
                            + offerId
            );
        }


        /*
         * A normal PDF starts with:
         *
         * %PDF
         *
         * This protects the frontend from downloading
         * invalid content as a .pdf file.
         */

        if (!hasPdfSignature(pdf)) {

            throw new RuntimeException(
                    "Generated offer letter is not a valid PDF"
            );
        }
    }


    // =====================================================
    // PDF SIGNATURE
    // =====================================================

    private boolean hasPdfSignature(
            byte[] pdf) {

        if (pdf == null ||
                pdf.length < 4) {

            return false;
        }


        return pdf[0] == '%' &&
                pdf[1] == 'P' &&
                pdf[2] == 'D' &&
                pdf[3] == 'F';
    }


    // =====================================================
    // PDF RESPONSE
    // =====================================================

    private ResponseEntity<byte[]>
    buildPdfResponse(
            byte[] pdf,
            Long offerId) {

        String filename =
                "HireFlow-Offer-Letter-"
                        + offerId
                        + ".pdf";


        HttpHeaders headers =
                new HttpHeaders();


        // =================================================
        // CONTENT TYPE
        // =================================================

        headers.setContentType(
                MediaType.APPLICATION_PDF
        );


        // =================================================
        // DOWNLOAD FILENAME
        // =================================================

        headers.setContentDisposition(
                ContentDisposition
                        .attachment()
                        .filename(
                                filename
                        )
                        .build()
        );


        // =================================================
        // CONTENT LENGTH
        // =================================================

        headers.setContentLength(
                pdf.length
        );


        // =================================================
        // CACHE
        // =================================================

        headers.setCacheControl(
                "no-store, no-cache, must-revalidate"
        );


        headers.setPragma(
                "no-cache"
        );


        // =================================================
        // SECURITY
        // =================================================

        headers.add(
                "X-Content-Type-Options",
                "nosniff"
        );


        // =================================================
        // RESPONSE
        // =================================================

        return new ResponseEntity<>(
                pdf,
                headers,
                HttpStatus.OK
        );
    }
}