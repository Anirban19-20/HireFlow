package com.anirban.service;

public interface PasswordResetService {

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    void requestPasswordReset(
            String email
    );

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    void resetPassword(
            String token,
            String newPassword
    );
}