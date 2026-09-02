package com.anirban.controller;

import com.anirban.dto.SavedJobResponse;
import com.anirban.entity.User;
import com.anirban.service.SavedJobService;
import com.anirban.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate/saved-jobs")
@CrossOrigin(origins = "*")
public class SavedJobController {

    private final SavedJobService savedJobService;

    private final UserService userService;

    public SavedJobController(
            SavedJobService savedJobService,
            UserService userService) {

        this.savedJobService =
                savedJobService;

        this.userService =
                userService;
    }

    // =============================================
    // SAVE JOB
    // =============================================

    @PostMapping("/{jobId}")
    public ResponseEntity<SavedJobResponse>
    saveJob(
            @PathVariable Long jobId,
            Authentication authentication) {

        User candidate =
                userService.getUserByEmail(
                        authentication.getName()
                );

        SavedJobResponse response =
                savedJobService.saveJob(
                        candidate.getId(),
                        jobId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =============================================
    // GET SAVED JOBS
    // =============================================

    @GetMapping
    public ResponseEntity<List<SavedJobResponse>>
    getSavedJobs(
            Authentication authentication) {

        User candidate =
                userService.getUserByEmail(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                savedJobService.getSavedJobs(
                        candidate.getId()
                )
        );
    }

    // =============================================
    // REMOVE SAVED JOB
    // =============================================

    @DeleteMapping("/{jobId}")
    public ResponseEntity<String>
    removeSavedJob(
            @PathVariable Long jobId,
            Authentication authentication) {

        User candidate =
                userService.getUserByEmail(
                        authentication.getName()
                );

        savedJobService.removeSavedJob(
                candidate.getId(),
                jobId
        );

        return ResponseEntity.ok(
                "Saved job removed successfully"
        );
    }
}