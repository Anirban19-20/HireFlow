package com.anirban.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "password_reset_tokens",
        indexes = {
                @Index(
                        name = "idx_password_reset_token_hash",
                        columnList = "token_hash"
                ),
                @Index(
                        name = "idx_password_reset_user",
                        columnList = "user_id"
                )
        }
)
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // USER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // =====================================================
    // TOKEN
    //
    // We do NOT store the raw reset token.
    // SHA-256 hash of the token is stored instead.
    // =====================================================

    @Column(
            name = "token_hash",
            nullable = false,
            unique = true,
            length = 64
    )
    private String tokenHash;

    // =====================================================
    // TIMESTAMPS
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public PasswordResetToken() {
    }

    public PasswordResetToken(
            User user,
            String tokenHash,
            LocalDateTime expiresAt
    ) {
        this.user = user;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.createdAt = LocalDateTime.now();
    }

    // =====================================================
    // LIFECYCLE
    // =====================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // =====================================================
    // HELPER METHODS
    // =====================================================

    public boolean isExpired() {

        return expiresAt != null
                && LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isUsed() {

        return usedAt != null;
    }

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(
            LocalDateTime expiresAt
    ) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(
            LocalDateTime usedAt
    ) {
        this.usedAt = usedAt;
    }
}