package com.anirban.repository;

import com.anirban.entity.Role;
import com.anirban.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(
            String email
    );

    boolean existsByEmail(
            String email
    );

    // =====================================================
    // ADMIN
    // =====================================================

    List<User> findByRole(
            Role role
    );

    long countByRole(
            Role role
    );
}