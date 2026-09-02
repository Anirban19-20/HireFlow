package com.anirban.service;

import com.anirban.entity.PasswordResetToken;
import com.anirban.entity.User;
import com.anirban.repository.PasswordResetTokenRepository;
import com.anirban.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import java.time.LocalDateTime;

import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

@Service
@Transactional
public class PasswordResetServiceImpl
        implements PasswordResetService {

    // =====================================================
    // TOKEN SETTINGS
    // =====================================================

    private static final int TOKEN_BYTE_LENGTH = 32;

    private static final SecureRandom SECURE_RANDOM =
            new SecureRandom();

    // =====================================================
    // DEPENDENCIES
    // =====================================================

    private final UserRepository userRepository;

    private final PasswordResetTokenRepository
            passwordResetTokenRepository;

    private final PasswordEncoder passwordEncoder;

    private final JavaMailSender mailSender;

    // =====================================================
    // CONFIGURATION
    // =====================================================

    @Value(
            "${app.frontend-url:http://localhost:3000}"
    )
    private String frontendUrl;

    @Value(
            "${app.password-reset.expiration-minutes:30}"
    )
    private long resetTokenExpirationMinutes;

    @Value(
            "${spring.mail.username:}"
    )
    private String mailFrom;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PasswordResetServiceImpl(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender
    ) {

        this.userRepository =
                userRepository;

        this.passwordResetTokenRepository =
                passwordResetTokenRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.mailSender =
                mailSender;
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @Override
    public void requestPasswordReset(
            String email
    ) {

        // =================================================
        // 1. Validate email
        // =================================================

        if (
                email == null ||
                email.isBlank()
        ) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        String normalizedEmail =
                email.trim()
                        .toLowerCase(Locale.ROOT);

        // =================================================
        // 2. Find user
        //
        // IMPORTANT:
        // If the email does not exist, simply return.
        //
        // This prevents attackers from checking which
        // email addresses are registered in HireFlow.
        // =================================================

        Optional<User> optionalUser =
                userRepository.findByEmail(
                        normalizedEmail
                );

        if (optionalUser.isEmpty()) {

            return;
        }

        User user =
                optionalUser.get();

        // =================================================
        // 3. Remove previous reset tokens
        // =================================================

        passwordResetTokenRepository
                .deleteByUser_Id(
                        user.getId()
                );

        // =================================================
        // 4. Generate secure reset token
        // =================================================

        String rawToken =
                generateSecureToken();

        // =================================================
        // 5. Hash token before storing
        // =================================================

        String tokenHash =
                hashToken(rawToken);

        // =================================================
        // 6. Create expiration time
        // =================================================

        LocalDateTime expiresAt =
                LocalDateTime.now()
                        .plusMinutes(
                                resetTokenExpirationMinutes
                        );

        // =================================================
        // 7. Save token
        // =================================================

        PasswordResetToken resetToken =
                new PasswordResetToken(
                        user,
                        tokenHash,
                        expiresAt
                );

        passwordResetTokenRepository.save(
                resetToken
        );

        // =================================================
        // 8. Send password reset email
        // =================================================

        sendPasswordResetEmail(
                user,
                rawToken
        );
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @Override
    public void resetPassword(
            String token,
            String newPassword
    ) {

        // =================================================
        // 1. Validate token
        // =================================================

        if (
                token == null ||
                token.isBlank()
        ) {

            throw new RuntimeException(
                    "Invalid password reset token"
            );
        }

        // =================================================
        // 2. Validate password
        // =================================================

        if (
                newPassword == null ||
                newPassword.isBlank()
        ) {

            throw new RuntimeException(
                    "New password is required"
            );
        }

        if (newPassword.length() < 8) {

            throw new RuntimeException(
                    "Password must be at least 8 characters"
            );
        }

        if (newPassword.length() > 100) {

            throw new RuntimeException(
                    "Password cannot exceed 100 characters"
            );
        }

        // =================================================
        // 3. Hash received token
        // =================================================

        String tokenHash =
                hashToken(
                        token.trim()
                );

        // =================================================
        // 4. Find token
        // =================================================

        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByTokenHash(
                                tokenHash
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Invalid or expired password reset token"
                                        )
                        );

        // =================================================
        // 5. Check whether token was already used
        // =================================================

        if (resetToken.isUsed()) {

            throw new RuntimeException(
                    "Invalid or expired password reset token"
            );
        }

        // =================================================
        // 6. Check expiration
        // =================================================

        if (resetToken.isExpired()) {

            throw new RuntimeException(
                    "Invalid or expired password reset token"
            );
        }

        // =================================================
        // 7. Get user
        // =================================================

        User user =
                resetToken.getUser();

        if (user == null) {

            throw new RuntimeException(
                    "Invalid password reset token"
            );
        }

        // =================================================
        // 8. Encode and update password
        // =================================================

        String encodedPassword =
                passwordEncoder.encode(
                        newPassword
                );

        user.setPassword(
                encodedPassword
        );

        userRepository.save(
                user
        );

        // =================================================
        // 9. Mark token as used
        // =================================================

        resetToken.setUsedAt(
                LocalDateTime.now()
        );

        passwordResetTokenRepository.save(
                resetToken
        );
    }

    // =====================================================
    // GENERATE SECURE TOKEN
    // =====================================================

    private String generateSecureToken() {

        byte[] bytes =
                new byte[TOKEN_BYTE_LENGTH];

        SECURE_RANDOM.nextBytes(
                bytes
        );

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        bytes
                );
    }

    // =====================================================
    // HASH TOKEN
    // =====================================================

    private String hashToken(
            String token
    ) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            token.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return bytesToHex(
                    hash
            );

        } catch (
                NoSuchAlgorithmException exception
        ) {

            throw new IllegalStateException(
                    "Unable to hash password reset token",
                    exception
            );
        }
    }

    // =====================================================
    // BYTES TO HEX
    // =====================================================

    private String bytesToHex(
            byte[] bytes
    ) {

        StringBuilder builder =
                new StringBuilder(
                        bytes.length * 2
                );

        for (byte currentByte : bytes) {

            builder.append(
                    String.format(
                            "%02x",
                            currentByte & 0xff
                    )
            );
        }

        return builder.toString();
    }

    // =====================================================
    // SEND PASSWORD RESET EMAIL
    // =====================================================

    private void sendPasswordResetEmail(
            User user,
            String rawToken
    ) {

        String baseFrontendUrl =
                frontendUrl == null
                        ? "http://localhost:3000"
                        : frontendUrl.trim();

        while (
                baseFrontendUrl.endsWith("/")
        ) {

            baseFrontendUrl =
                    baseFrontendUrl.substring(
                            0,
                            baseFrontendUrl.length() - 1
                    );
        }

        String resetLink =
                baseFrontendUrl
                        + "/reset-password?token="
                        + rawToken;

        String userName =
                user.getName();

        if (
                userName == null ||
                userName.isBlank()
        ) {

            userName = "HireFlow User";
        }

        String emailBody =
                "Hello "
                        + userName
                        + ",\n\n"
                        + "We received a request to reset your HireFlow password.\n\n"
                        + "Use the link below to create a new password:\n\n"
                        + resetLink
                        + "\n\n"
                        + "This password reset link will expire in "
                        + resetTokenExpirationMinutes
                        + " minutes.\n\n"
                        + "If you did not request a password reset, "
                        + "you can safely ignore this email.\n\n"
                        + "Regards,\n"
                        + "HireFlow Team";

        SimpleMailMessage message =
                new SimpleMailMessage();

        if (
                mailFrom != null &&
                !mailFrom.isBlank()
        ) {

            message.setFrom(
                    mailFrom
            );
        }

        message.setTo(
                user.getEmail()
        );

        message.setSubject(
                "Reset Your HireFlow Password"
        );

        message.setText(
                emailBody
        );

        mailSender.send(
                message
        );
    }
}