import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import { Link } from "react-router-dom";

import axiosInstance
    from "../../api/axiosInstance";

import "./Applications.css";


// =====================================================
// STATUS FILTERS
// =====================================================

const STATUS_OPTIONS = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED",
    "REJECTED",
    "WITHDRAWN"
];


// =====================================================
// RECRUITMENT PIPELINE
// =====================================================

const PIPELINE_STAGES = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED"
];


function Applications() {

    // =====================================================
    // APPLICATION STATE
    // =====================================================

    const [
        applications,
        setApplications
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    const [
        withdrawingId,
        setWithdrawingId
    ] = useState(null);


    // =====================================================
    // FILTER STATE
    // =====================================================

    const [
        searchText,
        setSearchText
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("ALL");


    // =====================================================
    // DETAILS STATE
    // =====================================================

    const [
        selectedApplication,
        setSelectedApplication
    ] = useState(null);


    const [
        detailsLoading,
        setDetailsLoading
    ] = useState(false);


    const [
        detailsError,
        setDetailsError
    ] = useState("");


    const [
        history,
        setHistory
    ] = useState([]);


    const [
        applicationInterviews,
        setApplicationInterviews
    ] = useState([]);


    // =====================================================
    // ERROR MESSAGE
    // =====================================================

    const getBackendErrorMessage = (
        requestError,
        fallbackMessage
    ) => {

        const data =
            requestError?.response?.data;


        if (
            typeof data === "string" &&
            data.trim()
        ) {

            return data.trim();
        }


        if (
            typeof data?.message ===
                "string" &&
            data.message.trim()
        ) {

            return data.message.trim();
        }


        if (
            typeof data?.error ===
                "string" &&
            data.error.trim()
        ) {

            return data.error.trim();
        }


        if (
            !requestError?.response
        ) {

            return (
                requestError?.message ||
                "Unable to connect to the server."
            );
        }


        return fallbackMessage;
    };


    // =====================================================
    // APPLICATION ID
    // =====================================================

    const getApplicationId = (
        application
    ) => {

        return (
            application?.id ||
            application?.applicationId ||
            null
        );
    };


    // =====================================================
    // JOB ID
    // =====================================================

    const getJobId = (
        application
    ) => {

        return (
            application?.jobId ||
            application?.job?.id ||
            null
        );
    };


    // =====================================================
    // JOB TITLE
    // =====================================================

    const getJobTitle = (
        application
    ) => {

        return (
            application?.jobTitle ||
            application?.title ||
            application?.job?.title ||
            "Job"
        );
    };


    // =====================================================
    // COMPANY
    // =====================================================

    const getCompanyName = (
        application
    ) => {

        return (
            application?.companyName ||
            application?.job?.companyName ||
            "Company"
        );
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDateTime = (
        value
    ) => {

        if (!value) {

            return (
                "Not available"
            );
        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );
        }


        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    // =====================================================
    // FORMAT STATUS
    // =====================================================

    const formatStatus = (
        status
    ) => {

        if (!status) {

            return (
                "Unknown"
            );
        }


        return String(
            status
        )
            .replaceAll(
                "_",
                " "
            )
            .toLowerCase()
            .replace(
                /\b\w/g,
                (character) =>
                    character.toUpperCase()
            );
    };


    // =====================================================
    // APPLICATION STATUS CLASS
    // =====================================================

    const getStatusClass = (
        status
    ) => {

        switch (status) {

            case "APPLIED":

                return (
                    "status-applied"
                );


            case "UNDER_REVIEW":

                return (
                    "status-review"
                );


            case "SHORTLISTED":

                return (
                    "status-shortlisted"
                );


            case "INTERVIEW":

                return (
                    "status-interview"
                );


            case "SELECTED":
            case "HIRED":

                return (
                    "status-selected"
                );


            case "REJECTED":

                return (
                    "status-rejected"
                );


            case "WITHDRAWN":

                return (
                    "status-withdrawn"
                );


            default:

                return (
                    "status-default"
                );
        }
    };


    // =====================================================
    // APPLICATION STATUS ICON
    // =====================================================

    const getStatusIcon = (
        status
    ) => {

        switch (status) {

            case "APPLIED":

                return (
                    "bi-send-check"
                );


            case "UNDER_REVIEW":

                return (
                    "bi-search"
                );


            case "SHORTLISTED":

                return (
                    "bi-star"
                );


            case "INTERVIEW":

                return (
                    "bi-camera-video"
                );


            case "SELECTED":
            case "HIRED":

                return (
                    "bi-trophy"
                );


            case "REJECTED":

                return (
                    "bi-x-circle"
                );


            case "WITHDRAWN":

                return (
                    "bi-arrow-return-left"
                );


            default:

                return (
                    "bi-clock-history"
                );
        }
    };


    // =====================================================
    // INTERVIEW STATUS CLASS
    // =====================================================

    const getInterviewStatusClass = (
        status
    ) => {

        switch (status) {

            case "SCHEDULED":

                return (
                    "interview-status-scheduled"
                );


            case "COMPLETED":

                return (
                    "interview-status-completed"
                );


            case "CANCELLED":

                return (
                    "interview-status-cancelled"
                );


            default:

                return (
                    "interview-status-default"
                );
        }
    };


    // =====================================================
    // INTERVIEW STATUS ICON
    // =====================================================

    const getInterviewStatusIcon = (
        status
    ) => {

        switch (status) {

            case "SCHEDULED":

                return (
                    "bi-calendar-check"
                );


            case "COMPLETED":

                return (
                    "bi-check-circle"
                );


            case "CANCELLED":

                return (
                    "bi-x-circle"
                );


            default:

                return (
                    "bi-calendar-event"
                );
        }
    };


    // =====================================================
    // CAN WITHDRAW
    // =====================================================

    const canWithdraw = (
        status
    ) => {

        return ![
            "REJECTED",
            "SELECTED",
            "HIRED",
            "WITHDRAWN"
        ].includes(
            status
        );
    };


    // =====================================================
    // ROUND NUMBER
    // =====================================================

    const getRoundNumber = (
        interview,
        fallbackIndex = 0
    ) => {

        if (
            interview?.roundNumber !==
                null &&
            interview?.roundNumber !==
                undefined
        ) {

            return (
                interview.roundNumber
            );
        }


        return (
            fallbackIndex + 1
        );
    };


    // =====================================================
    // ROUND NAME
    // =====================================================

    const getRoundName = (
        interview,
        fallbackIndex = 0
    ) => {

        if (
            interview?.roundName &&
            String(
                interview.roundName
            ).trim()
        ) {

            return String(
                interview.roundName
            ).trim();
        }


        return (
            `Interview Round ${getRoundNumber(
                interview,
                fallbackIndex
            )}`
        );
    };


    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    const loadApplications =
        useCallback(
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
                            "/api/candidate/applications"
                        );


                    setApplications(
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : []
                    );

                } catch (requestError) {

                    console.error(
                        "Application loading error:",
                        requestError
                    );


                    console.error(
                        "Backend response:",
                        requestError
                            ?.response
                            ?.data
                    );


                    setApplications(
                        []
                    );


                    setError(
                        getBackendErrorMessage(
                            requestError,
                            "Unable to load your applications."
                        )
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            },
            []
        );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadApplications();

    }, [loadApplications]);


    // =====================================================
    // DISABLE BODY SCROLL WHILE MODAL OPEN
    // =====================================================

    useEffect(() => {

        if (
            !selectedApplication
        ) {

            return undefined;
        }


        const previousOverflow =
            document
                .body
                .style
                .overflow;


        document.body.style.overflow =
            "hidden";


        return () => {

            document.body.style.overflow =
                previousOverflow;
        };

    }, [selectedApplication]);


    // =====================================================
    // FILTER APPLICATIONS
    // =====================================================

    const filteredApplications =
        useMemo(
            () => {

                const query =
                    searchText
                        .trim()
                        .toLowerCase();


                return applications.filter(
                    (application) => {

                        const searchableText = [

                            getJobTitle(
                                application
                            ),

                            getCompanyName(
                                application
                            ),

                            application?.location,

                            application?.status,

                            application?.coverLetter,

                            getApplicationId(
                                application
                            )

                        ]
                            .filter(
                                (value) =>
                                    value !== null &&
                                    value !== undefined
                            )
                            .join(
                                " "
                            )
                            .toLowerCase();


                        const matchesSearch =
                            !query ||
                            searchableText.includes(
                                query
                            );


                        const matchesStatus =
                            statusFilter ===
                                "ALL" ||
                            application?.status ===
                                statusFilter;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );
                    }
                );
            },
            [
                applications,
                searchText,
                statusFilter
            ]
        );


    // =====================================================
    // SUMMARY
    // =====================================================

    const summary =
        useMemo(
            () => ({

                total:
                    applications.length,

                review:
                    applications.filter(
                        (application) =>
                            application.status ===
                            "UNDER_REVIEW"
                    ).length,

                shortlisted:
                    applications.filter(
                        (application) =>
                            application.status ===
                            "SHORTLISTED"
                    ).length,

                selected:
                    applications.filter(
                        (application) =>
                            application.status ===
                                "SELECTED" ||
                            application.status ===
                                "HIRED"
                    ).length

            }),
            [
                applications
            ]
        );


    // =====================================================
    // SORT HISTORY
    // =====================================================

    const sortedHistory =
        useMemo(
            () => {

                return [
                    ...history
                ]
                    .sort(
                        (
                            first,
                            second
                        ) => {

                            const firstDate =
                                new Date(
                                    first?.changedAt ||
                                    first?.createdAt ||
                                    0
                                )
                                    .getTime();


                            const secondDate =
                                new Date(
                                    second?.changedAt ||
                                    second?.createdAt ||
                                    0
                                )
                                    .getTime();


                            return (
                                firstDate -
                                secondDate
                            );
                        }
                    );
            },
            [
                history
            ]
        );


    // =====================================================
    // SORT INTERVIEW ROUNDS
    // =====================================================

    const sortedApplicationInterviews =
        useMemo(
            () => {

                return [
                    ...applicationInterviews
                ]
                    .sort(
                        (
                            first,
                            second
                        ) => {

                            const firstRound =
                                Number(
                                    first
                                        ?.roundNumber ??
                                    Number
                                        .MAX_SAFE_INTEGER
                                );


                            const secondRound =
                                Number(
                                    second
                                        ?.roundNumber ??
                                    Number
                                        .MAX_SAFE_INTEGER
                                );


                            if (
                                firstRound !==
                                secondRound
                            ) {

                                return (
                                    firstRound -
                                    secondRound
                                );
                            }


                            return (
                                new Date(
                                    first?.scheduledAt ||
                                    0
                                )
                                    .getTime()
                                -
                                new Date(
                                    second?.scheduledAt ||
                                    0
                                )
                                    .getTime()
                            );
                        }
                    );
            },
            [
                applicationInterviews
            ]
        );


    // =====================================================
    // PIPELINE REACHED STATUSES
    // =====================================================

    const reachedStatuses =
        useMemo(
            () => {

                const values =
                    new Set();


                sortedHistory.forEach(
                    (item) => {

                        if (
                            item?.newStatus
                        ) {

                            values.add(
                                item.newStatus
                            );
                        }
                    }
                );


                if (
                    selectedApplication
                        ?.status
                ) {

                    values.add(
                        selectedApplication
                            .status
                    );
                }


                return values;
            },
            [
                sortedHistory,
                selectedApplication
            ]
        );


    // =====================================================
    // VIEW COMPLETE DETAILS
    // =====================================================

    const handleViewDetails =
        async (
            application
        ) => {

            const applicationId =
                getApplicationId(
                    application
                );


            if (
                !applicationId
            ) {

                setError(
                    "Application ID is missing."
                );

                return;
            }


            setSelectedApplication(
                application
            );

            setHistory(
                []
            );

            setApplicationInterviews(
                []
            );

            setDetailsError(
                ""
            );

            setDetailsLoading(
                true
            );

            setError(
                ""
            );


            const [
                applicationResult,
                historyResult,
                interviewsResult
            ] =
                await Promise.allSettled([

                    axiosInstance.get(
                        `/api/candidate/applications/${applicationId}`
                    ),

                    axiosInstance.get(
                        `/api/applications/${applicationId}/history`
                    ),

                    axiosInstance.get(
                        "/api/candidate/interviews"
                    )

                ]);


            let partialFailure =
                false;


            // =============================================
            // APPLICATION DETAILS
            // =============================================

            if (
                applicationResult.status ===
                "fulfilled"
            ) {

                if (
                    applicationResult
                        .value
                        ?.data
                ) {

                    setSelectedApplication(
                        applicationResult
                            .value
                            .data
                    );
                }

            } else {

                partialFailure =
                    true;


                console.error(
                    "Application details error:",
                    applicationResult.reason
                );
            }


            // =============================================
            // STATUS HISTORY
            // =============================================

            if (
                historyResult.status ===
                "fulfilled"
            ) {

                setHistory(
                    Array.isArray(
                        historyResult
                            .value
                            ?.data
                    )
                        ? historyResult
                            .value
                            .data
                        : []
                );

            } else {

                partialFailure =
                    true;


                console.error(
                    "History loading error:",
                    historyResult.reason
                );


                setHistory(
                    []
                );
            }


            // =============================================
            // INTERVIEWS
            // =============================================

            if (
                interviewsResult.status ===
                "fulfilled"
            ) {

                const interviews =
                    Array.isArray(
                        interviewsResult
                            .value
                            ?.data
                    )
                        ? interviewsResult
                            .value
                            .data
                        : [];


                const matchingInterviews =
                    interviews.filter(
                        (interview) =>

                            String(
                                interview
                                    ?.applicationId
                            )
                            ===
                            String(
                                applicationId
                            )
                    );


                setApplicationInterviews(
                    matchingInterviews
                );

            } else {

                partialFailure =
                    true;


                console.error(
                    "Candidate interviews error:",
                    interviewsResult.reason
                );


                setApplicationInterviews(
                    []
                );
            }


            if (
                partialFailure
            ) {

                setDetailsError(
                    "Some recruitment details could not be loaded. The available information is shown below."
                );
            }


            setDetailsLoading(
                false
            );
        };


    // =====================================================
    // CLOSE DETAILS
    // =====================================================

    const closeDetails = () => {

        setSelectedApplication(
            null
        );

        setHistory(
            []
        );

        setApplicationInterviews(
            []
        );

        setDetailsError(
            ""
        );

        setDetailsLoading(
            false
        );
    };


    // =====================================================
    // WITHDRAW APPLICATION
    // =====================================================

    const handleWithdraw =
        async (
            applicationId
        ) => {

            if (
                !applicationId
            ) {

                return;
            }


            const confirmed =
                window.confirm(
                    "Are you sure you want to withdraw this application?"
                );


            if (
                !confirmed
            ) {

                return;
            }


            setWithdrawingId(
                applicationId
            );

            setError(
                ""
            );

            setSuccess(
                ""
            );

            setDetailsError(
                ""
            );


            try {

                await axiosInstance.delete(
                    `/api/candidate/applications/${applicationId}`
                );


                setSuccess(
                    "Application withdrawn successfully."
                );


                await loadApplications();


                // =============================================
                // UPDATE OPEN DETAILS MODAL
                // =============================================

                if (
                    String(
                        getApplicationId(
                            selectedApplication
                        )
                    ) ===
                    String(
                        applicationId
                    )
                ) {

                    setSelectedApplication(
                        (previous) =>

                            previous
                                ? {
                                    ...previous,
                                    status:
                                        "WITHDRAWN"
                                }
                                : previous
                    );


                    try {

                        const response =
                            await axiosInstance.get(
                                `/api/applications/${applicationId}/history`
                            );


                        setHistory(
                            Array.isArray(
                                response.data
                            )
                                ? response.data
                                : []
                        );

                    } catch (
                        historyError
                    ) {

                        console.error(
                            "History refresh error:",
                            historyError
                        );
                    }
                }

            } catch (requestError) {

                console.error(
                    "Withdraw error:",
                    requestError
                );


                console.error(
                    "Backend response:",
                    requestError
                        ?.response
                        ?.data
                );


                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to withdraw this application."
                    )
                );

            } finally {

                setWithdrawingId(
                    null
                );
            }
        };


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const handleClearFilters =
        () => {

            setSearchText(
                ""
            );

            setStatusFilter(
                "ALL"
            );
        };


    // =====================================================
    // INTERVIEW ROUNDS UI
    // =====================================================

    const renderInterviewRounds =
        () => {

            if (
                sortedApplicationInterviews
                    .length ===
                0
            ) {

                return (

                    <div className="application-rounds-empty">

                        <i className="bi bi-calendar2"></i>

                        <span>
                            No interview rounds have been scheduled yet.
                        </span>

                    </div>
                );
            }


            return (

                <div className="application-interview-rounds">


                    <div className="application-rounds-heading">

                        <div>

                            <i className="bi bi-diagram-3"></i>

                        </div>


                        <span>

                            <small>
                                Interview Process
                            </small>


                            <strong>

                                {sortedApplicationInterviews.length}

                                {" "}

                                {sortedApplicationInterviews.length ===
                                1
                                    ? "Round"
                                    : "Rounds"
                                }

                            </strong>

                        </span>

                    </div>


                    <div className="application-rounds-list">

                        {sortedApplicationInterviews.map(
                            (
                                interview,
                                index
                            ) => {

                                const roundNumber =
                                    getRoundNumber(
                                        interview,
                                        index
                                    );


                                const roundName =
                                    getRoundName(
                                        interview,
                                        index
                                    );


                                return (

                                    <div
                                        className="application-round-card"
                                        key={
                                            interview.id ||
                                            `${roundNumber}-${index}`
                                        }
                                    >


                                        {/* =====================
                                            ROUND HEADER
                                        ===================== */}

                                        <div className="application-round-card-header">


                                            <div className="application-round-title">

                                                <span className="application-round-number">

                                                    Round {roundNumber}

                                                </span>


                                                <div>

                                                    <small>
                                                        Interview Round
                                                    </small>

                                                    <strong>
                                                        {roundName}
                                                    </strong>

                                                </div>

                                            </div>


                                            <span
                                                className={
                                                    `application-interview-status ${getInterviewStatusClass(
                                                        interview.status
                                                    )}`
                                                }
                                            >

                                                <i
                                                    className={
                                                        `bi ${getInterviewStatusIcon(
                                                            interview.status
                                                        )}`
                                                    }
                                                ></i>


                                                {formatStatus(
                                                    interview.status
                                                )}

                                            </span>

                                        </div>


                                        {/* =====================
                                            ROUND META
                                        ===================== */}

                                        <div className="application-round-meta-grid">


                                            <div>

                                                <i className="bi bi-calendar3"></i>

                                                <span>

                                                    <small>
                                                        Date & Time
                                                    </small>

                                                    <strong>

                                                        {formatDateTime(
                                                            interview.scheduledAt
                                                        )}

                                                    </strong>

                                                </span>

                                            </div>


                                            <div>

                                                <i
                                                    className={
                                                        interview.mode ===
                                                        "ONLINE"

                                                            ? "bi bi-camera-video"

                                                            : "bi bi-geo-alt"
                                                    }
                                                ></i>

                                                <span>

                                                    <small>
                                                        Mode
                                                    </small>

                                                    <strong>

                                                        {formatStatus(
                                                            interview.mode
                                                        )}

                                                    </strong>

                                                </span>

                                            </div>

                                        </div>


                                        {/* =====================
                                            ONLINE
                                        ===================== */}

                                        {interview.mode ===
                                            "ONLINE" &&
                                            interview.meetingLink && (

                                            <div className="application-round-location online">

                                                <i className="bi bi-link-45deg"></i>

                                                <div>

                                                    <small>
                                                        Meeting Link
                                                    </small>


                                                    <a
                                                        href={
                                                            interview.meetingLink
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >

                                                        {interview.meetingLink}

                                                    </a>

                                                </div>

                                            </div>

                                        )}


                                        {/* =====================
                                            OFFLINE
                                        ===================== */}

                                        {interview.mode ===
                                            "OFFLINE" &&
                                            interview.location && (

                                            <div className="application-round-location">

                                                <i className="bi bi-geo-alt-fill"></i>

                                                <div>

                                                    <small>
                                                        Interview Location
                                                    </small>

                                                    <strong>

                                                        {interview.location}

                                                    </strong>

                                                </div>

                                            </div>

                                        )}


                                        {/* =====================
                                            NOTES
                                        ===================== */}

                                        {interview.notes && (

                                            <div className="application-round-notes">

                                                <i className="bi bi-info-circle"></i>

                                                <p>
                                                    {interview.notes}
                                                </p>

                                            </div>

                                        )}


                                        {/* =====================
                                            JOIN
                                        ===================== */}

                                        {interview.status ===
                                            "SCHEDULED" &&
                                            interview.mode ===
                                                "ONLINE" &&
                                            interview.meetingLink && (

                                            <a
                                                href={
                                                    interview.meetingLink
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="application-join-interview"
                                            >

                                                <i className="bi bi-camera-video-fill"></i>

                                                Join Interview

                                            </a>

                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>
            );
        };


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading
    ) {

        return (

            <div className="applications-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <p>
                    Loading your applications...
                </p>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="applications-page">

            <div className="container-fluid px-lg-5">


                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="applications-header">

                    <div>

                        <span className="applications-eyebrow">
                            Application Tracker
                        </span>

                        <h1>
                            My Applications
                        </h1>

                        <p>
                            Track every application,
                            recruitment stage and interview round.
                        </p>

                    </div>


                    <div className="applications-header-icon">

                        <i className="bi bi-file-earmark-check"></i>

                    </div>

                </div>


                {/* =========================================
                    ALERTS
                ========================================= */}

                {success && (

                    <div className="alert alert-success application-alert">

                        <i className="bi bi-check-circle-fill me-2"></i>

                        {success}

                    </div>

                )}


                {error && (

                    <div className="alert alert-danger application-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                {/* =========================================
                    SUMMARY
                ========================================= */}

                <div className="application-summary-grid">


                    <div className="application-stat-card">

                        <div className="application-stat-icon stat-total">

                            <i className="bi bi-files"></i>

                        </div>

                        <div>

                            <span>
                                Total Applications
                            </span>

                            <strong>
                                {summary.total}
                            </strong>

                        </div>

                    </div>


                    <div className="application-stat-card">

                        <div className="application-stat-icon stat-review">

                            <i className="bi bi-search"></i>

                        </div>

                        <div>

                            <span>
                                Under Review
                            </span>

                            <strong>
                                {summary.review}
                            </strong>

                        </div>

                    </div>


                    <div className="application-stat-card">

                        <div className="application-stat-icon stat-shortlisted">

                            <i className="bi bi-star"></i>

                        </div>

                        <div>

                            <span>
                                Shortlisted
                            </span>

                            <strong>
                                {summary.shortlisted}
                            </strong>

                        </div>

                    </div>


                    <div className="application-stat-card">

                        <div className="application-stat-icon stat-selected">

                            <i className="bi bi-trophy"></i>

                        </div>

                        <div>

                            <span>
                                Selected
                            </span>

                            <strong>
                                {summary.selected}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    SEARCH + FILTER
                ========================================= */}

                {applications.length >
                    0 && (

                    <div className="applications-toolbar">

                        <div>

                            <h5>
                                Your Applications
                            </h5>

                            <p>
                                Search by job, company or application number.
                            </p>

                        </div>


                        <div className="applications-toolbar-actions">


                            <div className="applications-search">

                                <i className="bi bi-search"></i>

                                <input
                                    type="text"
                                    placeholder="Search applications..."
                                    value={
                                        searchText
                                    }
                                    onChange={
                                        (event) =>
                                            setSearchText(
                                                event.target.value
                                            )
                                    }
                                />

                            </div>


                            <select
                                className="applications-status-filter"
                                value={
                                    statusFilter
                                }
                                onChange={
                                    (event) =>
                                        setStatusFilter(
                                            event.target.value
                                        )
                                }
                            >

                                <option value="ALL">
                                    All Statuses
                                </option>


                                {STATUS_OPTIONS.map(
                                    (status) => (

                                        <option
                                            key={
                                                status
                                            }
                                            value={
                                                status
                                            }
                                        >

                                            {formatStatus(
                                                status
                                            )}

                                        </option>

                                    )
                                )}

                            </select>


                            {(searchText.trim() ||
                                statusFilter !==
                                    "ALL") && (

                                <button
                                    type="button"
                                    className="applications-clear-filter"
                                    onClick={
                                        handleClearFilters
                                    }
                                >

                                    <i className="bi bi-x-circle"></i>

                                    Clear

                                </button>

                            )}

                        </div>

                    </div>

                )}


                {/* =========================================
                    EMPTY
                ========================================= */}

                {applications.length ===
                    0 && (

                    <div className="applications-empty">

                        <div className="applications-empty-icon">

                            <i className="bi bi-file-earmark-text"></i>

                        </div>


                        <h3>
                            No applications yet
                        </h3>


                        <p>
                            Start exploring opportunities
                            and apply for jobs that match
                            your skills.
                        </p>


                        <Link
                            to="/candidate/jobs"
                            className="btn browse-jobs-button"
                        >

                            <i className="bi bi-search me-2"></i>

                            Browse Jobs

                        </Link>

                    </div>

                )}


                {/* =========================================
                    FILTER EMPTY
                ========================================= */}

                {applications.length >
                    0 &&
                    filteredApplications.length ===
                    0 && (

                    <div className="applications-filter-empty">

                        <i className="bi bi-search"></i>

                        <h4>
                            No matching applications
                        </h4>

                        <p>
                            Try a different search term or status filter.
                        </p>

                        <button
                            type="button"
                            onClick={
                                handleClearFilters
                            }
                        >
                            Clear Filters
                        </button>

                    </div>

                )}


                {/* =========================================
                    APPLICATION CARDS
                ========================================= */}

                {filteredApplications.length >
                    0 && (

                    <div className="applications-list">

                        {filteredApplications.map(
                            (application) => {

                                const applicationId =
                                    getApplicationId(
                                        application
                                    );


                                const jobId =
                                    getJobId(
                                        application
                                    );


                                return (

                                    <div
                                        className="application-list-card"
                                        key={
                                            applicationId
                                        }
                                    >


                                        {/* COMPANY LOGO */}

                                        <div className="application-company-logo">

                                            {getCompanyName(
                                                application
                                            )
                                                .charAt(0)
                                                .toUpperCase()}

                                        </div>


                                        {/* MAIN */}

                                        <div className="application-main-info">


                                            <div className="application-title-row">

                                                <div>

                                                    <span className="application-company">

                                                        {getCompanyName(
                                                            application
                                                        )}

                                                    </span>

                                                    <h3>

                                                        {getJobTitle(
                                                            application
                                                        )}

                                                    </h3>

                                                </div>


                                                <span
                                                    className={
                                                        `application-status-badge ${getStatusClass(
                                                            application.status
                                                        )}`
                                                    }
                                                >

                                                    <i
                                                        className={
                                                            `bi ${getStatusIcon(
                                                                application.status
                                                            )}`
                                                        }
                                                    ></i>

                                                    {formatStatus(
                                                        application.status
                                                    )}

                                                </span>

                                            </div>


                                            {/* META */}

                                            <div className="application-meta">

                                                {application.location && (

                                                    <span>

                                                        <i className="bi bi-geo-alt"></i>

                                                        {application.location}

                                                    </span>

                                                )}


                                                <span>

                                                    <i className="bi bi-calendar-check"></i>

                                                    Applied{" "}

                                                    {formatDateTime(
                                                        application.appliedAt ||
                                                        application.createdAt
                                                    )}

                                                </span>


                                                <span>

                                                    <i className="bi bi-hash"></i>

                                                    Application {applicationId}

                                                </span>

                                            </div>


                                            {/* COVER LETTER */}

                                            {application.coverLetter && (

                                                <div className="application-cover-preview">

                                                    <i className="bi bi-chat-left-text"></i>

                                                    <p>

                                                        {application
                                                            .coverLetter
                                                            .length >
                                                        150

                                                            ? `${application.coverLetter.substring(
                                                                0,
                                                                150
                                                            )}...`

                                                            : application.coverLetter
                                                        }

                                                    </p>

                                                </div>

                                            )}


                                            {/* ACTIONS */}

                                            <div className="application-actions">


                                                {jobId && (

                                                    <Link
                                                        to={
                                                            `/jobs/${jobId}`
                                                        }
                                                        className="btn application-action-button"
                                                    >

                                                        <i className="bi bi-briefcase me-2"></i>

                                                        View Job

                                                    </Link>

                                                )}


                                                <button
                                                    type="button"
                                                    className="btn application-details-button"
                                                    onClick={
                                                        () =>
                                                            handleViewDetails(
                                                                application
                                                            )
                                                    }
                                                >

                                                    <i className="bi bi-diagram-3 me-2"></i>

                                                    Recruitment Timeline

                                                </button>


                                                {application.resumeUrl && (

                                                    <a
                                                        href={
                                                            application.resumeUrl
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn application-action-button"
                                                    >

                                                        <i className="bi bi-file-earmark-pdf me-2"></i>

                                                        Resume

                                                    </a>

                                                )}


                                                {canWithdraw(
                                                    application.status
                                                ) && (

                                                    <button
                                                        type="button"
                                                        className="btn application-withdraw-button"
                                                        onClick={
                                                            () =>
                                                                handleWithdraw(
                                                                    applicationId
                                                                )
                                                        }
                                                        disabled={
                                                            withdrawingId ===
                                                            applicationId
                                                        }
                                                    >

                                                        {withdrawingId ===
                                                        applicationId ? (

                                                            <>

                                                                <span className="spinner-border spinner-border-sm me-2"></span>

                                                                Withdrawing...

                                                            </>

                                                        ) : (

                                                            <>

                                                                <i className="bi bi-x-circle me-2"></i>

                                                                Withdraw

                                                            </>

                                                        )}

                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>


            {/* =================================================
                APPLICATION DETAILS MODAL
            ================================================= */}

            {selectedApplication && (

                <div
                    className="application-details-overlay"
                    onMouseDown={
                        closeDetails
                    }
                >

                    <div
                        className="application-details-modal"
                        onMouseDown={
                            (event) =>
                                event.stopPropagation()
                        }
                    >


                        {/* =============================
                            HEADER
                        ============================= */}

                        <div className="application-details-header">


                            <div className="application-details-title-wrap">

                                <div className="application-details-company-logo">

                                    {getCompanyName(
                                        selectedApplication
                                    )
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>


                                <div>

                                    <span>

                                        {getCompanyName(
                                            selectedApplication
                                        )}

                                    </span>

                                    <h3>

                                        {getJobTitle(
                                            selectedApplication
                                        )}

                                    </h3>

                                    <small>

                                        Application #

                                        {getApplicationId(
                                            selectedApplication
                                        )}

                                    </small>

                                </div>

                            </div>


                            <div className="application-details-header-actions">

                                <span
                                    className={
                                        `application-status-badge ${getStatusClass(
                                            selectedApplication.status
                                        )}`
                                    }
                                >

                                    <i
                                        className={
                                            `bi ${getStatusIcon(
                                                selectedApplication.status
                                            )}`
                                        }
                                    ></i>

                                    {formatStatus(
                                        selectedApplication.status
                                    )}

                                </span>


                                <button
                                    type="button"
                                    className="application-details-close"
                                    onClick={
                                        closeDetails
                                    }
                                >

                                    <i className="bi bi-x-lg"></i>

                                </button>

                            </div>

                        </div>


                        {/* =============================
                            BODY
                        ============================= */}

                        <div className="application-details-body">

                            {detailsLoading ? (

                                <div className="application-details-loading">

                                    <div
                                        className="spinner-border text-primary"
                                        role="status"
                                    ></div>

                                    <p>
                                        Building your recruitment timeline...
                                    </p>

                                </div>

                            ) : (

                                <>


                                    {detailsError && (

                                        <div className="application-details-warning">

                                            <i className="bi bi-exclamation-triangle"></i>

                                            <span>
                                                {detailsError}
                                            </span>

                                        </div>

                                    )}


                                    {/* =========================
                                        OVERVIEW
                                    ========================= */}

                                    <div className="application-details-overview">


                                        <div>

                                            <i className="bi bi-calendar-check"></i>

                                            <span>

                                                <small>
                                                    Applied On
                                                </small>

                                                <strong>

                                                    {formatDateTime(
                                                        selectedApplication.appliedAt ||
                                                        selectedApplication.createdAt
                                                    )}

                                                </strong>

                                            </span>

                                        </div>


                                        <div>

                                            <i className="bi bi-geo-alt"></i>

                                            <span>

                                                <small>
                                                    Location
                                                </small>

                                                <strong>

                                                    {selectedApplication.location ||
                                                        "Not specified"}

                                                </strong>

                                            </span>

                                        </div>


                                        <div>

                                            <i className="bi bi-activity"></i>

                                            <span>

                                                <small>
                                                    Current Stage
                                                </small>

                                                <strong>

                                                    {formatStatus(
                                                        selectedApplication.status
                                                    )}

                                                </strong>

                                            </span>

                                        </div>

                                    </div>


                                    {/* =========================
                                        PIPELINE
                                    ========================= */}

                                    <div className="application-pipeline-card">


                                        <div className="application-section-heading">

                                            <div>

                                                <i className="bi bi-signpost-split"></i>

                                            </div>

                                            <span>

                                                <small>
                                                    Recruitment Pipeline
                                                </small>

                                                <strong>
                                                    Current Progress
                                                </strong>

                                            </span>

                                        </div>


                                        <div className="application-pipeline">

                                            {PIPELINE_STAGES.map(
                                                (
                                                    stage,
                                                    index
                                                ) => {

                                                    const reached =
                                                        reachedStatuses.has(
                                                            stage
                                                        );


                                                    const current =
                                                        selectedApplication.status ===
                                                        stage;


                                                    return (

                                                        <div
                                                            className="application-pipeline-step-wrap"
                                                            key={
                                                                stage
                                                            }
                                                        >

                                                            <div
                                                                className={
                                                                    `application-pipeline-step ${
                                                                        reached
                                                                            ? "reached"
                                                                            : ""
                                                                    } ${
                                                                        current
                                                                            ? "current"
                                                                            : ""
                                                                    }`
                                                                }
                                                            >

                                                                <i
                                                                    className={
                                                                        `bi ${getStatusIcon(
                                                                            stage
                                                                        )}`
                                                                    }
                                                                ></i>

                                                            </div>


                                                            <span>

                                                                {formatStatus(
                                                                    stage
                                                                )}

                                                            </span>


                                                            {index <
                                                                PIPELINE_STAGES.length -
                                                                1 && (

                                                                <div
                                                                    className={
                                                                        `application-pipeline-line ${
                                                                            reachedStatuses.has(
                                                                                PIPELINE_STAGES[
                                                                                    index +
                                                                                    1
                                                                                ]
                                                                            )
                                                                                ? "reached"
                                                                                : ""
                                                                        }`
                                                                    }
                                                                ></div>

                                                            )}

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>


                                        {[
                                            "REJECTED",
                                            "WITHDRAWN"
                                        ].includes(
                                            selectedApplication.status
                                        ) && (

                                            <div
                                                className={
                                                    `application-terminal-state ${
                                                        selectedApplication.status ===
                                                        "REJECTED"
                                                            ? "rejected"
                                                            : "withdrawn"
                                                    }`
                                                }
                                            >

                                                <i
                                                    className={
                                                        `bi ${getStatusIcon(
                                                            selectedApplication.status
                                                        )}`
                                                    }
                                                ></i>

                                                <div>

                                                    <small>
                                                        Final Application State
                                                    </small>

                                                    <strong>

                                                        {formatStatus(
                                                            selectedApplication.status
                                                        )}

                                                    </strong>

                                                </div>

                                            </div>

                                        )}

                                    </div>


                                    {/* =========================
                                        RECRUITMENT TIMELINE
                                    ========================= */}

                                    <div className="application-details-section">


                                        <div className="application-section-heading">

                                            <div>

                                                <i className="bi bi-clock-history"></i>

                                            </div>

                                            <span>

                                                <small>
                                                    Application Progress
                                                </small>

                                                <strong>
                                                    Recruitment Timeline
                                                </strong>

                                            </span>

                                        </div>


                                        {sortedHistory.length ===
                                            0 ? (

                                            <div className="application-history-empty">

                                                <i className="bi bi-clock-history"></i>

                                                <p>
                                                    No status history found.
                                                </p>

                                            </div>

                                        ) : (

                                            <div className="application-recruitment-timeline">

                                                {sortedHistory.map(
                                                    (
                                                        historyItem,
                                                        index
                                                    ) => {

                                                        const showRounds =
                                                            historyItem
                                                                .newStatus ===
                                                                "INTERVIEW" &&
                                                            sortedApplicationInterviews
                                                                .length >
                                                                0;


                                                        return (

                                                            <div
                                                                className="application-recruitment-event"
                                                                key={
                                                                    historyItem.id ||
                                                                    `${historyItem.newStatus}-${index}`
                                                                }
                                                            >


                                                                <div className="application-event-axis">

                                                                    <div
                                                                        className={
                                                                            `application-event-marker ${getStatusClass(
                                                                                historyItem.newStatus
                                                                            )}`
                                                                        }
                                                                    >

                                                                        <i
                                                                            className={
                                                                                `bi ${getStatusIcon(
                                                                                    historyItem.newStatus
                                                                                )}`
                                                                            }
                                                                        ></i>

                                                                    </div>


                                                                    {index <
                                                                        sortedHistory.length -
                                                                        1 && (

                                                                        <div className="application-event-line"></div>

                                                                    )}

                                                                </div>


                                                                <div className="application-event-content">


                                                                    <div className="application-event-heading">

                                                                        <div>

                                                                            <small>
                                                                                Application Status
                                                                            </small>

                                                                            <strong>

                                                                                {formatStatus(
                                                                                    historyItem.newStatus
                                                                                )}

                                                                            </strong>

                                                                        </div>


                                                                        <span>

                                                                            {formatDateTime(
                                                                                historyItem.changedAt ||
                                                                                historyItem.createdAt
                                                                            )}

                                                                        </span>

                                                                    </div>


                                                                    {historyItem.oldStatus ? (

                                                                        <p>

                                                                            Status changed from{" "}

                                                                            <strong>

                                                                                {formatStatus(
                                                                                    historyItem.oldStatus
                                                                                )}

                                                                            </strong>

                                                                            {" "}to{" "}

                                                                            <strong>

                                                                                {formatStatus(
                                                                                    historyItem.newStatus
                                                                                )}

                                                                            </strong>.

                                                                        </p>

                                                                    ) : (

                                                                        <p>
                                                                            Application submitted successfully.
                                                                        </p>

                                                                    )}


                                                                    {showRounds && (

                                                                        <div className="application-rounds-inside-timeline">

                                                                            {renderInterviewRounds()}

                                                                        </div>

                                                                    )}

                                                                </div>

                                                            </div>
                                                        );
                                                    }
                                                )}


                                                {/* FALLBACK IF HISTORY DOESN'T CONTAIN INTERVIEW */}

                                                {!sortedHistory.some(
                                                    (item) =>
                                                        item.newStatus ===
                                                        "INTERVIEW"
                                                ) &&
                                                    sortedApplicationInterviews.length >
                                                    0 && (

                                                    <div className="application-recruitment-event">


                                                        <div className="application-event-axis">

                                                            <div className="application-event-marker status-interview">

                                                                <i className="bi bi-camera-video"></i>

                                                            </div>

                                                        </div>


                                                        <div className="application-event-content">

                                                            <div className="application-event-heading">

                                                                <div>

                                                                    <small>
                                                                        Interview Process
                                                                    </small>

                                                                    <strong>
                                                                        Interview Rounds
                                                                    </strong>

                                                                </div>

                                                            </div>


                                                            <div className="application-rounds-inside-timeline">

                                                                {renderInterviewRounds()}

                                                            </div>

                                                        </div>

                                                    </div>

                                                )}

                                            </div>

                                        )}


                                        {sortedHistory.length >
                                            0 &&
                                            sortedApplicationInterviews.length ===
                                                0 &&
                                            selectedApplication.status ===
                                                "INTERVIEW" && (

                                            <div className="application-no-rounds-note">

                                                <i className="bi bi-calendar2"></i>

                                                <span>
                                                    Your application is in the Interview stage. The recruiter has not scheduled a round yet.
                                                </span>

                                            </div>

                                        )}

                                    </div>


                                    {/* =========================
                                        COVER LETTER
                                    ========================= */}

                                    <div className="application-details-section">


                                        <div className="application-section-heading">

                                            <div>

                                                <i className="bi bi-chat-left-text"></i>

                                            </div>

                                            <span>

                                                <small>
                                                    Submitted With Application
                                                </small>

                                                <strong>
                                                    Cover Letter
                                                </strong>

                                            </span>

                                        </div>


                                        {selectedApplication.coverLetter ? (

                                            <div className="application-full-cover-letter">

                                                {selectedApplication.coverLetter}

                                            </div>

                                        ) : (

                                            <div className="application-cover-empty">

                                                No cover letter was submitted with this application.

                                            </div>

                                        )}

                                    </div>

                                </>

                            )}

                        </div>


                        {/* =============================
                            FOOTER
                        ============================= */}

                        <div className="application-details-footer">


                            <div className="application-details-footer-links">


                                {getJobId(
                                    selectedApplication
                                ) && (

                                    <Link
                                        to={
                                            `/jobs/${getJobId(
                                                selectedApplication
                                            )}`
                                        }
                                        className="application-details-secondary"
                                        onClick={
                                            closeDetails
                                        }
                                    >

                                        <i className="bi bi-briefcase"></i>

                                        View Job

                                    </Link>

                                )}


                                {selectedApplication.resumeUrl && (

                                    <a
                                        href={
                                            selectedApplication.resumeUrl
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="application-details-secondary"
                                    >

                                        <i className="bi bi-file-earmark-pdf"></i>

                                        Resume

                                    </a>

                                )}

                            </div>


                            <div className="application-details-footer-actions">


                                {canWithdraw(
                                    selectedApplication.status
                                ) && (

                                    <button
                                        type="button"
                                        className="application-details-withdraw"
                                        onClick={
                                            () =>
                                                handleWithdraw(
                                                    getApplicationId(
                                                        selectedApplication
                                                    )
                                                )
                                        }
                                        disabled={
                                            withdrawingId ===
                                            getApplicationId(
                                                selectedApplication
                                            )
                                        }
                                    >

                                        {withdrawingId ===
                                        getApplicationId(
                                            selectedApplication
                                        ) ? (

                                            <>

                                                <span className="spinner-border spinner-border-sm"></span>

                                                Withdrawing...

                                            </>

                                        ) : (

                                            <>

                                                <i className="bi bi-x-circle"></i>

                                                Withdraw Application

                                            </>

                                        )}

                                    </button>

                                )}


                                <button
                                    type="button"
                                    className="application-details-primary"
                                    onClick={
                                        closeDetails
                                    }
                                >

                                    Close

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


export default Applications;