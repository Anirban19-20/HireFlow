package com.anirban.service;

import com.anirban.dto.RecruiterDashboardResponse;

public interface RecruiterDashboardService {

    RecruiterDashboardResponse getDashboard(
            Long recruiterId
    );
}