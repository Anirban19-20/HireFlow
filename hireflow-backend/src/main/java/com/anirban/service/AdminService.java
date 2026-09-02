package com.anirban.service;

import java.util.List;
import java.util.Map;

public interface AdminService {

    Map<String, Object> getDashboard();

    List<Map<String, Object>> getUsers();

    List<Map<String, Object>> getJobs();

    // =====================================================
    // DELETE INVALID / BAD JOB
    // =====================================================

    void deleteJob(Long jobId);

    List<Map<String, Object>> getApplications();

    List<Map<String, Object>> getRecruiters();

    List<Map<String, Object>> getCandidates();
}