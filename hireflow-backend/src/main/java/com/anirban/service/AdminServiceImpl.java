package com.anirban.service;

import com.anirban.entity.Application;
import com.anirban.entity.ApplicationStatus;
import com.anirban.entity.CandidateProfile;
import com.anirban.entity.Job;
import com.anirban.entity.JobStatus;
import com.anirban.entity.RecruiterProfile;
import com.anirban.entity.Role;
import com.anirban.entity.User;

import com.anirban.repository.ApplicationRepository;
import com.anirban.repository.CandidateProfileRepository;
import com.anirban.repository.JobRepository;
import com.anirban.repository.RecruiterProfileRepository;
import com.anirban.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl
        implements AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;

    public AdminServiceImpl(
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            CandidateProfileRepository candidateProfileRepository,
            RecruiterProfileRepository recruiterProfileRepository) {

        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
    }

    // =====================================================
    // DASHBOARD
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard() {

        List<User> users = userRepository.findAll();
        List<Job> jobs = jobRepository.findAll();
        List<Application> applications = applicationRepository.findAll();

        long recruiterCount =
                userRepository.countByRole(
                        Role.RECRUITER
                );

        long candidateCount =
                userRepository.countByRole(
                        Role.CANDIDATE
                );

        long adminCount =
                userRepository.countByRole(
                        Role.ADMIN
                );

        long openJobCount =
                jobRepository.countByStatus(
                        JobStatus.OPEN
                );

        long closedJobCount =
                jobRepository.countByStatus(
                        JobStatus.CLOSED
                );

        long selectedCount =
                applicationRepository.countByStatus(
                        ApplicationStatus.SELECTED
                );

        long interviewCount =
                applicationRepository.countByStatus(
                        ApplicationStatus.INTERVIEW
                );

        Map<String, Object> dashboard =
                new LinkedHashMap<>();

        dashboard.put("totalUsers", users.size());
        dashboard.put("totalRecruiters", recruiterCount);
        dashboard.put("totalCandidates", candidateCount);
        dashboard.put("totalAdmins", adminCount);
        dashboard.put("totalJobs", jobs.size());
        dashboard.put("openJobs", openJobCount);
        dashboard.put("closedJobs", closedJobCount);
        dashboard.put("totalApplications", applications.size());
        dashboard.put("interviewApplications", interviewCount);
        dashboard.put("selectedApplications", selectedCount);

        dashboard.put(
                "recentUsers",
                users.stream()
                        .sorted(
                                Comparator.comparing(
                                        User::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                        )
                        .limit(5)
                        .map(this::mapUser)
                        .toList()
        );

        Map<Long, Long> applicationCountsByJob =
                getApplicationCountsByJob(applications);

        dashboard.put(
                "recentJobs",
                jobs.stream()
                        .sorted(
                                Comparator.comparing(
                                        Job::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                        )
                        .limit(5)
                        .map(job ->
                                mapJob(
                                        job,
                                        applicationCountsByJob.getOrDefault(
                                                job.getId(),
                                                0L
                                        )
                                )
                        )
                        .toList()
        );

        dashboard.put(
                "recentApplications",
                applications.stream()
                        .sorted(
                                Comparator.comparing(
                                        Application::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                        )
                        .limit(5)
                        .map(this::mapApplication)
                        .toList()
        );

        return dashboard;
    }

    // =====================================================
    // USERS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUsers() {

        return userRepository
                .findAll()
                .stream()
                .sorted(
                        Comparator.comparing(
                                User::getId,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .map(this::mapUser)
                .toList();
    }

    // =====================================================
    // JOBS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getJobs() {

        List<Application> applications =
                applicationRepository.findAll();

        Map<Long, Long> applicationCountsByJob =
                getApplicationCountsByJob(applications);

        return jobRepository
                .findAll()
                .stream()
                .sorted(
                        Comparator.comparing(
                                Job::getId,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .map(job ->
                        mapJob(
                                job,
                                applicationCountsByJob.getOrDefault(
                                        job.getId(),
                                        0L
                                )
                        )
                )
                .toList();
    }
    
	 // =====================================================
	 // DELETE INVALID / BAD JOB
	 // =====================================================
	
	 @Override
	 @Transactional
	 public void deleteJob(
	         Long jobId) {
	
	     // =================================================
	     // VALIDATE JOB ID
	     // =================================================
	
	     if (jobId == null || jobId <= 0) {
	
	         throw new RuntimeException(
	                 "Invalid job id"
	         );
	     }
	
	
	     // =================================================
	     // FIND JOB
	     // =================================================
	
	     Job job =
	             jobRepository
	                     .findById(jobId)
	                     .orElseThrow(
	                             () ->
	                                     new RuntimeException(
	                                             "Job not found"
	                                     )
	                     );
	
	
	     // =================================================
	     // DELETE JOB
	     // =================================================
	
	     jobRepository.delete(job);
	 }

    // =====================================================
    // APPLICATIONS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getApplications() {

        return applicationRepository
                .findAll()
                .stream()
                .sorted(
                        Comparator.comparing(
                                Application::getId,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .map(this::mapApplication)
                .toList();
    }

    // =====================================================
    // RECRUITERS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecruiters() {

        List<Job> jobs = jobRepository.findAll();

        Map<Long, Long> jobCountsByRecruiter =
                jobs.stream()
                        .filter(job -> job.getRecruiter() != null)
                        .filter(job -> job.getRecruiter().getId() != null)
                        .collect(
                                Collectors.groupingBy(
                                        job -> job.getRecruiter().getId(),
                                        Collectors.counting()
                                )
                        );

        return userRepository
                .findByRole(
                        Role.RECRUITER
                )
                .stream()
                .sorted(
                        Comparator.comparing(
                                User::getId,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .map(recruiter -> {

                    Map<String, Object> response =
                            new LinkedHashMap<>(
                                    mapUser(recruiter)
                            );

                    RecruiterProfile profile =
                            recruiterProfileRepository
                                    .findByUserId(
                                            recruiter.getId()
                                    )
                                    .orElse(null);

                    response.put(
                            "companyName",
                            profile != null
                                    ? profile.getCompanyName()
                                    : null
                    );

                    response.put(
                            "companyDescription",
                            profile != null
                                    ? profile.getCompanyDescription()
                                    : null
                    );

                    response.put(
                            "website",
                            profile != null
                                    ? profile.getWebsite()
                                    : null
                    );

                    response.put(
                            "jobCount",
                            jobCountsByRecruiter.getOrDefault(
                                    recruiter.getId(),
                                    0L
                            )
                    );

                    response.put(
                            "profileComplete",
                            profile != null &&
                                    profile.getCompanyName() != null &&
                                    !profile.getCompanyName().isBlank()
                    );

                    return response;
                })
                .toList();
    }

    // =====================================================
    // CANDIDATES
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCandidates() {

        List<Application> applications =
                applicationRepository.findAll();

        Map<Long, Long> applicationCountsByCandidate =
                applications.stream()
                        .filter(application ->
                                application.getCandidate() != null
                        )
                        .filter(application ->
                                application.getCandidate().getId() != null
                        )
                        .collect(
                                Collectors.groupingBy(
                                        application ->
                                                application
                                                        .getCandidate()
                                                        .getId(),
                                        Collectors.counting()
                                )
                        );

        return userRepository
                .findByRole(
                        Role.CANDIDATE
                )
                .stream()
                .sorted(
                        Comparator.comparing(
                                User::getId,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .map(candidate -> {

                    Map<String, Object> response =
                            new LinkedHashMap<>(
                                    mapUser(candidate)
                            );

                    CandidateProfile profile =
                            candidateProfileRepository
                                    .findByUserId(
                                            candidate.getId()
                                    )
                                    .orElse(null);

                    response.put(
                            "phone",
                            profile != null
                                    ? profile.getPhone()
                                    : null
                    );

                    response.put(
                            "location",
                            profile != null
                                    ? profile.getLocation()
                                    : null
                    );

                    response.put(
                            "skills",
                            profile != null
                                    ? profile.getSkills()
                                    : null
                    );

                    response.put(
                            "experience",
                            profile != null
                                    ? profile.getExperience()
                                    : null
                    );

                    response.put(
                            "education",
                            profile != null
                                    ? profile.getEducation()
                                    : null
                    );

                    response.put(
                            "resumeUrl",
                            profile != null
                                    ? profile.getResumeUrl()
                                    : null
                    );

                    response.put(
                            "applicationCount",
                            applicationCountsByCandidate.getOrDefault(
                                    candidate.getId(),
                                    0L
                            )
                    );

                    response.put(
                            "profileComplete",
                            profile != null
                    );

                    return response;
                })
                .toList();
    }

    // =====================================================
    // MAPPERS
    // =====================================================

    private Map<String, Object> mapUser(
            User user) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("createdAt", user.getCreatedAt());

        return response;
    }

    private Map<String, Object> mapJob(
            Job job,
            long applicationCount) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        User recruiter = job.getRecruiter();

        response.put("id", job.getId());
        response.put("title", job.getTitle());
        response.put("location", job.getLocation());
        response.put("employmentType", job.getEmploymentType());
        response.put("experienceRequired", job.getExperienceRequired());
        response.put("salaryMin", job.getSalaryMin());
        response.put("salaryMax", job.getSalaryMax());
        response.put("skills", job.getSkills());
        response.put("status", job.getStatus());
        response.put("deadline", job.getDeadline());
        response.put("createdAt", job.getCreatedAt());
        response.put("applicationCount", applicationCount);

        if (recruiter != null) {

            response.put("recruiterId", recruiter.getId());
            response.put("recruiterName", recruiter.getName());
            response.put("recruiterEmail", recruiter.getEmail());

            RecruiterProfile profile =
                    recruiterProfileRepository
                            .findByUserId(
                                    recruiter.getId()
                            )
                            .orElse(null);

            response.put(
                    "companyName",
                    profile != null
                            ? profile.getCompanyName()
                            : null
            );

        } else {

            response.put("recruiterId", null);
            response.put("recruiterName", null);
            response.put("recruiterEmail", null);
            response.put("companyName", null);
        }

        return response;
    }

    private Map<String, Object> mapApplication(
            Application application) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        Job job = application.getJob();
        User candidate = application.getCandidate();

        response.put("id", application.getId());
        response.put("applicationId", application.getId());
        response.put("status", application.getStatus());
        response.put("appliedAt", application.getAppliedAt());
        response.put("coverLetter", application.getCoverLetter());

        if (job != null) {

            response.put("jobId", job.getId());
            response.put("jobTitle", job.getTitle());

            User recruiter = job.getRecruiter();

            if (recruiter != null) {

                response.put("recruiterId", recruiter.getId());
                response.put("recruiterName", recruiter.getName());

                RecruiterProfile recruiterProfile =
                        recruiterProfileRepository
                                .findByUserId(
                                        recruiter.getId()
                                )
                                .orElse(null);

                response.put(
                        "companyName",
                        recruiterProfile != null
                                ? recruiterProfile.getCompanyName()
                                : null
                );
            }
        }

        if (candidate != null) {

            response.put("candidateId", candidate.getId());
            response.put("candidateName", candidate.getName());
            response.put("candidateEmail", candidate.getEmail());

            CandidateProfile candidateProfile =
                    candidateProfileRepository
                            .findByUserId(
                                    candidate.getId()
                            )
                            .orElse(null);

            String resumeUrl =
                    resolveResumeUrl(
                            candidateProfile,
                            application.getResumeUrl()
                    );

            response.put("resumeUrl", resumeUrl);

        } else {

            response.put(
                    "resumeUrl",
                    application.getResumeUrl()
            );
        }

        return response;
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private Map<Long, Long> getApplicationCountsByJob(
            List<Application> applications) {

        if (applications == null ||
                applications.isEmpty()) {

            return Map.of();
        }

        return applications
                .stream()
                .filter(application ->
                        application.getJob() != null
                )
                .filter(application ->
                        application.getJob().getId() != null
                )
                .collect(
                        Collectors.groupingBy(
                                application ->
                                        application.getJob().getId(),
                                Collectors.counting()
                        )
                );
    }

    private String resolveResumeUrl(
            CandidateProfile candidateProfile,
            String applicationResumeUrl) {

        if (candidateProfile != null &&
                candidateProfile.getResumeUrl() != null &&
                !candidateProfile.getResumeUrl().isBlank()) {

            return candidateProfile
                    .getResumeUrl()
                    .trim();
        }

        if (applicationResumeUrl != null &&
                !applicationResumeUrl.isBlank()) {

            return applicationResumeUrl.trim();
        }

        return null;
    }
}
