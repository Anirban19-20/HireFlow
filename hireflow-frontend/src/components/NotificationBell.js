import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";

import axiosInstance
    from "../api/axiosInstance";

import "./NotificationBell.css";


function NotificationBell() {

    const navigate =
        useNavigate();

    const {
        user
    } = useAuth();

    const dropdownRef =
        useRef(null);


    const [
        notifications,
        setNotifications
    ] = useState([]);


    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);


    const [
        open,
        setOpen
    ] = useState(false);


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    // =====================================================
    // LOAD UNREAD COUNT
    // =====================================================

    const loadUnreadCount =
        async () => {

            try {

                const response =
                    await axiosInstance.get(
                        "/api/notifications/unread-count"
                    );


                setUnreadCount(
                    Number(
                        response.data?.unreadCount
                    ) || 0
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Notification count error:",
                    requestError
                );
            }
        };


    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    const loadNotifications =
        async () => {

            setLoading(
                true
            );

            setError(
                ""
            );


            try {

                const response =
                    await axiosInstance.get(
                        "/api/notifications"
                    );


                const data =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : [];


                setNotifications(
                    data
                );


                setUnreadCount(
                    data.filter(
                        (
                            notification
                        ) =>
                            !notification.read
                    ).length
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Notification loading error:",
                    requestError
                );


                setError(
                    requestError.response
                        ?.data
                        ?.message ||
                    "Unable to load notifications."
                );

            } finally {

                setLoading(
                    false
                );
            }
        };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(
        () => {

            if (
                user?.role !== "CANDIDATE" &&
                user?.role !== "RECRUITER"
            ) {

                return;
            }


            loadUnreadCount();


            // Refresh every minute
            const interval =
                setInterval(
                    loadUnreadCount,
                    60000
                );


            return () => {

                clearInterval(
                    interval
                );
            };

            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [
            user?.role
        ]
    );


    // =====================================================
    // CLOSE WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(
        () => {

            const handleOutsideClick =
                (
                    event
                ) => {

                    if (
                        dropdownRef.current &&
                        !dropdownRef.current.contains(
                            event.target
                        )
                    ) {

                        setOpen(
                            false
                        );
                    }
                };


            document.addEventListener(
                "mousedown",
                handleOutsideClick
            );


            return () => {

                document.removeEventListener(
                    "mousedown",
                    handleOutsideClick
                );
            };
        },
        []
    );


    // =====================================================
    // TOGGLE DROPDOWN
    // =====================================================

    const handleToggle =
        async () => {

            const nextOpen =
                !open;


            setOpen(
                nextOpen
            );


            if (
                nextOpen
            ) {

                await loadNotifications();
            }
        };


    // =====================================================
    // NOTIFICATION DESTINATION
    // =====================================================

    const getNotificationDestination =
        (
            notification
        ) => {

            if (
                !notification
            ) {

                return null;
            }


            // =================================================
            // RECRUITER - APPLICATION ACTIVITY
            // =================================================

            if (
                user?.role === "RECRUITER" &&
                (
                    notification.type ===
                        "NEW_APPLICATION" ||

                    notification.type ===
                        "APPLICATION_WITHDRAWN"
                )
            ) {

                if (
                    notification.jobId
                ) {

                    return (
                        `/recruiter/jobs/${notification.jobId}/applications`
                    );
                }


                return "/recruiter/jobs";
            }


            // =================================================
            // RECRUITER - OFFER RESPONSE
            // =================================================

            if (
                user?.role === "RECRUITER" &&
                (
                    notification.type ===
                        "OFFER_ACCEPTED" ||

                    notification.type ===
                        "OFFER_REJECTED"
                )
            ) {

                if (
                    notification.jobId
                ) {

                    return (
                        `/recruiter/jobs/${notification.jobId}/applications`
                    );
                }


                return "/recruiter/jobs";
            }


            // =================================================
            // CANDIDATE - APPLICATION STATUS
            // =================================================

            if (
                user?.role === "CANDIDATE" &&
                notification.type ===
                    "APPLICATION_STATUS"
            ) {

                return "/candidate/applications";
            }


            // =================================================
            // CANDIDATE - INTERVIEW NOTIFICATIONS
            // =================================================

            if (
                user?.role === "CANDIDATE" &&
                (
                    notification.type ===
                        "INTERVIEW_SCHEDULED" ||

                    notification.type ===
                        "INTERVIEW_RESCHEDULED" ||

                    notification.type ===
                        "INTERVIEW_CANCELLED" ||

                    notification.type ===
                        "INTERVIEW_COMPLETED"
                )
            ) {

                return "/candidate/interviews";
            }


            // =================================================
            // CANDIDATE - JOB OFFER NOTIFICATIONS
            // =================================================

            if (
                user?.role === "CANDIDATE" &&
                (
                    notification.type ===
                        "OFFER_SENT" ||

                    notification.type ===
                        "OFFER_WITHDRAWN"
                )
            ) {

                return "/candidate/offers";
            }


            // =================================================
            // FALLBACKS
            // =================================================

            if (
                user?.role === "RECRUITER"
            ) {

                return "/recruiter/dashboard";
            }


            if (
                user?.role === "CANDIDATE"
            ) {

                return "/candidate/dashboard";
            }


            return null;
        };


    // =====================================================
    // CLICK NOTIFICATION
    // =====================================================

    const handleNotificationClick =
        async (
            notification
        ) => {

            if (
                !notification
            ) {

                return;
            }


            try {

                // =============================================
                // MARK AS READ
                // =============================================

                if (
                    !notification.read &&
                    notification.id
                ) {

                    await axiosInstance.patch(
                        `/api/notifications/${notification.id}/read`
                    );


                    setNotifications(
                        (
                            previous
                        ) =>
                            previous.map(
                                (
                                    item
                                ) =>
                                    item.id ===
                                    notification.id

                                        ? {
                                            ...item,

                                            read:
                                                true
                                        }

                                        : item
                            )
                    );


                    setUnreadCount(
                        (
                            previous
                        ) =>
                            Math.max(
                                previous - 1,
                                0
                            )
                    );
                }


                // =============================================
                // GET DESTINATION
                // =============================================

                const destination =
                    getNotificationDestination(
                        notification
                    );


                setOpen(
                    false
                );


                if (
                    destination
                ) {

                    navigate(
                        destination
                    );
                }

            } catch (
                requestError
            ) {

                console.error(
                    "Notification click error:",
                    requestError
                );


                setError(
                    requestError.response
                        ?.data
                        ?.message ||
                    "Unable to open notification."
                );
            }
        };


    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    const markAllAsRead =
        async () => {

            if (
                unreadCount === 0
            ) {

                return;
            }


            try {

                await axiosInstance.patch(
                    "/api/notifications/read-all"
                );


                setNotifications(
                    (
                        previous
                    ) =>
                        previous.map(
                            (
                                notification
                            ) => ({
                                ...notification,

                                read:
                                    true
                            })
                        )
                );


                setUnreadCount(
                    0
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Mark all notifications read error:",
                    requestError
                );


                setError(
                    requestError.response
                        ?.data
                        ?.message ||
                    "Unable to mark notifications as read."
                );
            }
        };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate =
        (
            date
        ) => {

            if (
                !date
            ) {

                return "";
            }


            const value =
                new Date(
                    date
                );


            if (
                Number.isNaN(
                    value.getTime()
                )
            ) {

                return "";
            }


            const now =
                new Date();


            const difference =
                now.getTime() -
                value.getTime();


            const minutes =
                Math.floor(
                    difference /
                    60000
                );


            if (
                minutes < 1
            ) {

                return "Just now";
            }


            if (
                minutes < 60
            ) {

                return `${minutes}m ago`;
            }


            const hours =
                Math.floor(
                    minutes / 60
                );


            if (
                hours < 24
            ) {

                return `${hours}h ago`;
            }


            const days =
                Math.floor(
                    hours / 24
                );


            if (
                days < 7
            ) {

                return `${days}d ago`;
            }


            return value.toLocaleDateString(
                undefined,
                {
                    day:
                        "numeric",

                    month:
                        "short",

                    year:
                        "numeric"
                }
            );
        };


    // =====================================================
    // NOTIFICATION ICON
    // =====================================================

    const getNotificationIcon =
        (
            notification
        ) => {

            // =============================================
            // NEW APPLICATION
            // =============================================

            if (
                notification?.type ===
                    "NEW_APPLICATION"
            ) {

                return "bi bi-person-plus-fill";
            }


            // =============================================
            // APPLICATION WITHDRAWN
            // =============================================

            if (
                notification?.type ===
                    "APPLICATION_WITHDRAWN"
            ) {

                return "bi bi-person-dash-fill";
            }


            // =============================================
            // INTERVIEW SCHEDULED
            // =============================================

            if (
                notification?.type ===
                    "INTERVIEW_SCHEDULED"
            ) {

                return "bi bi-calendar-check-fill";
            }


            // =============================================
            // INTERVIEW RESCHEDULED
            // =============================================

            if (
                notification?.type ===
                    "INTERVIEW_RESCHEDULED"
            ) {

                return "bi bi-calendar-event-fill";
            }


            // =============================================
            // INTERVIEW CANCELLED
            // =============================================

            if (
                notification?.type ===
                    "INTERVIEW_CANCELLED"
            ) {

                return "bi bi-calendar-x-fill";
            }


            // =============================================
            // INTERVIEW COMPLETED
            // =============================================

            if (
                notification?.type ===
                    "INTERVIEW_COMPLETED"
            ) {

                return "bi bi-check-circle-fill";
            }


            // =============================================
            // OFFER SENT
            // =============================================

            if (
                notification?.type ===
                    "OFFER_SENT"
            ) {

                return "bi bi-envelope-paper-fill";
            }


            // =============================================
            // OFFER ACCEPTED
            // =============================================

            if (
                notification?.type ===
                    "OFFER_ACCEPTED"
            ) {

                return "bi bi-patch-check-fill";
            }


            // =============================================
            // OFFER REJECTED
            // =============================================

            if (
                notification?.type ===
                    "OFFER_REJECTED"
            ) {

                return "bi bi-x-octagon-fill";
            }


            // =============================================
            // OFFER WITHDRAWN
            // =============================================

            if (
                notification?.type ===
                    "OFFER_WITHDRAWN"
            ) {

                return "bi bi-envelope-x-fill";
            }


            // =============================================
            // APPLICATION STATUS FALLBACK
            // =============================================

            const title =
                (
                    notification?.title ||
                    ""
                )
                    .toLowerCase();


            if (
                title.includes(
                    "shortlisted"
                )
            ) {

                return "bi bi-star-fill";
            }


            if (
                title.includes(
                    "selected"
                )
            ) {

                return "bi bi-trophy-fill";
            }


            if (
                title.includes(
                    "rejected"
                )
            ) {

                return "bi bi-x-circle-fill";
            }


            if (
                title.includes(
                    "review"
                )
            ) {

                return "bi bi-eye-fill";
            }


            if (
                title.includes(
                    "interview"
                )
            ) {

                return "bi bi-camera-video-fill";
            }


            return "bi bi-bell-fill";
        };


    // =====================================================
    // NOTIFICATION TYPE LABEL
    // =====================================================

    const getNotificationTypeLabel =
        (
            notification
        ) => {

            switch (
                notification?.type
            ) {

                case "NEW_APPLICATION":
                case "APPLICATION_WITHDRAWN":
                case "APPLICATION_STATUS":

                    return "Application";


                case "INTERVIEW_SCHEDULED":
                case "INTERVIEW_RESCHEDULED":
                case "INTERVIEW_CANCELLED":
                case "INTERVIEW_COMPLETED":

                    return "Interview";


                case "OFFER_SENT":
                case "OFFER_ACCEPTED":
                case "OFFER_REJECTED":
                case "OFFER_WITHDRAWN":

                    return "Job Offer";


                default:

                    return "Notification";
            }
        };


    // =====================================================
    // FOOTER LABEL
    // =====================================================

    const getFooterLabel =
        () => {

            if (
                user?.role === "RECRUITER"
            ) {

                return "View My Jobs";
            }


            return "View Applications";
        };


    // =====================================================
    // FOOTER CLICK
    // =====================================================

    const handleFooterClick =
        () => {

            setOpen(
                false
            );


            if (
                user?.role === "RECRUITER"
            ) {

                navigate(
                    "/recruiter/jobs"
                );

                return;
            }


            navigate(
                "/candidate/applications"
            );
        };


    // =====================================================
    // ROLE CHECK
    // =====================================================

    if (
        user?.role !== "CANDIDATE" &&
        user?.role !== "RECRUITER"
    ) {

        return null;
    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <div
            className="hireflow-notification-wrapper"
            ref={
                dropdownRef
            }
        >

            {/* =============================================
                BELL
            ============================================= */}

            <button
                type="button"

                className={
                    `hireflow-notification-bell ${
                        open
                            ? "active"
                            : ""
                    }`
                }

                onClick={
                    handleToggle
                }

                aria-label="Notifications"

                title="Notifications"
            >

                <i className="bi bi-bell"></i>


                {/* UNREAD BADGE */}

                {unreadCount > 0 && (

                    <span className="hireflow-notification-count">

                        {unreadCount > 99
                            ? "99+"
                            : unreadCount
                        }

                    </span>

                )}

            </button>


            {/* =============================================
                DROPDOWN
            ============================================= */}

            {open && (

                <div className="hireflow-notification-dropdown">


                    {/* =====================================
                        HEADER
                    ===================================== */}

                    <div className="hireflow-notification-header">

                        <div>

                            <span>
                                Notifications
                            </span>


                            <p>

                                {unreadCount > 0

                                    ? `${unreadCount} unread ${
                                        unreadCount === 1
                                            ? "notification"
                                            : "notifications"
                                    }`

                                    : "You're all caught up"
                                }

                            </p>

                        </div>


                        {/* MARK ALL */}

                        {unreadCount > 0 && (

                            <button
                                type="button"

                                onClick={
                                    markAllAsRead
                                }
                            >

                                Mark all read

                            </button>

                        )}

                    </div>


                    {/* =====================================
                        BODY
                    ===================================== */}

                    <div className="hireflow-notification-body">


                        {/* LOADING */}

                        {loading && (

                            <div className="hireflow-notification-loading">

                                <div className="spinner-border spinner-border-sm text-primary"></div>

                                <span>
                                    Loading notifications...
                                </span>

                            </div>

                        )}


                        {/* ERROR */}

                        {!loading &&
                            error && (

                            <div className="hireflow-notification-error">

                                <i className="bi bi-exclamation-circle"></i>

                                <span>
                                    {error}
                                </span>

                            </div>

                        )}


                        {/* EMPTY */}

                        {!loading &&
                            !error &&
                            notifications.length ===
                                0 && (

                            <div className="hireflow-notification-empty">

                                <div>

                                    <i className="bi bi-bell"></i>

                                </div>


                                <h6>
                                    No notifications yet
                                </h6>


                                <p>

                                    {user?.role ===
                                        "RECRUITER"

                                        ? "Candidate application and job offer activity will appear here."

                                        : "Application, interview and job offer updates will appear here."
                                    }

                                </p>

                            </div>

                        )}


                        {/* =================================
                            NOTIFICATION LIST
                        ================================= */}

                        {!loading &&
                            !error &&
                            notifications
                                .slice(
                                    0,
                                    10
                                )
                                .map(
                                    (
                                        notification
                                    ) => (

                                    <button
                                        type="button"

                                        key={
                                            notification.id
                                        }

                                        className={
                                            `hireflow-notification-item ${
                                                !notification.read
                                                    ? "unread"
                                                    : ""
                                            }`
                                        }

                                        onClick={
                                            () =>
                                                handleNotificationClick(
                                                    notification
                                                )
                                        }
                                    >

                                        {/* ICON */}

                                        <div className="hireflow-notification-icon">

                                            <i
                                                className={
                                                    getNotificationIcon(
                                                        notification
                                                    )
                                                }
                                            ></i>

                                        </div>


                                        {/* CONTENT */}

                                        <div className="hireflow-notification-content">

                                            <div className="hireflow-notification-title">

                                                <strong>

                                                    {
                                                        notification.title ||
                                                        "Notification"
                                                    }

                                                </strong>


                                                {!notification.read && (

                                                    <span></span>

                                                )}

                                            </div>


                                            <p>

                                                {
                                                    notification.message
                                                }

                                            </p>


                                            <div className="hireflow-notification-meta">

                                                <small>

                                                    {getNotificationTypeLabel(
                                                        notification
                                                    )}

                                                </small>


                                                <small>

                                                    {formatDate(
                                                        notification.createdAt
                                                    )}

                                                </small>

                                            </div>

                                        </div>

                                    </button>

                                )
                            )}

                    </div>


                    {/* =====================================
                        FOOTER
                    ===================================== */}

                    {notifications.length >
                        0 && (

                        <div className="hireflow-notification-footer">

                            <button
                                type="button"

                                onClick={
                                    handleFooterClick
                                }
                            >

                                {getFooterLabel()}

                                <i className="bi bi-arrow-right"></i>

                            </button>

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}


export default NotificationBell;