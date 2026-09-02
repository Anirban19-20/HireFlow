package com.anirban.service;

import com.anirban.dto.SavedJobResponse;
import com.anirban.entity.Job;
import com.anirban.entity.RecruiterProfile;
import com.anirban.entity.Role;
import com.anirban.entity.SavedJob;
import com.anirban.entity.User;
import com.anirban.repository.JobRepository;
import com.anirban.repository.RecruiterProfileRepository;
import com.anirban.repository.SavedJobRepository;
import com.anirban.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SavedJobServiceImpl
        implements SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;

    public SavedJobServiceImpl(
            SavedJobRepository savedJobRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            RecruiterProfileRepository recruiterProfileRepository) {

        this.savedJobRepository =
                savedJobRepository;

        this.userRepository =
                userRepository;

        this.jobRepository =
                jobRepository;

        this.recruiterProfileRepository =
                recruiterProfileRepository;
    }

    // =====================================================
    // SAVE JOB
    // =====================================================

    @Override
    @Transactional
    public SavedJobResponse saveJob(
            Long candidateId,
            Long jobId) {

        // =================================================
        // VALIDATE CANDIDATE
        // =================================================

        User candidate =
                getCandidate(candidateId);

        // =================================================
        // GET JOB
        // =================================================

        Job job =
                jobRepository
                        .findById(jobId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Job not found"
                                )
                        );

        // =================================================
        // CHECK DUPLICATE SAVED JOB
        // =================================================

        if (savedJobRepository
                .existsByCandidateIdAndJobId(
                        candidateId,
                        jobId
                )) {

            throw new RuntimeException(
                    "Job is already saved"
            );
        }

        // =================================================
        // CREATE SAVED JOB
        // =================================================

        SavedJob savedJob =
                new SavedJob();

        savedJob.setCandidate(
                candidate
        );

        savedJob.setJob(
                job
        );

        // =================================================
        // SAVE
        // =================================================

        SavedJob saved =
                savedJobRepository.save(
                        savedJob
                );

        return convertToResponse(
                saved
        );
    }

    // =====================================================
    // GET CANDIDATE SAVED JOBS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<SavedJobResponse> getSavedJobs(
            Long candidateId) {

        // =================================================
        // VALIDATE CANDIDATE
        // =================================================

        getCandidate(candidateId);

        // =================================================
        // GET SAVED JOBS
        // =================================================

        return savedJobRepository
                .findByCandidateIdOrderBySavedAtDesc(
                        candidateId
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =====================================================
    // REMOVE SAVED JOB
    // =====================================================

    @Override
    @Transactional
    public void removeSavedJob(
            Long candidateId,
            Long jobId) {

        // =================================================
        // VALIDATE CANDIDATE
        // =================================================

        getCandidate(candidateId);

        // =================================================
        // FIND SAVED JOB
        // =================================================

        SavedJob savedJob =
                savedJobRepository
                        .findByCandidateIdAndJobId(
                                candidateId,
                                jobId
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Saved job not found"
                                )
                        );

        // =================================================
        // DELETE
        // =================================================

        savedJobRepository.delete(
                savedJob
        );
    }

    // =====================================================
    // VALIDATE CANDIDATE
    // =====================================================

    private User getCandidate(
            Long candidateId) {

        if (candidateId == null) {

            throw new RuntimeException(
                    "Candidate ID is required"
            );
        }

        User candidate =
                userRepository
                        .findById(candidateId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Candidate not found"
                                )
                        );

        if (candidate.getRole() !=
                Role.CANDIDATE) {

            throw new RuntimeException(
                    "Only candidates can manage saved jobs"
            );
        }

        return candidate;
    }

    // =====================================================
    // GET COMPANY NAME
    // =====================================================

    private String getCompanyName(
            Job job) {

        if (job == null) {

            throw new RuntimeException(
                    "Job information is missing"
            );
        }

        User recruiter =
                job.getRecruiter();

        if (recruiter == null) {

            throw new RuntimeException(
                    "Job recruiter information is missing"
            );
        }

        RecruiterProfile recruiterProfile =
                recruiterProfileRepository
                        .findByUserId(
                                recruiter.getId()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Recruiter profile not found"
                                )
                        );

        String companyName =
                recruiterProfile
                        .getCompanyName();

        if (companyName == null ||
                companyName.isBlank()) {

            return "Company";
        }

        return companyName.trim();
    }

    // =====================================================
    // ENTITY -> RESPONSE DTO
    // =====================================================

    private SavedJobResponse convertToResponse(
            SavedJob savedJob) {

        if (savedJob == null) {

            throw new RuntimeException(
                    "Saved job cannot be null"
            );
        }

        Job job =
                savedJob.getJob();

        if (job == null) {

            throw new RuntimeException(
                    "Saved job information is missing"
            );
        }

        SavedJobResponse response =
                new SavedJobResponse();

        // =================================================
        // SAVED JOB
        // =================================================

        response.setSavedJobId(
                savedJob.getId()
        );

        response.setSavedAt(
                savedJob.getSavedAt()
        );

        // =================================================
        // JOB
        // =================================================

        response.setJobId(
                job.getId()
        );

        response.setTitle(
                job.getTitle()
        );

        // =================================================
        // COMPANY NAME
        //
        // IMPORTANT:
        // Do not use:
        //
        // job.getRecruiter().getName()
        //
        // User.name is the recruiter's personal/account name.
        //
        // Company name comes from:
        //
        // Job
        //   -> Recruiter
        //   -> RecruiterProfile
        //   -> companyName
        // =================================================

        response.setCompanyName(
                getCompanyName(job)
        );

        response.setLocation(
                job.getLocation()
        );

        response.setEmploymentType(
                job.getEmploymentType()
        );

        response.setExperienceRequired(
                job.getExperienceRequired()
        );

        response.setSalaryMin(
                job.getSalaryMin()
        );

        response.setSalaryMax(
                job.getSalaryMax()
        );

        response.setSkills(
                job.getSkills()
        );

        response.setStatus(
                job.getStatus()
        );

        response.setDeadline(
                job.getDeadline()
        );

        return response;
    }
}