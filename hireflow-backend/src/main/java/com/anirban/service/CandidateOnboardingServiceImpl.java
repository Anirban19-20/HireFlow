package com.anirban.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.anirban.dto.CandidateOnboardingRequest;
import com.anirban.dto.CandidateOnboardingResponse;

import com.anirban.entity.Application;
import com.anirban.entity.CandidateOnboarding;
import com.anirban.entity.Job;
import com.anirban.entity.JobOffer;
import com.anirban.entity.OfferStatus;
import com.anirban.entity.OnboardingStatus;
import com.anirban.entity.Role;
import com.anirban.entity.User;

import com.anirban.repository.CandidateOnboardingRepository;
import com.anirban.repository.JobOfferRepository;
import com.anirban.repository.UserRepository;

@Service
public class CandidateOnboardingServiceImpl
        implements CandidateOnboardingService {

    private final CandidateOnboardingRepository
            candidateOnboardingRepository;

    private final JobOfferRepository
            jobOfferRepository;

    private final UserRepository
            userRepository;


    public CandidateOnboardingServiceImpl(
            CandidateOnboardingRepository candidateOnboardingRepository,
            JobOfferRepository jobOfferRepository,
            UserRepository userRepository) {

        this.candidateOnboardingRepository =
                candidateOnboardingRepository;

        this.jobOfferRepository =
                jobOfferRepository;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // ENSURE ONBOARDING FOR RECRUITER
    // =====================================================

    @Override
    @Transactional
    public CandidateOnboardingResponse ensureOnboardingForOffer(
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

        return ensureOnboardingForAcceptedOffer(
                offer
        );
    }


    // =====================================================
    // ENSURE ONBOARDING FOR ACCEPTED OFFER
    // =====================================================

    @Override
    @Transactional
    public CandidateOnboardingResponse ensureOnboardingForAcceptedOffer(
            JobOffer offer) {

        validateAcceptedOffer(
                offer
        );

        CandidateOnboarding onboarding =
                candidateOnboardingRepository
                        .findByOfferId(
                                offer.getId()
                        )
                        .orElseGet(
                                () -> {

                                    CandidateOnboarding created =
                                            new CandidateOnboarding();

                                    created.setOffer(
                                            offer
                                    );

                                    created.setStatus(
                                            OnboardingStatus.JOINING_PENDING
                                    );

                                    created.setJoiningDate(
                                            offer.getJoiningDate()
                                    );

                                    return candidateOnboardingRepository
                                            .save(
                                                    created
                                            );
                                }
                        );

        return convertToResponse(
                onboarding
        );
    }


    // =====================================================
    // UPDATE ONBOARDING DETAILS
    // =====================================================

    @Override
    @Transactional
    public CandidateOnboardingResponse updateOnboarding(
            Long recruiterId,
            Long onboardingId,
            CandidateOnboardingRequest request) {

        validateRecruiter(
                recruiterId
        );

        if (
                request == null
        ) {

            throw new RuntimeException(
                    "Onboarding request is required"
            );
        }

        CandidateOnboarding onboarding =
                getRecruiterOnboardingEntity(
                        recruiterId,
                        onboardingId
                );

        validateEditable(
                onboarding
        );

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

        onboarding.setJoiningDate(
                request.getJoiningDate()
        );

        onboarding.setReportingTime(
                request.getReportingTime()
        );

        onboarding.setReportingLocation(
                clean(
                        request.getReportingLocation()
                )
        );

        onboarding.setHrContactName(
                clean(
                        request.getHrContactName()
                )
        );

        onboarding.setHrContactEmail(
                clean(
                        request.getHrContactEmail()
                )
        );

        onboarding.setHrContactPhone(
                clean(
                        request.getHrContactPhone()
                )
        );

        onboarding.setInstructions(
                clean(
                        request.getInstructions()
                )
        );

        onboarding.setDocumentsRequired(
                clean(
                        request.getDocumentsRequired()
                )
        );

        CandidateOnboarding saved =
                candidateOnboardingRepository
                        .save(
                                onboarding
                        );

        return convertToResponse(
                saved
        );
    }


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    @Override
    @Transactional
    public CandidateOnboardingResponse updateStatus(
            Long recruiterId,
            Long onboardingId,
            OnboardingStatus status) {

        validateRecruiter(
                recruiterId
        );

        if (
                status == null
        ) {

            throw new RuntimeException(
                    "Onboarding status is required"
            );
        }

        CandidateOnboarding onboarding =
                getRecruiterOnboardingEntity(
                        recruiterId,
                        onboardingId
                );

        OnboardingStatus currentStatus =
                onboarding.getStatus();

        if (
                currentStatus == status
        ) {

            return convertToResponse(
                    onboarding
            );
        }

        validateStatusTransition(
                currentStatus,
                status
        );

        onboarding.setStatus(
                status
        );

        if (
                status ==
                        OnboardingStatus.JOINED
        ) {

            onboarding.setJoinedAt(
                    LocalDateTime.now()
            );
        }

        CandidateOnboarding saved =
                candidateOnboardingRepository
                        .save(
                                onboarding
                        );

        return convertToResponse(
                saved
        );
    }


    // =====================================================
    // RECRUITER ONBOARDINGS
    // =====================================================

    @Override
    @Transactional
    public List<CandidateOnboardingResponse> getRecruiterOnboardings(
            Long recruiterId) {

        validateRecruiter(
                recruiterId
        );

        /*
         * Backfill existing accepted offers.
         *
         * This is useful when onboarding is introduced
         * after some candidates have already accepted offers.
         */
        jobOfferRepository
                .findByApplicationJobRecruiterIdOrderByCreatedAtDesc(
                        recruiterId
                )
                .stream()
                .filter(
                        offer ->
                                offer.getStatus() ==
                                        OfferStatus.ACCEPTED
                )
                .forEach(
                        this::ensureOnboardingForAcceptedOffer
                );

        return candidateOnboardingRepository
                .findByOfferApplicationJobRecruiterIdOrderByCreatedAtDesc(
                        recruiterId
                )
                .stream()
                .map(
                        this::convertToResponse
                )
                .toList();
    }


    // =====================================================
    // RECRUITER ONBOARDING
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public CandidateOnboardingResponse getRecruiterOnboarding(
            Long recruiterId,
            Long onboardingId) {

        validateRecruiter(
                recruiterId
        );

        return convertToResponse(
                getRecruiterOnboardingEntity(
                        recruiterId,
                        onboardingId
                )
        );
    }


    // =====================================================
    // CANDIDATE ONBOARDINGS
    // =====================================================

    @Override
    @Transactional
    public List<CandidateOnboardingResponse> getCandidateOnboardings(
            Long candidateId) {

        validateCandidate(
                candidateId
        );

        /*
         * Backfill accepted offers created before this
         * feature was added.
         */
        jobOfferRepository
                .findByApplicationCandidateIdOrderByCreatedAtDesc(
                        candidateId
                )
                .stream()
                .filter(
                        offer ->
                                offer.getStatus() ==
                                        OfferStatus.ACCEPTED
                )
                .forEach(
                        this::ensureOnboardingForAcceptedOffer
                );

        return candidateOnboardingRepository
                .findByOfferApplicationCandidateIdOrderByCreatedAtDesc(
                        candidateId
                )
                .stream()
                .map(
                        this::convertToResponse
                )
                .toList();
    }


    // =====================================================
    // CANDIDATE ONBOARDING
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public CandidateOnboardingResponse getCandidateOnboarding(
            Long candidateId,
            Long onboardingId) {

        validateCandidate(
                candidateId
        );

        CandidateOnboarding onboarding =
                candidateOnboardingRepository
                        .findById(
                                onboardingId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Onboarding record not found"
                                        )
                        );

        Application application =
                onboarding
                        .getOffer()
                        .getApplication();

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
                    "You are not authorized to view this onboarding record"
            );
        }

        return convertToResponse(
                onboarding
        );
    }


    // =====================================================
    // STATUS TRANSITIONS
    // =====================================================

    private void validateStatusTransition(
            OnboardingStatus current,
            OnboardingStatus next) {

        if (
                current == null
        ) {

            throw new RuntimeException(
                    "Current onboarding status is missing"
            );
        }

        boolean valid =
                switch (
                        current
                ) {

                    case JOINING_PENDING ->
                            next ==
                                    OnboardingStatus.DOCUMENTS_PENDING ||
                            next ==
                                    OnboardingStatus.READY_TO_JOIN ||
                            next ==
                                    OnboardingStatus.NO_SHOW;

                    case DOCUMENTS_PENDING ->
                            next ==
                                    OnboardingStatus.READY_TO_JOIN ||
                            next ==
                                    OnboardingStatus.NO_SHOW;

                    case READY_TO_JOIN ->
                            next ==
                                    OnboardingStatus.JOINED ||
                            next ==
                                    OnboardingStatus.NO_SHOW;

                    case JOINED,
                         NO_SHOW ->
                            false;
                };

        if (
                !valid
        ) {

            throw new RuntimeException(
                    "Invalid onboarding status transition from " +
                    current +
                    " to " +
                    next
            );
        }
    }


    // =====================================================
    // VALIDATE EDITABLE
    // =====================================================

    private void validateEditable(
            CandidateOnboarding onboarding) {

        if (
                onboarding.getStatus() ==
                        OnboardingStatus.JOINED ||
                onboarding.getStatus() ==
                        OnboardingStatus.NO_SHOW
        ) {

            throw new RuntimeException(
                    "Completed onboarding records cannot be edited"
            );
        }
    }


    // =====================================================
    // VALIDATE ACCEPTED OFFER
    // =====================================================

    private void validateAcceptedOffer(
            JobOffer offer) {

        if (
                offer == null ||
                offer.getId() == null
        ) {

            throw new RuntimeException(
                    "Job offer is required"
            );
        }

        if (
                offer.getStatus() !=
                        OfferStatus.ACCEPTED
        ) {

            throw new RuntimeException(
                    "Onboarding can only be created for accepted offers"
            );
        }

        if (
                offer.getJoiningDate() == null
        ) {

            throw new RuntimeException(
                    "Accepted offer does not contain a joining date"
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
                    "Only recruiters can manage onboarding"
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
                    "Only candidates can view candidate onboarding"
            );
        }

        return candidate;
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
                    "You are not authorized to manage onboarding for this offer"
            );
        }

        return offer;
    }


    // =====================================================
    // RECRUITER ONBOARDING OWNERSHIP
    // =====================================================

    private CandidateOnboarding getRecruiterOnboardingEntity(
            Long recruiterId,
            Long onboardingId) {

        if (
                onboardingId == null
        ) {

            throw new RuntimeException(
                    "Onboarding ID is required"
            );
        }

        CandidateOnboarding onboarding =
                candidateOnboardingRepository
                        .findById(
                                onboardingId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Onboarding record not found"
                                        )
                        );

        JobOffer offer =
                onboarding.getOffer();

        Application application =
                offer != null
                        ? offer.getApplication()
                        : null;

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
                    "You are not authorized to manage this onboarding record"
            );
        }

        return onboarding;
    }


    // =====================================================
    // CLEAN STRING
    // =====================================================

    private String clean(
            String value) {

        if (
                value == null ||
                value.isBlank()
        ) {

            return null;
        }

        return value.trim();
    }


    // =====================================================
    // RESPONSE
    // =====================================================

    private CandidateOnboardingResponse convertToResponse(
            CandidateOnboarding onboarding) {

        CandidateOnboardingResponse response =
                new CandidateOnboardingResponse();

        response.setId(
                onboarding.getId()
        );

        response.setStatus(
                onboarding.getStatus()
        );

        response.setJoiningDate(
                onboarding.getJoiningDate()
        );

        response.setReportingTime(
                onboarding.getReportingTime()
        );

        response.setReportingLocation(
                onboarding.getReportingLocation()
        );

        response.setHrContactName(
                onboarding.getHrContactName()
        );

        response.setHrContactEmail(
                onboarding.getHrContactEmail()
        );

        response.setHrContactPhone(
                onboarding.getHrContactPhone()
        );

        response.setInstructions(
                onboarding.getInstructions()
        );

        response.setDocumentsRequired(
                onboarding.getDocumentsRequired()
        );

        response.setCreatedAt(
                onboarding.getCreatedAt()
        );

        response.setUpdatedAt(
                onboarding.getUpdatedAt()
        );

        response.setJoinedAt(
                onboarding.getJoinedAt()
        );

        JobOffer offer =
                onboarding.getOffer();

        if (
                offer != null
        ) {

            response.setOfferId(
                    offer.getId()
            );

            response.setOfferedSalary(
                    offer.getOfferedSalary()
            );

            response.setCurrency(
                    offer.getCurrency()
            );

            response.setOfferStatus(
                    offer.getStatus()
            );

            Application application =
                    offer.getApplication();

            if (
                    application != null
            ) {

                response.setApplicationId(
                        application.getId()
                );

                User candidate =
                        application.getCandidate();

                if (
                        candidate != null
                ) {

                    response.setCandidateId(
                            candidate.getId()
                    );

                    response.setCandidateName(
                            candidate.getName()
                    );

                    response.setCandidateEmail(
                            candidate.getEmail()
                    );
                }

                Job job =
                        application.getJob();

                if (
                        job != null
                ) {

                    response.setJobId(
                            job.getId()
                    );

                    response.setJobTitle(
                            job.getTitle()
                    );

                    User recruiter =
                            job.getRecruiter();

                    if (
                            recruiter != null
                    ) {

                        response.setRecruiterId(
                                recruiter.getId()
                        );

                        response.setRecruiterName(
                                recruiter.getName()
                        );
                    }
                }
            }
        }

        return response;
    }
}
