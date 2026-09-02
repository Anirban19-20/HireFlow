package com.anirban.service;

import com.anirban.dto.NotificationResponse;

import com.anirban.entity.Application;
import com.anirban.entity.ApplicationStatus;
import com.anirban.entity.Interview;
import com.anirban.entity.JobOffer;

import java.util.List;

public interface NotificationService {

    // =====================================================
    // CANDIDATE - APPLICATION STATUS CHANGE
    // =====================================================

    void createApplicationStatusNotification(
            Application application,
            ApplicationStatus newStatus
    );


    // =====================================================
    // RECRUITER - NEW APPLICATION
    // =====================================================

    void createNewApplicationNotification(
            Application application
    );


    // =====================================================
    // RECRUITER - APPLICATION WITHDRAWN
    // =====================================================

    void createApplicationWithdrawnNotification(
            Application application
    );


    // =====================================================
    // CANDIDATE - INTERVIEW SCHEDULED
    // =====================================================

    void createInterviewScheduledNotification(
            Interview interview
    );


    // =====================================================
    // CANDIDATE - INTERVIEW RESCHEDULED
    // =====================================================

    void createInterviewRescheduledNotification(
            Interview interview
    );


    // =====================================================
    // CANDIDATE - INTERVIEW CANCELLED
    // =====================================================

    void createInterviewCancelledNotification(
            Interview interview
    );


    // =====================================================
    // CANDIDATE - INTERVIEW COMPLETED
    // =====================================================

    void createInterviewCompletedNotification(
            Interview interview
    );


    // =====================================================
    // CANDIDATE - OFFER SENT
    // =====================================================

    void createOfferSentNotification(
            JobOffer offer
    );


    // =====================================================
    // RECRUITER - OFFER ACCEPTED
    // =====================================================

    void createOfferAcceptedNotification(
            JobOffer offer
    );


    // =====================================================
    // RECRUITER - OFFER REJECTED
    // =====================================================

    void createOfferRejectedNotification(
            JobOffer offer
    );


    // =====================================================
    // CANDIDATE - OFFER WITHDRAWN
    // =====================================================

    void createOfferWithdrawnNotification(
            JobOffer offer
    );


    // =====================================================
    // GET NOTIFICATIONS
    // =====================================================

    List<NotificationResponse> getNotifications(
            Long userId
    );


    // =====================================================
    // GET UNREAD COUNT
    // =====================================================

    long getUnreadCount(
            Long userId
    );


    // =====================================================
    // MARK ONE AS READ
    // =====================================================

    NotificationResponse markAsRead(
            Long notificationId,
            Long userId
    );


    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    void markAllAsRead(
            Long userId
    );
}