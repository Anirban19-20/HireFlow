package com.anirban.service;

import com.anirban.dto.JobRequest;
import com.anirban.dto.JobResponse;
import com.anirban.dto.JobSearchRequest;

import java.util.List;

public interface JobService {

    // Recruiter
    JobResponse createJob(
            Long recruiterId,
            JobRequest request);

    List<JobResponse> getRecruiterJobs(
            Long recruiterId);

    JobResponse getRecruiterJob(
            Long recruiterId,
            Long jobId);

    JobResponse updateJob(
            Long recruiterId,
            Long jobId,
            JobRequest request);

    void deleteJob(
            Long recruiterId,
            Long jobId);

    JobResponse closeJob(
            Long recruiterId,
            Long jobId);

    // Candidate
    List<JobResponse> searchJobs(
            JobSearchRequest request);

    JobResponse getPublicJob(
            Long jobId);
}