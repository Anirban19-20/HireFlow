package com.anirban.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.anirban.dto.JobOfferRequest;
import com.anirban.dto.JobOfferResponse;

import com.anirban.entity.Application;
import com.anirban.entity.ApplicationStatus;
import com.anirban.entity.JobOffer;
import com.anirban.entity.OfferStatus;
import com.anirban.entity.Role;
import com.anirban.entity.User;

import com.anirban.repository.ApplicationRepository;
import com.anirban.repository.JobOfferRepository;
import com.anirban.repository.UserRepository;

@Service
public class JobOfferServiceImpl
        implements JobOfferService {

    private final JobOfferRepository
            jobOfferRepository;

    private final ApplicationRepository
            applicationRepository;

    private final UserRepository
            userRepository;

    private final NotificationService
            notificationService;

    private final CandidateOnboardingService
            candidateOnboardingService;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public JobOfferServiceImpl(
            JobOfferRepository jobOfferRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            CandidateOnboardingService candidateOnboardingService) {

        this.jobOfferRepository =
                jobOfferRepository;

        this.applicationRepository =
                applicationRepository;

        this.userRepository =
                userRepository;

        this.notificationService =
                notificationService;

        this.candidateOnboardingService =
                candidateOnboardingService;
    }


    // =====================================================
    // SAVE / UPDATE DRAFT
    // =====================================================

    @Override
    @Transactional
    public JobOfferResponse saveDraft(
            Long recruiterId,
            Long applicationId,
            JobOfferRequest request) {

        validateRecruiter(
                recruiterId
        );


        if (
                request == null
        ) {

            throw new RuntimeException(
                    "Offer request is required"
            );
        }


        Application application =
                getRecruiterApplication(
                        recruiterId,
                        applicationId
                );


        if (
                application.getStatus() !=
                        ApplicationStatus.SELECTED
        ) {

            throw new RuntimeException(
                    "Only selected candidates can receive job offers"
            );
        }


        validateRequest(
                request
        );


        JobOffer offer =
                jobOfferRepository
                        .findByApplicationId(
                                applicationId
                        )
                        .orElseGet(
                                JobOffer::new
                        );


        if (
                offer.getId() != null &&
                offer.getStatus() !=
                        OfferStatus.DRAFT
        ) {

            throw new RuntimeException(
                    "Only draft offers can be edited"
            );
        }


        offer.setApplication(
                application
        );


        offer.setOfferedSalary(
                request.getOfferedSalary()
        );


        String currency =
                request.getCurrency();


        if (
                currency == null ||
                currency.isBlank()
        ) {

            currency =
                    "INR";
        }


        offer.setCurrency(
                currency
                        .trim()
                        .toUpperCase()
        );


        offer.setJoiningDate(
                request.getJoiningDate()
        );


        offer.setExpiresAt(
                request.getExpiresAt()
        );


        if (
                request.getMessage() == null ||
                request.getMessage().isBlank()
        ) {

            offer.setMessage(
                    null
            );

        } else {

            offer.setMessage(
                    request
                            .getMessage()
                            .trim()
            );
        }


        offer.setStatus(
                OfferStatus.DRAFT
        );


        JobOffer savedOffer =
                jobOfferRepository.save(
                        offer
                );


        return convertToResponse(
                savedOffer
        );
    }


    // =====================================================
    // SEND OFFER
    // =====================================================

    @Override
    @Transactional
    public JobOfferResponse sendOffer(
            Long recruiterId,
            Long offerId) {

        validateRecruiter(
                recruiterId
        );


        JobOffer offer =
                getRecruiterOffer(
                        recruiterId,
                        offerId
                );


        if (
                offer.getStatus() !=
                        OfferStatus.DRAFT
        ) {

            throw new RuntimeException(
                    "Only draft offers can be sent"
            );
        }


        if (
                offer.getExpiresAt() == null
        ) {

            throw new RuntimeException(
                    "Offer expiry date is required"
            );
        }


        if (
                offer.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {

            throw new RuntimeException(
                    "Offer expiry date must be in the future"
            );
        }


        offer.setStatus(
                OfferStatus.SENT
        );


        offer.setSentAt(
                LocalDateTime.now()
        );


        JobOffer savedOffer =
                jobOfferRepository.save(
                        offer
                );


        // =================================================
        // NOTIFY CANDIDATE
        // =================================================

        notificationService
                .createOfferSentNotification(
                        savedOffer
                );


        return convertToResponse(
                savedOffer
        );
    }


    // =====================================================
    // WITHDRAW OFFER
    // =====================================================

    @Override
    @Transactional
    public JobOfferResponse withdrawOffer(
            Long recruiterId,
            Long offerId) {

        validateRecruiter(
                recruiterId
        );


        JobOffer offer =
                getRecruiterOffer(
                        recruiterId,
                        offerId
                );


        refreshExpiredStatus(
                offer
        );


        if (
                offer.getStatus() !=
                        OfferStatus.SENT
        ) {

            throw new RuntimeException(
                    "Only sent offers can be withdrawn"
            );
        }


        offer.setStatus(
                OfferStatus.WITHDRAWN
        );


        JobOffer savedOffer =
                jobOfferRepository.save(
                        offer
                );


        // =================================================
        // NOTIFY CANDIDATE
        // =================================================

        notificationService
                .createOfferWithdrawnNotification(
                        savedOffer
                );


        return convertToResponse(
                savedOffer
        );
    }


    // =====================================================
    // GET OFFER FOR APPLICATION
    // =====================================================

    @Override
    @Transactional
    public JobOfferResponse getOfferByApplication(
            Long recruiterId,
            Long applicationId) {

        validateRecruiter(
                recruiterId
        );


        getRecruiterApplication(
                recruiterId,
                applicationId
        );


        JobOffer offer =
                jobOfferRepository
                        .findByApplicationId(
                                applicationId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job offer not found"
                                        )
                        );


        refreshExpiredStatus(
                offer
        );


        return convertToResponse(
                offer
        );
    }


    // =====================================================
    // RECRUITER OFFERS
    // =====================================================

    @Override
    @Transactional
    public List<JobOfferResponse> getRecruiterOffers(
            Long recruiterId) {

        validateRecruiter(
                recruiterId
        );


        List<JobOffer> offers =
                jobOfferRepository
                        .findByApplicationJobRecruiterIdOrderByCreatedAtDesc(
                                recruiterId
                        );


        offers.forEach(
                this::refreshExpiredStatus
        );


        return offers
                .stream()
                .map(
                        this::convertToResponse
                )
                .toList();
    }


    // =====================================================
    // CANDIDATE OFFERS
    // =====================================================

    @Override
    @Transactional
    public List<JobOfferResponse> getCandidateOffers(
            Long candidateId) {

        validateCandidate(
                candidateId
        );


        List<JobOffer> offers =
                jobOfferRepository
                        .findByApplicationCandidateIdOrderByCreatedAtDesc(
                                candidateId
                        );


        offers.forEach(
                this::refreshExpiredStatus
        );


        return offers
                .stream()
                .filter(
                        offer ->
                                offer.getStatus() !=
                                        OfferStatus.DRAFT
                )
                .map(
                        this::convertToResponse
                )
                .toList();
    }


    // =====================================================
    // ACCEPT OFFER
    // =====================================================

    @Override
    @Transactional
    public JobOfferResponse acceptOffer(
            Long candidateId,
            Long offerId) {

        validateCandidate(
                candidateId
        );


        JobOffer offer =
                getCandidateOffer(
                        candidateId,
                        offerId
                );


        refreshExpiredStatus(
                offer
        );


        if (
                offer.getStatus() !=
                        OfferStatus.SENT
        ) {

            throw new RuntimeException(
                    "Only active sent offers can be accepted"
            );
        }


        offer.setStatus(
                OfferStatus.ACCEPTED
        );


        offer.setRespondedAt(
                LocalDateTime.now()
        );


        JobOffer savedOffer =
                jobOfferRepository.save(
                        offer
                );


        // =================================================
        // NOTIFY RECRUITER
        // =================================================

        notificationService
                .createOfferAcceptedNotification(
                        savedOffer
                );


        // =================================================
        // CREATE / ENSURE ONBOARDING
        // =================================================

        candidateOnboardingService
                .ensureOnboardingForAcceptedOffer(
                        savedOffer
                );


        return convertToResponse(
                savedOffer
        );
    }


    // =====================================================
    // REJECT OFFER
    // =====================================================

    @Override
    @Transactional
    public JobOfferResponse rejectOffer(
            Long candidateId,
            Long offerId) {

        validateCandidate(
                candidateId
        );


        JobOffer offer =
                getCandidateOffer(
                        candidateId,
                        offerId
                );


        refreshExpiredStatus(
                offer
        );


        if (
                offer.getStatus() !=
                        OfferStatus.SENT
        ) {

            throw new RuntimeException(
                    "Only active sent offers can be rejected"
            );
        }


        offer.setStatus(
                OfferStatus.REJECTED
        );


        offer.setRespondedAt(
                LocalDateTime.now()
        );


        JobOffer savedOffer =
                jobOfferRepository.save(
                        offer
                );


        // =================================================
        // NOTIFY RECRUITER
        // =================================================

        notificationService
                .createOfferRejectedNotification(
                        savedOffer
                );


        return convertToResponse(
                savedOffer
        );
    }


    // =====================================================
    // VALIDATE OFFER REQUEST
    // =====================================================

    private void validateRequest(
            JobOfferRequest request) {

        if (
                request == null
        ) {

            throw new RuntimeException(
                    "Offer request is required"
            );
        }


        BigDecimal salary =
                request.getOfferedSalary();


        if (
                salary == null ||
                salary.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new RuntimeException(
                    "Offered salary must be greater than zero"
            );
        }


        if (
                request.getJoiningDate() == null
        ) {

            throw new RuntimeException(
                    "Joining date is required"
            );
        }


        if (
                request.getJoiningDate()
                        .isBefore(
                                LocalDate.now()
                        )
        ) {

            throw new RuntimeException(
                    "Joining date cannot be in the past"
            );
        }


        if (
                request.getExpiresAt() == null
        ) {

            throw new RuntimeException(
                    "Offer expiry date is required"
            );
        }


        if (
                request.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {

            throw new RuntimeException(
                    "Offer expiry date must be in the future"
            );
        }
    }


    // =====================================================
    // VALIDATE RECRUITER
    // =====================================================

    private User validateRecruiter(
            Long recruiterId) {

        if (
                recruiterId == null
        ) {

            throw new RuntimeException(
                    "Recruiter ID is required"
            );
        }


        User recruiter =
                userRepository
                        .findById(
                                recruiterId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Recruiter not found"
                                        )
                        );


        if (
                recruiter.getRole() !=
                        Role.RECRUITER
        ) {

            throw new RuntimeException(
                    "Only recruiters can manage job offers"
            );
        }


        return recruiter;
    }


    // =====================================================
    // VALIDATE CANDIDATE
    // =====================================================

    private User validateCandidate(
            Long candidateId) {

        if (
                candidateId == null
        ) {

            throw new RuntimeException(
                    "Candidate ID is required"
            );
        }


        User candidate =
                userRepository
                        .findById(
                                candidateId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Candidate not found"
                                        )
                        );


        if (
                candidate.getRole() !=
                        Role.CANDIDATE
        ) {

            throw new RuntimeException(
                    "Only candidates can respond to job offers"
            );
        }


        return candidate;
    }


    // =====================================================
    // RECRUITER APPLICATION OWNERSHIP
    // =====================================================

    private Application getRecruiterApplication(
            Long recruiterId,
            Long applicationId) {

        if (
                applicationId == null
        ) {

            throw new RuntimeException(
                    "Application ID is required"
            );
        }


        Application application =
                applicationRepository
                        .findById(
                                applicationId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Application not found"
                                        )
                        );


        if (
                application.getJob() == null ||
                application
                        .getJob()
                        .getRecruiter() == null ||
                !application
                        .getJob()
                        .getRecruiter()
                        .getId()
                        .equals(
                                recruiterId
                        )
        ) {

            throw new RuntimeException(
                    "You are not authorized to manage this application"
            );
        }


        return application;
    }


    // =====================================================
    // RECRUITER OFFER OWNERSHIP
    // =====================================================

    private JobOffer getRecruiterOffer(
            Long recruiterId,
            Long offerId) {

        if (
                offerId == null
        ) {

            throw new RuntimeException(
                    "Offer ID is required"
            );
        }


        JobOffer offer =
                jobOfferRepository
                        .findById(
                                offerId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job offer not found"
                                        )
                        );


        Application application =
                offer.getApplication();


        if (
                application == null ||
                application.getJob() == null ||
                application
                        .getJob()
                        .getRecruiter() == null ||
                !application
                        .getJob()
                        .getRecruiter()
                        .getId()
                        .equals(
                                recruiterId
                        )
        ) {

            throw new RuntimeException(
                    "You are not authorized to manage this offer"
            );
        }


        return offer;
    }


    // =====================================================
    // CANDIDATE OFFER OWNERSHIP
    // =====================================================

    private JobOffer getCandidateOffer(
            Long candidateId,
            Long offerId) {

        if (
                offerId == null
        ) {

            throw new RuntimeException(
                    "Offer ID is required"
            );
        }


        JobOffer offer =
                jobOfferRepository
                        .findById(
                                offerId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job offer not found"
                                        )
                        );


        Application application =
                offer.getApplication();


        if (
                application == null ||
                application.getCandidate() == null ||
                !application
                        .getCandidate()
                        .getId()
                        .equals(
                                candidateId
                        )
        ) {

            throw new RuntimeException(
                    "You are not authorized to respond to this offer"
            );
        }


        return offer;
    }


    // =====================================================
    // EXPIRE OFFER
    // =====================================================

    private void refreshExpiredStatus(
            JobOffer offer) {

        if (
                offer == null
        ) {

            return;
        }


        if (
                offer.getStatus() ==
                        OfferStatus.SENT &&
                offer.getExpiresAt() != null &&
                offer.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {

            offer.setStatus(
                    OfferStatus.EXPIRED
            );


            jobOfferRepository.save(
                    offer
            );
        }
    }


    // =====================================================
    // RESPONSE
    // =====================================================

    private JobOfferResponse convertToResponse(
            JobOffer offer) {

        if (
                offer == null
        ) {

            throw new RuntimeException(
                    "Job offer cannot be null"
            );
        }


        JobOfferResponse response =
                new JobOfferResponse();


        response.setId(
                offer.getId()
        );


        response.setOfferedSalary(
                offer.getOfferedSalary()
        );


        response.setCurrency(
                offer.getCurrency()
        );


        response.setJoiningDate(
                offer.getJoiningDate()
        );


        response.setExpiresAt(
                offer.getExpiresAt()
        );


        response.setMessage(
                offer.getMessage()
        );


        response.setStatus(
                offer.getStatus()
        );


        response.setCreatedAt(
                offer.getCreatedAt()
        );


        response.setUpdatedAt(
                offer.getUpdatedAt()
        );


        response.setSentAt(
                offer.getSentAt()
        );


        response.setRespondedAt(
                offer.getRespondedAt()
        );


        Application application =
                offer.getApplication();


        if (
                application != null
        ) {

            response.setApplicationId(
                    application.getId()
            );


            if (
                    application.getCandidate() !=
                            null
            ) {

                response.setCandidateId(
                        application
                                .getCandidate()
                                .getId()
                );


                response.setCandidateName(
                        application
                                .getCandidate()
                                .getName()
                );


                response.setCandidateEmail(
                        application
                                .getCandidate()
                                .getEmail()
                );
            }


            if (
                    application.getJob() !=
                            null
            ) {

                response.setJobId(
                        application
                                .getJob()
                                .getId()
                );


                response.setJobTitle(
                        application
                                .getJob()
                                .getTitle()
                );
            }
        }


        return response;
    }
}