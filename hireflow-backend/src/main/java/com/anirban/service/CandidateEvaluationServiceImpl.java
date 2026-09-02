package com.anirban.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.anirban.dto.CandidateEvaluationRequest;
import com.anirban.dto.CandidateEvaluationResponse;

import com.anirban.entity.Application;
import com.anirban.entity.CandidateEvaluation;
import com.anirban.entity.Job;
import com.anirban.entity.Role;
import com.anirban.entity.User;

import com.anirban.repository.ApplicationRepository;
import com.anirban.repository.CandidateEvaluationRepository;
import com.anirban.repository.UserRepository;

@Service
public class CandidateEvaluationServiceImpl
        implements CandidateEvaluationService {

    private final CandidateEvaluationRepository
            candidateEvaluationRepository;

    private final ApplicationRepository
            applicationRepository;

    private final UserRepository
            userRepository;

    public CandidateEvaluationServiceImpl(
            CandidateEvaluationRepository candidateEvaluationRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository) {

        this.candidateEvaluationRepository =
                candidateEvaluationRepository;

        this.applicationRepository =
                applicationRepository;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // GET EVALUATION
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public CandidateEvaluationResponse getEvaluation(
            Long applicationId,
            Long recruiterId) {

        // Validate that authenticated user
        // is really a recruiter.
        validateRecruiter(
                recruiterId
        );

        // Also make sure the application belongs
        // to this recruiter's job.
        Application application =
                getOwnedApplication(
                        applicationId,
                        recruiterId
                );


        return candidateEvaluationRepository
                .findByApplicationIdAndRecruiterId(
                        application.getId(),
                        recruiterId
                )
                .map(
                        this::convertToResponse
                )
                .orElse(
                        null
                );
    }


    // =====================================================
    // CREATE / UPDATE EVALUATION
    // =====================================================

    @Override
    @Transactional
    public CandidateEvaluationResponse saveEvaluation(
            Long applicationId,
            Long recruiterId,
            CandidateEvaluationRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Evaluation request is required"
            );
        }

        User recruiter =
                validateRecruiter(
                        recruiterId
                );

        Application application =
                getOwnedApplication(
                        applicationId,
                        recruiterId
                );


        // =================================================
        // VALIDATE SCORES
        // =================================================

        validateScore(
                "Technical skills",
                request.getTechnicalSkills()
        );

        validateScore(
                "Communication",
                request.getCommunication()
        );

        validateScore(
                "Relevant experience",
                request.getRelevantExperience()
        );

        validateScore(
                "Culture fit",
                request.getCultureFit()
        );

        validateScore(
                "Interview performance",
                request.getInterviewPerformance()
        );


        // =================================================
        // CREATE OR UPDATE
        // =================================================

        CandidateEvaluation evaluation =
                candidateEvaluationRepository
                        .findByApplicationIdAndRecruiterId(
                                application.getId(),
                                recruiterId
                        )
                        .orElseGet(
                                CandidateEvaluation::new
                        );

        evaluation.setApplication(
                application
        );

        evaluation.setRecruiter(
                recruiter
        );

        evaluation.setTechnicalSkills(
                request.getTechnicalSkills()
        );

        evaluation.setCommunication(
                request.getCommunication()
        );

        evaluation.setRelevantExperience(
                request.getRelevantExperience()
        );

        evaluation.setCultureFit(
                request.getCultureFit()
        );

        evaluation.setInterviewPerformance(
                request.getInterviewPerformance()
        );


        // =================================================
        // CALCULATE OVERALL SCORE
        // =================================================

        double overallScore =
                (
                        request.getTechnicalSkills()
                        +
                        request.getCommunication()
                        +
                        request.getRelevantExperience()
                        +
                        request.getCultureFit()
                        +
                        request.getInterviewPerformance()
                ) / 5.0;

        overallScore =
                Math.round(
                        overallScore * 100.0
                ) / 100.0;

        evaluation.setOverallScore(
                overallScore
        );


        // =================================================
        // PRIVATE NOTES
        // =================================================

        if (
                request.getPrivateNotes() != null &&
                !request
                        .getPrivateNotes()
                        .isBlank()
        ) {

            evaluation.setPrivateNotes(
                    request
                            .getPrivateNotes()
                            .trim()
            );

        } else {

            evaluation.setPrivateNotes(
                    null
            );
        }


        CandidateEvaluation saved =
                candidateEvaluationRepository
                        .save(
                                evaluation
                        );

        return convertToResponse(
                saved
        );
    }


    // =====================================================
    // DELETE EVALUATION
    // =====================================================

    @Override
    @Transactional
    public void deleteEvaluation(
            Long applicationId,
            Long recruiterId) {

        validateRecruiter(
                recruiterId
        );

        getOwnedApplication(
                applicationId,
                recruiterId
        );

        CandidateEvaluation evaluation =
                candidateEvaluationRepository
                        .findByApplicationIdAndRecruiterId(
                                applicationId,
                                recruiterId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Candidate evaluation not found"
                                        )
                        );

        candidateEvaluationRepository
                .delete(
                        evaluation
                );
    }


    // =====================================================
    // VALIDATE RECRUITER
    // =====================================================

    private User validateRecruiter(
            Long recruiterId) {

        if (recruiterId == null) {

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
                    "Only recruiters can evaluate candidates"
            );
        }

        return recruiter;
    }


    // =====================================================
    // GET APPLICATION OWNED BY RECRUITER
    // =====================================================

    private Application getOwnedApplication(
            Long applicationId,
            Long recruiterId) {

        if (applicationId == null) {

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

        Job job =
                application.getJob();

        if (
                job == null ||
                job.getRecruiter() == null ||
                !job
                        .getRecruiter()
                        .getId()
                        .equals(
                                recruiterId
                        )
        ) {

            throw new RuntimeException(
                    "You are not authorized to evaluate this candidate"
            );
        }

        return application;
    }


    // =====================================================
    // SCORE VALIDATION
    // =====================================================

    private void validateScore(
            String fieldName,
            Integer score) {

        if (score == null) {

            throw new RuntimeException(
                    fieldName +
                    " score is required"
            );
        }

        if (
                score < 1 ||
                score > 5
        ) {

            throw new RuntimeException(
                    fieldName +
                    " score must be between 1 and 5"
            );
        }
    }


    // =====================================================
    // CONVERT TO RESPONSE
    // =====================================================

    private CandidateEvaluationResponse convertToResponse(
            CandidateEvaluation evaluation) {

        CandidateEvaluationResponse response =
                new CandidateEvaluationResponse();

        response.setId(
                evaluation.getId()
        );

        response.setTechnicalSkills(
                evaluation.getTechnicalSkills()
        );

        response.setCommunication(
                evaluation.getCommunication()
        );

        response.setRelevantExperience(
                evaluation.getRelevantExperience()
        );

        response.setCultureFit(
                evaluation.getCultureFit()
        );

        response.setInterviewPerformance(
                evaluation.getInterviewPerformance()
        );

        response.setOverallScore(
                evaluation.getOverallScore()
        );

        response.setPrivateNotes(
                evaluation.getPrivateNotes()
        );

        response.setCreatedAt(
                evaluation.getCreatedAt()
        );

        response.setUpdatedAt(
                evaluation.getUpdatedAt()
        );


        // =================================================
        // APPLICATION
        // =================================================

        Application application =
                evaluation.getApplication();

        if (application != null) {

            response.setApplicationId(
                    application.getId()
            );


            // =============================================
            // CANDIDATE
            // =============================================

            if (
                    application.getCandidate() != null
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
            }


            // =============================================
            // JOB
            // =============================================

            if (
                    application.getJob() != null
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