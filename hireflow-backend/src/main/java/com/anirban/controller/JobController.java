package com.anirban.controller;

import com.anirban.dto.JobRequest;
import com.anirban.dto.JobResponse;
import com.anirban.entity.User;
import com.anirban.service.JobService;
import com.anirban.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private final JobService jobService;
    private final UserService userService;

    public JobController(
            JobService jobService,
            UserService userService) {

        this.jobService = jobService;
        this.userService = userService;
    }

    // =========================
    // CREATE JOB
    // =========================

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            Authentication authentication,
            @RequestBody JobRequest request) {

        User recruiter =
                userService.getUserByEmail(
                        authentication.getName()
                );

        JobResponse response =
                jobService.createJob(
                        recruiter.getId(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================
    // GET MY JOBS
    // =========================

    @GetMapping
    public ResponseEntity<List<JobResponse>>
    getMyJobs(
            Authentication authentication) {

        User recruiter =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                jobService.getRecruiterJobs(
                        recruiter.getId()
                )
        );
    }

    // =========================
    // GET MY JOB
    // =========================

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse>
    getJob(
            Authentication authentication,
            @PathVariable Long jobId) {

        User recruiter =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                jobService.getRecruiterJob(
                        recruiter.getId(),
                        jobId
                )
        );
    }

    // =========================
    // UPDATE JOB
    // =========================

    @PutMapping("/{jobId}")
    public ResponseEntity<JobResponse>
    updateJob(
            Authentication authentication,
            @PathVariable Long jobId,
            @RequestBody JobRequest request) {

        User recruiter =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                jobService.updateJob(
                        recruiter.getId(),
                        jobId,
                        request
                )
        );
    }

    // =========================
    // DELETE JOB
    // =========================

    @DeleteMapping("/{jobId}")
    public ResponseEntity<String>
    deleteJob(
            Authentication authentication,
            @PathVariable Long jobId) {

        User recruiter =
                userService.getUserByEmail(
                        authentication.getName()
                );

        jobService.deleteJob(
                recruiter.getId(),
                jobId
        );

        return ResponseEntity.ok(
                "Job deleted successfully"
        );
    }

    // =========================
    // CLOSE JOB
    // =========================

    @PutMapping("/{jobId}/close")
    public ResponseEntity<JobResponse>
    closeJob(
            Authentication authentication,
            @PathVariable Long jobId) {

        User recruiter =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                jobService.closeJob(
                        recruiter.getId(),
                        jobId
                )
        );
    }
}