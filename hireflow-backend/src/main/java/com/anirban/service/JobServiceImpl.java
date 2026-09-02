package com.anirban.service;

import com.anirban.dto.JobRequest;
import com.anirban.dto.JobResponse;
import com.anirban.dto.JobSearchRequest;

import com.anirban.entity.EmploymentType;
import com.anirban.entity.Job;
import com.anirban.entity.JobStatus;
import com.anirban.entity.RecruiterProfile;
import com.anirban.entity.Role;
import com.anirban.entity.User;

import com.anirban.repository.JobRepository;
import com.anirban.repository.RecruiterProfileRepository;
import com.anirban.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;


@Service
public class JobServiceImpl
        implements JobService {


    private final JobRepository
            jobRepository;

    private final UserRepository
            userRepository;

    private final RecruiterProfileRepository
            recruiterProfileRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public JobServiceImpl(
            JobRepository jobRepository,
            UserRepository userRepository,
            RecruiterProfileRepository recruiterProfileRepository) {

        this.jobRepository =
                jobRepository;

        this.userRepository =
                userRepository;

        this.recruiterProfileRepository =
                recruiterProfileRepository;
    }


    // =====================================================
    // RECRUITER - CREATE JOB
    // =====================================================

    @Override
    @Transactional
    public JobResponse createJob(
            Long recruiterId,
            JobRequest request) {


        // =================================================
        // VALIDATE RECRUITER
        // =================================================

        User recruiter =
                getRecruiter(
                        recruiterId
                );


        // =================================================
        // VALIDATE JOB REQUEST
        // =================================================

        validateJob(
                request
        );


        // =================================================
        // RECRUITER MUST HAVE A COMPANY PROFILE
        //
        // IMPORTANT:
        // Job creation should remain strict.
        // =================================================

        getRequiredCompanyName(
                recruiterId
        );


        // =================================================
        // CREATE JOB
        // =================================================

        Job job =
                new Job();


        job.setRecruiter(
                recruiter
        );


        job.setTitle(
                request
                        .getTitle()
                        .trim()
        );


        job.setDescription(
                request
                        .getDescription()
                        .trim()
        );


        job.setLocation(
                request
                        .getLocation()
                        .trim()
        );


        job.setEmploymentType(
                request
                        .getEmploymentType()
        );


        job.setExperienceRequired(
                request
                        .getExperienceRequired()
        );


        job.setSalaryMin(
                request
                        .getSalaryMin()
        );


        job.setSalaryMax(
                request
                        .getSalaryMax()
        );


        if (
                request.getSkills() != null
        ) {

            job.setSkills(
                    request
                            .getSkills()
                            .trim()
            );

        } else {

            job.setSkills(
                    null
            );
        }


        job.setDeadline(
                request
                        .getDeadline()
        );


        // =================================================
        // NEW JOBS ARE OPEN
        // =================================================

        job.setStatus(
                JobStatus.OPEN
        );


        // =================================================
        // SAVE
        // =================================================

        Job savedJob =
                jobRepository
                        .save(
                                job
                        );


        return convertToResponse(
                savedJob
        );
    }


    // =====================================================
    // RECRUITER - GET MY JOBS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse>
    getRecruiterJobs(
            Long recruiterId) {


        // =================================================
        // VALIDATE RECRUITER
        // =================================================

        getRecruiter(
                recruiterId
        );


        // =================================================
        // GET JOBS
        // =================================================

        return jobRepository
                .findByRecruiterId(
                        recruiterId
                )
                .stream()
                .map(
                        this::convertToResponse
                )
                .toList();
    }


    // =====================================================
    // RECRUITER - GET SINGLE JOB
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public JobResponse getRecruiterJob(
            Long recruiterId,
            Long jobId) {


        // =================================================
        // VALIDATE RECRUITER
        // =================================================

        getRecruiter(
                recruiterId
        );


        // =================================================
        // VALIDATE JOB ID
        // =================================================

        if (
                jobId == null
        ) {

            throw new RuntimeException(
                    "Job ID is required"
            );
        }


        // =================================================
        // FIND OWNED JOB
        // =================================================

        Job job =
                jobRepository
                        .findByIdAndRecruiterId(
                                jobId,
                                recruiterId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job not found or you do not have permission to access this job"
                                        )
                        );


        return convertToResponse(
                job
        );
    }


    // =====================================================
    // RECRUITER - UPDATE JOB
    // =====================================================

    @Override
    @Transactional
    public JobResponse updateJob(
            Long recruiterId,
            Long jobId,
            JobRequest request) {


        // =================================================
        // VALIDATE RECRUITER
        // =================================================

        getRecruiter(
                recruiterId
        );


        // =================================================
        // VALIDATE JOB ID
        // =================================================

        if (
                jobId == null
        ) {

            throw new RuntimeException(
                    "Job ID is required"
            );
        }


        // =================================================
        // VALIDATE REQUEST
        // =================================================

        validateJob(
                request
        );


        // =================================================
        // RECRUITER COMPANY PROFILE MUST STILL EXIST
        // =================================================

        getRequiredCompanyName(
                recruiterId
        );


        // =================================================
        // FIND OWNED JOB
        // =================================================

        Job job =
                jobRepository
                        .findByIdAndRecruiterId(
                                jobId,
                                recruiterId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job not found or you do not have permission to update this job"
                                        )
                        );


        // =================================================
        // CLOSED JOBS CANNOT BE EDITED
        // =================================================

        if (
                job.getStatus() ==
                        JobStatus.CLOSED
        ) {

            throw new RuntimeException(
                    "Closed jobs cannot be updated"
            );
        }


        // =================================================
        // UPDATE VALUES
        // =================================================

        job.setTitle(
                request
                        .getTitle()
                        .trim()
        );


        job.setDescription(
                request
                        .getDescription()
                        .trim()
        );


        job.setLocation(
                request
                        .getLocation()
                        .trim()
        );


        job.setEmploymentType(
                request
                        .getEmploymentType()
        );


        job.setExperienceRequired(
                request
                        .getExperienceRequired()
        );


        job.setSalaryMin(
                request
                        .getSalaryMin()
        );


        job.setSalaryMax(
                request
                        .getSalaryMax()
        );


        if (
                request.getSkills() != null
        ) {

            job.setSkills(
                    request
                            .getSkills()
                            .trim()
            );

        } else {

            job.setSkills(
                    null
            );
        }


        job.setDeadline(
                request
                        .getDeadline()
        );


        // =================================================
        // SAVE
        // =================================================

        Job updatedJob =
                jobRepository
                        .save(
                                job
                        );


        return convertToResponse(
                updatedJob
        );
    }


    // =====================================================
    // RECRUITER - DELETE JOB
    // =====================================================

    @Override
    @Transactional
    public void deleteJob(
            Long recruiterId,
            Long jobId) {


        // =================================================
        // VALIDATE RECRUITER
        // =================================================

        getRecruiter(
                recruiterId
        );


        if (
                jobId == null
        ) {

            throw new RuntimeException(
                    "Job ID is required"
            );
        }


        // =================================================
        // FIND OWNED JOB
        // =================================================

        Job job =
                jobRepository
                        .findByIdAndRecruiterId(
                                jobId,
                                recruiterId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job not found or you do not have permission to delete this job"
                                        )
                        );


        // =================================================
        // DELETE
        // =================================================

        jobRepository
                .delete(
                        job
                );
    }


    // =====================================================
    // RECRUITER - CLOSE JOB
    // =====================================================

    @Override
    @Transactional
    public JobResponse closeJob(
            Long recruiterId,
            Long jobId) {


        // =================================================
        // VALIDATE RECRUITER
        // =================================================

        getRecruiter(
                recruiterId
        );


        if (
                jobId == null
        ) {

            throw new RuntimeException(
                    "Job ID is required"
            );
        }


        // =================================================
        // FIND OWNED JOB
        // =================================================

        Job job =
                jobRepository
                        .findByIdAndRecruiterId(
                                jobId,
                                recruiterId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job not found or you do not have permission to close this job"
                                        )
                        );


        // =================================================
        // ALREADY CLOSED
        // =================================================

        if (
                job.getStatus() ==
                        JobStatus.CLOSED
        ) {

            throw new RuntimeException(
                    "Job is already closed"
            );
        }


        // =================================================
        // CLOSE
        // =================================================

        job.setStatus(
                JobStatus.CLOSED
        );


        Job updatedJob =
                jobRepository
                        .save(
                                job
                        );


        return convertToResponse(
                updatedJob
        );
    }


    // =====================================================
    // PUBLIC / CANDIDATE - SEARCH JOBS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> searchJobs(
            JobSearchRequest request) {


        // =================================================
        // EMPTY SEARCH REQUEST IS VALID
        //
        // Home page sends:
        //
        // {}
        //
        // which should mean "show all open jobs".
        // =================================================

        if (
                request == null
        ) {

            request =
                    new JobSearchRequest();
        }


        // =================================================
        // ONLY OPEN JOBS ARE PUBLIC
        // =================================================

        List<Job> jobs =
                jobRepository
                        .findByStatus(
                                JobStatus.OPEN
                        );


        // =================================================
        // NORMALIZE PARAMETERS
        // =================================================

        String keyword =
                normalize(
                        request.getKeyword()
                );


        String location =
                normalize(
                        request.getLocation()
                );


        String skill =
                normalize(
                        request.getSkill()
                );


        EmploymentType employmentType =
                request
                        .getEmploymentType();


        Integer minExperience =
                request
                        .getMinExperience();


        Double maxSalary =
                request
                        .getMaxSalary();


        // =================================================
        // VALIDATE SEARCH PARAMETERS
        // =================================================

        if (
                minExperience != null &&
                minExperience < 0
        ) {

            throw new RuntimeException(
                    "Minimum experience cannot be negative"
            );
        }


        if (
                maxSalary != null &&
                maxSalary < 0
        ) {

            throw new RuntimeException(
                    "Maximum salary cannot be negative"
            );
        }


        // =================================================
        // KEYWORD FILTER
        // =================================================

        if (
                keyword != null
        ) {

            String searchKeyword =
                    keyword
                            .toLowerCase();


            jobs =
                    jobs
                            .stream()
                            .filter(
                                    job -> {

                                        boolean matchesTitle =
                                                contains(
                                                        job.getTitle(),
                                                        searchKeyword
                                                );


                                        boolean matchesDescription =
                                                contains(
                                                        job.getDescription(),
                                                        searchKeyword
                                                );


                                        boolean matchesSkills =
                                                contains(
                                                        job.getSkills(),
                                                        searchKeyword
                                                );


                                        /*
                                         * IMPORTANT:
                                         *
                                         * Public search uses SAFE
                                         * company-name resolution.
                                         *
                                         * A legacy job with a missing
                                         * recruiter profile must NOT
                                         * crash the entire search.
                                         */

                                        boolean matchesCompany =
                                                contains(
                                                        getSafeCompanyName(
                                                                job.getRecruiter()
                                                        ),
                                                        searchKeyword
                                                );


                                        return matchesTitle
                                                ||
                                                matchesDescription
                                                ||
                                                matchesSkills
                                                ||
                                                matchesCompany;
                                    }
                            )
                            .toList();
        }


        // =================================================
        // LOCATION FILTER
        // =================================================

        if (
                location != null
        ) {

            String searchLocation =
                    location
                            .toLowerCase();


            jobs =
                    jobs
                            .stream()
                            .filter(
                                    job ->
                                            contains(
                                                    job.getLocation(),
                                                    searchLocation
                                            )
                            )
                            .toList();
        }


        // =================================================
        // EMPLOYMENT TYPE FILTER
        // =================================================

        if (
                employmentType != null
        ) {

            jobs =
                    jobs
                            .stream()
                            .filter(
                                    job ->
                                            Objects.equals(
                                                    job.getEmploymentType(),
                                                    employmentType
                                            )
                            )
                            .toList();
        }


        // =================================================
        // MINIMUM EXPERIENCE FILTER
        // =================================================

        if (
                minExperience != null
        ) {

            jobs =
                    jobs
                            .stream()
                            .filter(
                                    job -> {

                                        Integer experience =
                                                job
                                                        .getExperienceRequired();


                                        return experience != null
                                                &&
                                                experience >=
                                                        minExperience;
                                    }
                            )
                            .toList();
        }


        // =================================================
        // MAXIMUM SALARY FILTER
        // =================================================

        if (
                maxSalary != null
        ) {

            jobs =
                    jobs
                            .stream()
                            .filter(
                                    job -> {

                                        Double salary =
                                                job
                                                        .getSalaryMax();


                                        return salary != null
                                                &&
                                                salary <=
                                                        maxSalary;
                                    }
                            )
                            .toList();
        }


        // =================================================
        // SKILL FILTER
        // =================================================

        if (
                skill != null
        ) {

            String searchSkill =
                    skill
                            .toLowerCase();


            jobs =
                    jobs
                            .stream()
                            .filter(
                                    job ->
                                            contains(
                                                    job.getSkills(),
                                                    searchSkill
                                            )
                            )
                            .toList();
        }


        // =================================================
        // ENTITY -> DTO
        // =================================================

        return jobs
                .stream()
                .map(
                        this::convertToResponse
                )
                .toList();
    }


    // =====================================================
    // PUBLIC / CANDIDATE - GET SINGLE JOB
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public JobResponse getPublicJob(
            Long jobId) {


        if (
                jobId == null
        ) {

            throw new RuntimeException(
                    "Job ID is required"
            );
        }


        Job job =
                jobRepository
                        .findById(
                                jobId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Job not found"
                                        )
                        );


        // =================================================
        // ONLY OPEN JOBS ARE PUBLIC
        // =================================================

        if (
                job.getStatus() !=
                        JobStatus.OPEN
        ) {

            throw new RuntimeException(
                    "This job is no longer available"
            );
        }


        return convertToResponse(
                job
        );
    }


    // =====================================================
    // VALIDATE RECRUITER
    // =====================================================

    private User getRecruiter(
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
                    "Only recruiters can manage jobs"
            );
        }


        return recruiter;
    }


    // =====================================================
    // STRICT - GET RECRUITER PROFILE
    //
    // Used when recruiter is performing management actions.
    // =====================================================

    private RecruiterProfile
    getRecruiterProfile(
            Long recruiterId) {


        if (
                recruiterId == null
        ) {

            throw new RuntimeException(
                    "Recruiter ID is required"
            );
        }


        return recruiterProfileRepository
                .findByUserId(
                        recruiterId
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Recruiter profile not found. Please complete your recruiter profile first."
                                )
                );
    }


    // =====================================================
    // STRICT - REQUIRED COMPANY NAME
    //
    // Used for:
    //
    // CREATE JOB
    // UPDATE JOB
    //
    // Recruiters must complete their company profile.
    // =====================================================

    private String getRequiredCompanyName(
            Long recruiterId) {


        RecruiterProfile profile =
                getRecruiterProfile(
                        recruiterId
                );


        String companyName =
                profile
                        .getCompanyName();


        if (
                companyName == null ||
                companyName.isBlank()
        ) {

            throw new RuntimeException(
                    "Company name is required in recruiter profile"
            );
        }


        return companyName
                .trim();
    }


    // =====================================================
    // SAFE - COMPANY NAME FOR PUBLIC RESPONSES
    //
    // IMPORTANT:
    //
    // Public job search must never fail only because an
    // old/legacy recruiter profile is missing.
    // =====================================================

    private String getSafeCompanyName(
            User recruiter) {


        // =================================================
        // NO RECRUITER RELATION
        // =================================================

        if (
                recruiter == null
        ) {

            return "Hiring Company";
        }


        Long recruiterId =
                recruiter
                        .getId();


        if (
                recruiterId == null
        ) {

            return getRecruiterFallbackName(
                    recruiter
            );
        }


        // =================================================
        // TRY RECRUITER PROFILE
        // =================================================

        RecruiterProfile profile =
                recruiterProfileRepository
                        .findByUserId(
                                recruiterId
                        )
                        .orElse(
                                null
                        );


        if (
                profile != null
        ) {

            String companyName =
                    profile
                            .getCompanyName();


            if (
                    companyName != null &&
                    !companyName.isBlank()
            ) {

                return companyName
                        .trim();
            }
        }


        // =================================================
        // FALLBACK
        // =================================================

        return getRecruiterFallbackName(
                recruiter
        );
    }


    // =====================================================
    // RECRUITER FALLBACK NAME
    // =====================================================

    private String getRecruiterFallbackName(
            User recruiter) {


        if (
                recruiter != null &&
                recruiter.getName() != null &&
                !recruiter
                        .getName()
                        .isBlank()
        ) {

            return recruiter
                    .getName()
                    .trim();
        }


        return "Hiring Company";
    }


    // =====================================================
    // VALIDATE JOB REQUEST
    // =====================================================

    private void validateJob(
            JobRequest request) {


        // =================================================
        // REQUEST
        // =================================================

        if (
                request == null
        ) {

            throw new RuntimeException(
                    "Job request cannot be null"
            );
        }


        // =================================================
        // TITLE
        // =================================================

        if (
                request.getTitle() == null ||
                request
                        .getTitle()
                        .isBlank()
        ) {

            throw new RuntimeException(
                    "Job title is required"
            );
        }


        // =================================================
        // DESCRIPTION
        // =================================================

        if (
                request.getDescription() == null ||
                request
                        .getDescription()
                        .isBlank()
        ) {

            throw new RuntimeException(
                    "Job description is required"
            );
        }


        // =================================================
        // LOCATION
        // =================================================

        if (
                request.getLocation() == null ||
                request
                        .getLocation()
                        .isBlank()
        ) {

            throw new RuntimeException(
                    "Job location is required"
            );
        }


        // =================================================
        // EMPLOYMENT TYPE
        // =================================================

        if (
                request.getEmploymentType() ==
                        null
        ) {

            throw new RuntimeException(
                    "Employment type is required"
            );
        }


        // =================================================
        // EXPERIENCE
        // =================================================

        if (
                request.getExperienceRequired() !=
                        null &&
                request.getExperienceRequired() <
                        0
        ) {

            throw new RuntimeException(
                    "Experience cannot be negative"
            );
        }


        // =================================================
        // MINIMUM SALARY
        // =================================================

        if (
                request.getSalaryMin() !=
                        null &&
                request.getSalaryMin() <
                        0
        ) {

            throw new RuntimeException(
                    "Minimum salary cannot be negative"
            );
        }


        // =================================================
        // MAXIMUM SALARY
        // =================================================

        if (
                request.getSalaryMax() !=
                        null &&
                request.getSalaryMax() <
                        0
        ) {

            throw new RuntimeException(
                    "Maximum salary cannot be negative"
            );
        }


        // =================================================
        // SALARY RANGE
        // =================================================

        if (
                request.getSalaryMin() != null &&
                request.getSalaryMax() != null &&
                request.getSalaryMin() >
                        request.getSalaryMax()
        ) {

            throw new RuntimeException(
                    "Minimum salary cannot exceed maximum salary"
            );
        }


        // =================================================
        // EMPTY SKILLS -> NULL
        // =================================================

        if (
                request.getSkills() !=
                        null &&
                request
                        .getSkills()
                        .isBlank()
        ) {

            request.setSkills(
                    null
            );
        }
    }


    // =====================================================
    // NORMALIZE SEARCH INPUT
    // =====================================================

    private String normalize(
            String value) {


        if (
                value == null ||
                value.isBlank()
        ) {

            return null;
        }


        return value
                .trim();
    }


    // =====================================================
    // STRING CONTAINS
    // =====================================================

    private boolean contains(
            String value,
            String search) {


        if (
                value == null ||
                search == null
        ) {

            return false;
        }


        return value
                .toLowerCase()
                .contains(
                        search
                );
    }


    // =====================================================
    // ENTITY -> RESPONSE DTO
    // =====================================================

    private JobResponse convertToResponse(
            Job job) {


        if (
                job == null
        ) {

            throw new RuntimeException(
                    "Job cannot be null"
            );
        }


        // =================================================
        // RECRUITER
        //
        // Public listing must be defensive.
        // =================================================

        User recruiter =
                job
                        .getRecruiter();


        Long recruiterId =
                recruiter != null
                        ? recruiter.getId()
                        : null;


        // =================================================
        // SAFE COMPANY NAME
        //
        // This is the main 500 fix.
        // =================================================

        String companyName =
                getSafeCompanyName(
                        recruiter
                );


        // =================================================
        // RESPONSE
        // =================================================

        return new JobResponse(

                job.getId(),

                recruiterId,

                companyName,

                job.getTitle(),

                job.getDescription(),

                job.getLocation(),

                job.getEmploymentType(),

                job.getExperienceRequired(),

                job.getSalaryMin(),

                job.getSalaryMax(),

                job.getSkills(),

                job.getStatus(),

                job.getCreatedAt(),

                job.getDeadline()
        );
    }
}