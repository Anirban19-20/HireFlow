package com.anirban.repository;

import com.anirban.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification>
    findByUserIdOrderByCreatedAtDesc(
            Long userId);

    Optional<Notification>
    findByIdAndUserId(
            Long id,
            Long userId);

    long countByUserIdAndReadFalse(
            Long userId);

    List<Notification>
    findByUserIdAndReadFalse(
            Long userId);
}