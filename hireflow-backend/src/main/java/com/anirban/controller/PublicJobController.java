package com.anirban.controller;

import com.anirban.dto.JobResponse;
import com.anirban.dto.JobSearchRequest;
import com.anirban.entity.EmploymentType;
import com.anirban.service.JobService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class PublicJobController {

    private final JobService jobService;

    public PublicJobController(
            JobService jobService) {

        this.jobService = jobService;
    }

    // =====================================================
    // SEARCH / FILTER JOBS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<JobResponse>>
    searchJobs(

            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            String location,

            @RequestParam(required = false)
            EmploymentType employmentType,

            @RequestParam(required = false)
            Integer minExperience,

            @RequestParam(required = false)
            Double maxSalary,

            @RequestParam(required = false)
            String skill) {

        JobSearchRequest request =
                new JobSearchRequest();

        request.setKeyword(keyword);
        request.setLocation(location);
        request.setEmploymentType(
                employmentType);
        request.setMinExperience(
                minExperience);
        request.setMaxSalary(
                maxSalary);
        request.setSkill(skill);

        return ResponseEntity.ok(
                jobService.searchJobs(request)
        );
    }

    // =====================================================
    // GET SINGLE JOB
    // =====================================================

    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponse>
    getJob(
            @PathVariable Long jobId) {

        return ResponseEntity.ok(
                jobService.getPublicJob(jobId)
        );
    }
}