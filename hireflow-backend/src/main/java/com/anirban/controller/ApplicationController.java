package com.anirban.controller;

import com.anirban.dto.ApplicationStatusHistoryResponse;
import com.anirban.entity.User;
import com.anirban.service.ApplicationService;
import com.anirban.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserService userService;

    public ApplicationController(
            ApplicationService applicationService,
            UserService userService) {

        this.applicationService = applicationService;
        this.userService = userService;
    }

    // =====================================================
    // APPLICATION STATUS HISTORY
    // =====================================================

    @GetMapping("/{applicationId}/history")
    public ResponseEntity<List<ApplicationStatusHistoryResponse>>
    getApplicationStatusHistory(
            @PathVariable Long applicationId,
            Authentication authentication) {

        User user =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                applicationService.getApplicationStatusHistory(
                        applicationId,
                        user.getId()
                )
        );
    }
}