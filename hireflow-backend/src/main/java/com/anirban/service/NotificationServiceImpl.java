package com.anirban.service;

import com.anirban.dto.NotificationResponse;

import com.anirban.entity.Application;
import com.anirban.entity.ApplicationStatus;
import com.anirban.entity.Interview;
import com.anirban.entity.Job;
import com.anirban.entity.JobOffer;
import com.anirban.entity.Notification;
import com.anirban.entity.NotificationType;
import com.anirban.entity.User;

import com.anirban.repository.NotificationRepository;
import com.anirban.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.List;

@Service
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;

    private final UserRepository userRepository;


    private static final DateTimeFormatter
            INTERVIEW_DATE_FORMATTER =
            DateTimeFormatter.ofPattern(
                    "dd MMM yyyy, hh:mm a"
            );


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository =
                notificationRepository;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // CANDIDATE - APPLICATION STATUS
    // =====================================================

    @Override
    @Transactional
    public void createApplicationStatusNotification(
            Application application,
            ApplicationStatus newStatus) {

        if (
                application == null ||
                newStatus == null
        ) {

            return;
        }


        User candidate =
                application.getCandidate();

        Job job =
                application.getJob();


        if (
                candidate == null ||
                job == null
        ) {

            return;
        }


        String jobTitle =
                getJobTitle(
                        job
                );


        String title =
                getStatusNotificationTitle(
                        newStatus
                );


        String message =
                getStatusNotificationMessage(
                        newStatus,
                        jobTitle
                );


        if (
                message == null
        ) {

            return;
        }


        Notification notification =
                new Notification();


        notification.setUser(
                candidate
        );


        notification.setType(
                NotificationType.APPLICATION_STATUS
        );


        notification.setTitle(
                title
        );


        notification.setMessage(
                message
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                null
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // RECRUITER - NEW APPLICATION
    // =====================================================

    @Override
    @Transactional
    public void createNewApplicationNotification(
            Application application) {

        if (
                application == null
        ) {

            return;
        }


        Job job =
                application.getJob();

        User candidate =
                application.getCandidate();


        if (
                job == null ||
                candidate == null
        ) {

            return;
        }


        User recruiter =
                job.getRecruiter();


        if (
                recruiter == null
        ) {

            return;
        }


        String candidateName =
                getCandidateName(
                        candidate
                );


        String jobTitle =
                getJobTitle(
                        job
                );


        Notification notification =
                new Notification();


        notification.setUser(
                recruiter
        );


        notification.setType(
                NotificationType.NEW_APPLICATION
        );


        notification.setTitle(
                "New Job Application"
        );


        notification.setMessage(
                candidateName
                        + " applied for "
                        + jobTitle
                        + "."
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                null
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // RECRUITER - APPLICATION WITHDRAWN
    // =====================================================

    @Override
    @Transactional
    public void createApplicationWithdrawnNotification(
            Application application) {

        if (
                application == null
        ) {

            return;
        }


        Job job =
                application.getJob();

        User candidate =
                application.getCandidate();


        if (
                job == null ||
                candidate == null
        ) {

            return;
        }


        User recruiter =
                job.getRecruiter();


        if (
                recruiter == null
        ) {

            return;
        }


        String candidateName =
                getCandidateName(
                        candidate
                );


        String jobTitle =
                getJobTitle(
                        job
                );


        Notification notification =
                new Notification();


        notification.setUser(
                recruiter
        );


        notification.setType(
                NotificationType.APPLICATION_WITHDRAWN
        );


        notification.setTitle(
                "Application Withdrawn"
        );


        notification.setMessage(
                candidateName
                        + " withdrew their application for "
                        + jobTitle
                        + "."
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                null
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // CANDIDATE - INTERVIEW SCHEDULED
    // =====================================================

    @Override
    @Transactional
    public void createInterviewScheduledNotification(
            Interview interview) {

        if (
                !isValidInterview(
                        interview
                )
        ) {

            return;
        }


        Application application =
                interview.getApplication();

        Job job =
                application.getJob();

        User candidate =
                application.getCandidate();


        String interviewDate =
                formatInterviewDateTime(
                        interview.getScheduledAt()
                );


        String roundLabel =
                getInterviewRoundLabel(
                        interview
                );


        Notification notification =
                new Notification();


        notification.setUser(
                candidate
        );


        notification.setType(
                NotificationType.INTERVIEW_SCHEDULED
        );


        notification.setTitle(
                roundLabel + " Scheduled"
        );


        notification.setMessage(
                roundLabel
                        + " for "
                        + getJobTitle(job)
                        + " has been scheduled for "
                        + interviewDate
                        + "."
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                interview.getId()
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // CANDIDATE - INTERVIEW RESCHEDULED
    // =====================================================

    @Override
    @Transactional
    public void createInterviewRescheduledNotification(
            Interview interview) {

        if (
                !isValidInterview(
                        interview
                )
        ) {

            return;
        }


        Application application =
                interview.getApplication();

        Job job =
                application.getJob();

        User candidate =
                application.getCandidate();


        String interviewDate =
                formatInterviewDateTime(
                        interview.getScheduledAt()
                );


        String roundLabel =
                getInterviewRoundLabel(
                        interview
                );


        Notification notification =
                new Notification();


        notification.setUser(
                candidate
        );


        notification.setType(
                NotificationType.INTERVIEW_RESCHEDULED
        );


        notification.setTitle(
                roundLabel + " Rescheduled"
        );


        notification.setMessage(
                roundLabel
                        + " for "
                        + getJobTitle(job)
                        + " has been rescheduled to "
                        + interviewDate
                        + "."
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                interview.getId()
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // CANDIDATE - INTERVIEW CANCELLED
    // =====================================================

    @Override
    @Transactional
    public void createInterviewCancelledNotification(
            Interview interview) {

        if (
                !isValidInterview(
                        interview
                )
        ) {

            return;
        }


        Application application =
                interview.getApplication();

        Job job =
                application.getJob();

        User candidate =
                application.getCandidate();


        String roundLabel =
                getInterviewRoundLabel(
                        interview
                );


        Notification notification =
                new Notification();


        notification.setUser(
                candidate
        );


        notification.setType(
                NotificationType.INTERVIEW_CANCELLED
        );


        notification.setTitle(
                roundLabel + " Cancelled"
        );


        notification.setMessage(
                roundLabel
                        + " for "
                        + getJobTitle(job)
                        + " has been cancelled."
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                interview.getId()
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // CANDIDATE - INTERVIEW COMPLETED
    // =====================================================

    @Override
    @Transactional
    public void createInterviewCompletedNotification(
            Interview interview) {

        if (
                !isValidInterview(
                        interview
                )
        ) {

            return;
        }


        Application application =
                interview.getApplication();

        Job job =
                application.getJob();

        User candidate =
                application.getCandidate();


        String roundLabel =
                getInterviewRoundLabel(
                        interview
                );


        Notification notification =
                new Notification();


        notification.setUser(
                candidate
        );


        notification.setType(
                NotificationType.INTERVIEW_COMPLETED
        );


        notification.setTitle(
                roundLabel + " Completed"
        );


        notification.setMessage(
                roundLabel
                        + " for "
                        + getJobTitle(job)
                        + " has been marked as completed."
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                interview.getId()
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // CANDIDATE - JOB OFFER SENT
    // =====================================================

    @Override
    @Transactional
    public void createOfferSentNotification(
            JobOffer offer) {

        if (
                !isValidOffer(
                        offer
                )
        ) {

            return;
        }


        Application application =
                offer.getApplication();

        Job job =
                application.getJob();

        User candidate =
                application.getCandidate();


        Notification notification =
                new Notification();


        notification.setUser(
                candidate
        );


        notification.setType(
                NotificationType.OFFER_SENT
        );


        notification.setTitle(
                "Job Offer Received"
        );


        notification.setMessage(
                "Congratulations! You have received a job offer for "
                        + getJobTitle(job)
                        + ". Review the offer details and respond before it expires."
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                null
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // RECRUITER - JOB OFFER ACCEPTED
    // =====================================================

    @Override
    @Transactional
    public void createOfferAcceptedNotification(
            JobOffer offer) {

        if (
                !isValidOffer(
                        offer
                )
        ) {

            return;
        }


        Application application =
                offer.getApplication();

        Job job =
                application.getJob();

        User candidate =
                application.getCandidate();

        User recruiter =
                job.getRecruiter();


        if (
                recruiter == null
        ) {

            return;
        }


        String candidateName =
                getCandidateName(
                        candidate
                );


        Notification notification =
                new Notification();


        notification.setUser(
                recruiter
        );


        notification.setType(
                NotificationType.OFFER_ACCEPTED
        );


        notification.setTitle(
                "Job Offer Accepted"
        );


        notification.setMessage(
                candidateName
                        + " accepted the job offer for "
                        + getJobTitle(job)
                        + "."
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                null
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // RECRUITER - JOB OFFER REJECTED
    // =====================================================

    @Override
    @Transactional
    public void createOfferRejectedNotification(
            JobOffer offer) {

        if (
                !isValidOffer(
                        offer
                )
        ) {

            return;
        }


        Application application =
                offer.getApplication();

        Job job =
                application.getJob();

        User candidate =
                application.getCandidate();

        User recruiter =
                job.getRecruiter();


        if (
                recruiter == null
        ) {

            return;
        }


        String candidateName =
                getCandidateName(
                        candidate
                );


        Notification notification =
                new Notification();


        notification.setUser(
                recruiter
        );


        notification.setType(
                NotificationType.OFFER_REJECTED
        );


        notification.setTitle(
                "Job Offer Rejected"
        );


        notification.setMessage(
                candidateName
                        + " rejected the job offer for "
                        + getJobTitle(job)
                        + "."
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                null
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // CANDIDATE - JOB OFFER WITHDRAWN
    // =====================================================

    @Override
    @Transactional
    public void createOfferWithdrawnNotification(
            JobOffer offer) {

        if (
                !isValidOffer(
                        offer
                )
        ) {

            return;
        }


        Application application =
                offer.getApplication();

        Job job =
                application.getJob();

        User candidate =
                application.getCandidate();


        Notification notification =
                new Notification();


        notification.setUser(
                candidate
        );


        notification.setType(
                NotificationType.OFFER_WITHDRAWN
        );


        notification.setTitle(
                "Job Offer Withdrawn"
        );


        notification.setMessage(
                "The job offer for "
                        + getJobTitle(job)
                        + " has been withdrawn by the recruiter."
        );


        notification.setApplicationId(
                application.getId()
        );


        notification.setJobId(
                job.getId()
        );


        notification.setInterviewId(
                null
        );


        notification.setRead(
                false
        );


        notificationRepository.save(
                notification
        );
    }


    // =====================================================
    // GET NOTIFICATIONS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(
            Long userId) {

        validateUser(
                userId
        );


        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        userId
                )
                .stream()
                .map(
                        this::convertToResponse
                )
                .toList();
    }


    // =====================================================
    // GET UNREAD COUNT
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(
            Long userId) {

        validateUser(
                userId
        );


        return notificationRepository
                .countByUserIdAndReadFalse(
                        userId
                );
    }


    // =====================================================
    // MARK ONE AS READ
    // =====================================================

    @Override
    @Transactional
    public NotificationResponse markAsRead(
            Long notificationId,
            Long userId) {

        validateUser(
                userId
        );


        if (
                notificationId == null
        ) {

            throw new RuntimeException(
                    "Notification ID is required"
            );
        }


        Notification notification =
                notificationRepository
                        .findByIdAndUserId(
                                notificationId,
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Notification not found"
                                        )
                        );


        if (
                !notification.isRead()
        ) {

            notification.setRead(
                    true
            );


            notification =
                    notificationRepository.save(
                            notification
                    );
        }


        return convertToResponse(
                notification
        );
    }


    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    @Override
    @Transactional
    public void markAllAsRead(
            Long userId) {

        validateUser(
                userId
        );


        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndReadFalse(
                                userId
                        );


        if (
                notifications.isEmpty()
        ) {

            return;
        }


        for (
                Notification notification :
                notifications
        ) {

            notification.setRead(
                    true
            );
        }


        notificationRepository.saveAll(
                notifications
        );
    }


    // =====================================================
    // APPLICATION STATUS TITLE
    // =====================================================

    private String getStatusNotificationTitle(
            ApplicationStatus status) {

        return switch (
                status
        ) {

            case UNDER_REVIEW ->
                    "Application Under Review";

            case SHORTLISTED ->
                    "Application Shortlisted";

            case INTERVIEW ->
                    "Interview Stage";

            case SELECTED ->
                    "Application Selected";

            case REJECTED ->
                    "Application Update";

            default ->
                    "Application Status Updated";
        };
    }


    // =====================================================
    // APPLICATION STATUS MESSAGE
    // =====================================================

    private String getStatusNotificationMessage(
            ApplicationStatus status,
            String jobTitle) {

        return switch (
                status
        ) {

            case UNDER_REVIEW ->

                    "Your application for "
                            + jobTitle
                            + " is now under review.";


            case SHORTLISTED ->

                    "Your application for "
                            + jobTitle
                            + " has been shortlisted.";


            case INTERVIEW ->

                    "You have moved to the interview stage for "
                            + jobTitle
                            + ".";


            case SELECTED ->

                    "Congratulations! You have been selected for "
                            + jobTitle
                            + ".";


            case REJECTED ->

                    "Your application for "
                            + jobTitle
                            + " was not selected.";


            case APPLIED,
                 WITHDRAWN -> null;
        };
    }


    // =====================================================
    // INTERVIEW ROUND LABEL
    // =====================================================

    private String getInterviewRoundLabel(
            Interview interview) {

        if (
                interview == null
        ) {

            return "Interview";
        }


        String roundName =
                interview.getRoundName();


        Integer roundNumber =
                interview.getRoundNumber();


        if (
                roundName != null &&
                !roundName.isBlank()
        ) {

            return roundName.trim();
        }


        if (
                roundNumber != null
        ) {

            return "Interview Round "
                    + roundNumber;
        }


        return "Interview";
    }


    // =====================================================
    // VALIDATE INTERVIEW
    // =====================================================

    private boolean isValidInterview(
            Interview interview) {

        if (
                interview == null
        ) {

            return false;
        }


        Application application =
                interview.getApplication();


        if (
                application == null
        ) {

            return false;
        }


        if (
                application.getCandidate() ==
                null
        ) {

            return false;
        }


        return application.getJob() !=
                null;
    }


    // =====================================================
    // VALIDATE JOB OFFER
    // =====================================================

    private boolean isValidOffer(
            JobOffer offer) {

        if (
                offer == null
        ) {

            return false;
        }


        Application application =
                offer.getApplication();


        if (
                application == null
        ) {

            return false;
        }


        if (
                application.getCandidate() ==
                null
        ) {

            return false;
        }


        return application.getJob() !=
                null;
    }


    // =====================================================
    // FORMAT INTERVIEW DATE
    // =====================================================

    private String formatInterviewDateTime(
            LocalDateTime scheduledAt) {

        if (
                scheduledAt == null
        ) {

            return "the scheduled time";
        }


        return scheduledAt.format(
                INTERVIEW_DATE_FORMATTER
        );
    }


    // =====================================================
    // GET JOB TITLE
    // =====================================================

    private String getJobTitle(
            Job job) {

        if (
                job == null ||
                job.getTitle() == null ||
                job.getTitle().isBlank()
        ) {

            return "the job";
        }


        return job
                .getTitle()
                .trim();
    }


    // =====================================================
    // GET CANDIDATE NAME
    // =====================================================

    private String getCandidateName(
            User candidate) {

        if (
                candidate == null ||
                candidate.getName() == null ||
                candidate.getName().isBlank()
        ) {

            return "A candidate";
        }


        return candidate
                .getName()
                .trim();
    }


    // =====================================================
    // VALIDATE USER
    // =====================================================

    private User validateUser(
            Long userId) {

        if (
                userId == null
        ) {

            throw new RuntimeException(
                    "User ID is required"
            );
        }


        return userRepository
                .findById(
                        userId
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "User not found"
                                )
                );
    }


    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    private NotificationResponse convertToResponse(
            Notification notification) {

        if (
                notification == null
        ) {

            throw new RuntimeException(
                    "Notification cannot be null"
            );
        }


        NotificationResponse response =
                new NotificationResponse();


        response.setId(
                notification.getId()
        );


        response.setType(
                notification.getType()
        );


        response.setTitle(
                notification.getTitle()
        );


        response.setMessage(
                notification.getMessage()
        );


        response.setApplicationId(
                notification.getApplicationId()
        );


        response.setJobId(
                notification.getJobId()
        );


        response.setInterviewId(
                notification.getInterviewId()
        );


        response.setRead(
                notification.isRead()
        );


        response.setCreatedAt(
                notification.getCreatedAt()
        );


        return response;
    }
}