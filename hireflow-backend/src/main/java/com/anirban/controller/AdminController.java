package com.anirban.controller;

import com.anirban.service.AdminService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;


    public AdminController(
            AdminService adminService) {

        this.adminService =
                adminService;
    }


    // =====================================================
    // DASHBOARD
    // =====================================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>>
    getDashboard(
            Authentication authentication) {

        requireAdmin(authentication);

        return ResponseEntity.ok(
                adminService.getDashboard()
        );
    }


    // =====================================================
    // USERS
    // =====================================================

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>>
    getUsers(
            Authentication authentication) {

        requireAdmin(authentication);

        return ResponseEntity.ok(
                adminService.getUsers()
        );
    }


    // =====================================================
    // JOBS
    // =====================================================

    @GetMapping("/jobs")
    public ResponseEntity<List<Map<String, Object>>>
    getJobs(
            Authentication authentication) {

        requireAdmin(authentication);

        return ResponseEntity.ok(
                adminService.getJobs()
        );
    }


    // =====================================================
    // DELETE INVALID / BAD JOB
    // =====================================================

    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<Map<String, String>>
    deleteJob(
            @PathVariable Long jobId,
            Authentication authentication) {

        requireAdmin(authentication);

        adminService.deleteJob(jobId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Job deleted successfully."
                )
        );
    }


    // =====================================================
    // APPLICATIONS
    // =====================================================

    @GetMapping("/applications")
    public ResponseEntity<List<Map<String, Object>>>
    getApplications(
            Authentication authentication) {

        requireAdmin(authentication);

        return ResponseEntity.ok(
                adminService.getApplications()
        );
    }


    // =====================================================
    // RECRUITERS
    // =====================================================

    @GetMapping("/recruiters")
    public ResponseEntity<List<Map<String, Object>>>
    getRecruiters(
            Authentication authentication) {

        requireAdmin(authentication);

        return ResponseEntity.ok(
                adminService.getRecruiters()
        );
    }


    // =====================================================
    // CANDIDATES
    // =====================================================

    @GetMapping("/candidates")
    public ResponseEntity<List<Map<String, Object>>>
    getCandidates(
            Authentication authentication) {

        requireAdmin(authentication);

        return ResponseEntity.ok(
                adminService.getCandidates()
        );
    }


    // =====================================================
    // REQUIRE ADMIN
    // =====================================================

    private void requireAdmin(
            Authentication authentication) {

        if (
                authentication == null ||
                !authentication.isAuthenticated()
        ) {

            throw new AccessDeniedException(
                    "Admin authentication is required"
            );
        }


        boolean admin =
                authentication
                        .getAuthorities()
                        .stream()
                        .map(
                                GrantedAuthority::getAuthority
                        )
                        .anyMatch(
                                authority ->
                                        "ROLE_ADMIN"
                                                .equals(
                                                        authority
                                                )
                        );


        if (!admin) {

            throw new AccessDeniedException(
                    "Only administrators can access this resource"
            );
        }
    }
}