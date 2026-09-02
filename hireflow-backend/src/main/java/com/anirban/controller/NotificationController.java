package com.anirban.controller;

import com.anirban.dto.NotificationResponse;

import com.anirban.entity.User;

import com.anirban.service.NotificationService;
import com.anirban.service.UserService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService
            notificationService;

    private final UserService
            userService;

    public NotificationController(
            NotificationService notificationService,
            UserService userService) {

        this.notificationService =
                notificationService;

        this.userService =
                userService;
    }

    // =====================================================
    // GET ALL NOTIFICATIONS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<NotificationResponse>>
    getNotifications(
            Authentication authentication) {

        User user =
                getAuthenticatedUser(
                        authentication
                );

        List<NotificationResponse> notifications =
                notificationService
                        .getNotifications(
                                user.getId()
                        );

        return ResponseEntity.ok(
                notifications
        );
    }

    // =====================================================
    // GET UNREAD COUNT
    // =====================================================

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>>
    getUnreadCount(
            Authentication authentication) {

        User user =
                getAuthenticatedUser(
                        authentication
                );

        long count =
                notificationService
                        .getUnreadCount(
                                user.getId()
                        );

        return ResponseEntity.ok(
                Map.of(
                        "unreadCount",
                        count
                )
        );
    }

    // =====================================================
    // MARK ONE AS READ
    // =====================================================

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse>
    markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {

        User user =
                getAuthenticatedUser(
                        authentication
                );

        NotificationResponse response =
                notificationService
                        .markAsRead(
                                notificationId,
                                user.getId()
                        );

        return ResponseEntity.ok(
                response
        );
    }

    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    @PatchMapping("/read-all")
    public ResponseEntity<Void>
    markAllAsRead(
            Authentication authentication) {

        User user =
                getAuthenticatedUser(
                        authentication
                );

        notificationService
                .markAllAsRead(
                        user.getId()
                );

        return ResponseEntity
                .noContent()
                .build();
    }

    // =====================================================
    // AUTHENTICATED USER
    // =====================================================

    private User getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }

        String email =
                authentication.getName();

        if (email == null ||
                email.isBlank()) {

            throw new RuntimeException(
                    "Authenticated user email is missing"
            );
        }

        return userService
                .getUserByEmail(
                        email
                );
    }
}