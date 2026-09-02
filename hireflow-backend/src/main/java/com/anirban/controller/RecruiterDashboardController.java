package com.anirban.controller;

import com.anirban.dto.RecruiterDashboardResponse;
import com.anirban.entity.User;
import com.anirban.service.RecruiterDashboardService;
import com.anirban.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruiter/dashboard")
public class RecruiterDashboardController {

    private final RecruiterDashboardService dashboardService;

    private final UserService userService;

    public RecruiterDashboardController(
            RecruiterDashboardService dashboardService,
            UserService userService) {

        this.dashboardService = dashboardService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<RecruiterDashboardResponse>
    getDashboard(
            Authentication authentication) {

        User recruiter =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                dashboardService.getDashboard(
                        recruiter.getId()
                )
        );
    }
}