package com.anirban.repository;

import com.anirban.entity.PasswordResetToken;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    // =====================================================
    // FIND TOKEN
    // =====================================================

    Optional<PasswordResetToken> findByTokenHash(
            String tokenHash
    );

    // =====================================================
    // DELETE OLD TOKENS FOR USER
    // =====================================================

    void deleteByUser_Id(Long userId);
}