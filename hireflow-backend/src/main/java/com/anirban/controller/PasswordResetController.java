package com.anirban.controller;

import com.anirban.dto.ForgotPasswordRequest;
import com.anirban.dto.ResetPasswordRequest;
import com.anirban.service.PasswordResetService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(
            PasswordResetService passwordResetService
    ) {
        this.passwordResetService =
                passwordResetService;
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>>
    forgotPassword(
            @Valid
            @RequestBody
            ForgotPasswordRequest request
    ) {

        passwordResetService.requestPasswordReset(
                request.getEmail()
        );

        /*
         * IMPORTANT:
         *
         * Always return the same response even when the
         * email does not exist.
         *
         * This prevents users/attackers from determining
         * which email addresses are registered.
         */

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "If an account exists with this email, a password reset link has been sent."
                )
        );
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>>
    resetPassword(
            @Valid
            @RequestBody
            ResetPasswordRequest request
    ) {

        passwordResetService.resetPassword(
                request.getToken(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Password reset successfully. You can now log in with your new password."
                )
        );
    }
}