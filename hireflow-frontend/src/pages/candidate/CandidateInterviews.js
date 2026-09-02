import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import axiosInstance
    from "../../api/axiosInstance";

import "./CandidateInterviews.css";


// =====================================================
// FILTER OPTIONS
// =====================================================

const STATUS_OPTIONS = [
    "SCHEDULED",
    "COMPLETED",
    "CANCELLED"
];


// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (date) => {

    if (!date) {
        return "Not available";
    }

    const value =
        new Date(date);

    if (
        Number.isNaN(
            value.getTime()
        )
    ) {
        return "Not available";
    }

    return value.toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};


// =====================================================
// FORMAT TIME
// =====================================================

const formatTime = (date) => {

    if (!date) {
        return "Not available";
    }

    const value =
        new Date(date);

    if (
        Number.isNaN(
            value.getTime()
        )
    ) {
        return "Not available";
    }

    return value.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
};


// =====================================================
// FORMAT STATUS
// =====================================================

const formatStatus = (status) => {

    if (!status) {
        return "Unknown";
    }

    return String(status)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
};


// =====================================================
// STATUS CLASS
// =====================================================

const getStatusClass = (status) => {

    switch (status) {

        case "SCHEDULED":
            return "candidate-interview-status-scheduled";

        case "COMPLETED":
            return "candidate-interview-status-completed";

        case "CANCELLED":
            return "candidate-interview-status-cancelled";

        default:
            return "";
    }
};


// =====================================================
// STATUS ICON
// =====================================================

const getStatusIcon = (status) => {

    switch (status) {

        case "SCHEDULED":
            return "bi bi-calendar-check";

        case "COMPLETED":
            return "bi bi-check-circle";

        case "CANCELLED":
            return "bi bi-x-circle";

        default:
            return "bi bi-calendar-event";
    }
};


// =====================================================
// MODE ICON
// =====================================================

const getModeIcon = (mode) => {

    if (mode === "ONLINE") {
        return "bi bi-camera-video";
    }

    return "bi bi-geo-alt";
};


// =====================================================
// ROUND NUMBER
// =====================================================

const getRoundNumber = (
    interview,
    fallbackIndex = 0
) => {

    if (
        interview?.roundNumber !== null &&
        interview?.roundNumber !== undefined
    ) {
        return interview.roundNumber;
    }

    return fallbackIndex + 1;
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
// GROUP KEY
// =====================================================

const getGroupKey = (interview) => {

    if (
        interview?.applicationId !== null &&
        interview?.applicationId !== undefined
    ) {
        return (
            `application-${interview.applicationId}`
        );
    }

    if (
        interview?.jobId !== null &&
        interview?.jobId !== undefined
    ) {
        return (
            `job-${interview.jobId}`
        );
    }

    return (
        `interview-${interview?.id}`
    );
};


// =====================================================
// UPCOMING INTERVIEW
// =====================================================

const isUpcoming = (interview) => {

    if (
        interview?.status !== "SCHEDULED"
    ) {
        return false;
    }

    const date =
        new Date(
            interview.scheduledAt
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return false;
    }

    return (
        date.getTime() >
        Date.now()
    );
};


// =====================================================
// CANDIDATE INTERVIEWS
// =====================================================

function CandidateInterviews() {

    // =====================================================
    // STATE
    // =====================================================

    const [
        interviews,
        setInterviews
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
        filter,
        setFilter
    ] = useState("ALL");

    const [
        searchText,
        setSearchText
    ] = useState("");


    // =====================================================
    // LOAD INTERVIEWS
    // =====================================================

    const loadInterviews =
        useCallback(
            async () => {

                setLoading(true);
                setError("");

                try {

                    const response =
                        await axiosInstance.get(
                            "/api/candidate/interviews"
                        );

                    const data =
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : [];

                    setInterviews(data);

                } catch (requestError) {

                    console.error(
                        "Candidate interviews loading error:",
                        requestError
                    );

                    console.error(
                        "Backend response:",
                        requestError
                            ?.response
                            ?.data
                    );

                    setInterviews([]);

                    setError(
                        requestError
                            ?.response
                            ?.data
                            ?.message ||
                        "Unable to load interviews."
                    );

                } finally {

                    setLoading(false);
                }
            },
            []
        );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadInterviews();

    }, [loadInterviews]);


    // =====================================================
    // SORT ALL INTERVIEWS
    // =====================================================

    const sortedInterviews =
        useMemo(
            () => {

                return [
                    ...interviews
                ]
                    .sort(
                        (
                            first,
                            second
                        ) => {

                            const firstApplication =
                                Number(
                                    first?.applicationId ??
                                    Number.MAX_SAFE_INTEGER
                                );

                            const secondApplication =
                                Number(
                                    second?.applicationId ??
                                    Number.MAX_SAFE_INTEGER
                                );


                            if (
                                firstApplication !==
                                secondApplication
                            ) {
                                return (
                                    firstApplication -
                                    secondApplication
                                );
                            }


                            const firstRound =
                                Number(
                                    first?.roundNumber ??
                                    Number.MAX_SAFE_INTEGER
                                );

                            const secondRound =
                                Number(
                                    second?.roundNumber ??
                                    Number.MAX_SAFE_INTEGER
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


                            const firstDate =
                                new Date(
                                    first?.scheduledAt ||
                                    0
                                )
                                    .getTime();

                            const secondDate =
                                new Date(
                                    second?.scheduledAt ||
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
                interviews
            ]
        );


    // =====================================================
    // FILTER INTERVIEWS
    // =====================================================

    const filteredInterviews =
        useMemo(
            () => {

                const query =
                    searchText
                        .trim()
                        .toLowerCase();


                return sortedInterviews
                    .filter(
                        (interview) => {

                            const matchesStatus =
                                filter === "ALL" ||
                                interview?.status ===
                                    filter;


                            const roundNumber =
                                interview?.roundNumber;


                            const searchableText = [

                                interview?.jobTitle,

                                interview?.roundName,

                                roundNumber !== null &&
                                roundNumber !== undefined
                                    ? `round ${roundNumber}`
                                    : null,

                                interview?.status,

                                interview?.mode,

                                interview?.location,

                                interview?.notes,

                                interview?.applicationId

                            ]
                                .filter(
                                    (value) =>
                                        value !== null &&
                                        value !== undefined
                                )
                                .join(" ")
                                .toLowerCase();


                            const matchesSearch =
                                !query ||
                                searchableText.includes(
                                    query
                                );


                            return (
                                matchesStatus &&
                                matchesSearch
                            );
                        }
                    );
            },
            [
                sortedInterviews,
                filter,
                searchText
            ]
        );


    // =====================================================
    // GROUP BY APPLICATION
    // =====================================================

    const groupedInterviews =
        useMemo(
            () => {

                const groups =
                    new Map();


                filteredInterviews.forEach(
                    (interview) => {

                        const key =
                            getGroupKey(
                                interview
                            );


                        if (
                            !groups.has(key)
                        ) {

                            groups.set(
                                key,
                                {
                                    key,

                                    applicationId:
                                        interview
                                            ?.applicationId ??
                                        null,

                                    jobId:
                                        interview
                                            ?.jobId ??
                                        null,

                                    jobTitle:
                                        interview
                                            ?.jobTitle ||
                                        "Job Interview",

                                    interviews: []
                                }
                            );
                        }


                        groups
                            .get(key)
                            .interviews
                            .push(interview);
                    }
                );


                return Array.from(
                    groups.values()
                )
                    .map(
                        (group) => ({

                            ...group,

                            interviews:
                                [
                                    ...group.interviews
                                ]
                                    .sort(
                                        (
                                            first,
                                            second
                                        ) => {

                                            const firstRound =
                                                Number(
                                                    first?.roundNumber ??
                                                    Number.MAX_SAFE_INTEGER
                                                );

                                            const secondRound =
                                                Number(
                                                    second?.roundNumber ??
                                                    Number.MAX_SAFE_INTEGER
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
                                    )
                        })
                    )
                    .sort(
                        (
                            first,
                            second
                        ) => {

                            const firstUpcoming =
                                first.interviews.find(
                                    isUpcoming
                                );

                            const secondUpcoming =
                                second.interviews.find(
                                    isUpcoming
                                );


                            if (
                                firstUpcoming &&
                                secondUpcoming
                            ) {
                                return (
                                    new Date(
                                        firstUpcoming
                                            .scheduledAt
                                    )
                                        .getTime()
                                    -
                                    new Date(
                                        secondUpcoming
                                            .scheduledAt
                                    )
                                        .getTime()
                                );
                            }


                            if (firstUpcoming) {
                                return -1;
                            }


                            if (secondUpcoming) {
                                return 1;
                            }


                            return String(
                                first.jobTitle
                            )
                                .localeCompare(
                                    String(
                                        second.jobTitle
                                    )
                                );
                        }
                    );
            },
            [
                filteredInterviews
            ]
        );


    // =====================================================
    // STATISTICS
    // =====================================================

    const statistics =
        useMemo(
            () => {

                return {

                    total:
                        interviews.length,

                    scheduled:
                        interviews.filter(
                            (interview) =>
                                interview.status ===
                                "SCHEDULED"
                        ).length,

                    completed:
                        interviews.filter(
                            (interview) =>
                                interview.status ===
                                "COMPLETED"
                        ).length,

                    cancelled:
                        interviews.filter(
                            (interview) =>
                                interview.status ===
                                "CANCELLED"
                        ).length
                };

            },
            [
                interviews
            ]
        );


    // =====================================================
    // JOIN MEETING
    // =====================================================

    const handleJoinMeeting = (
        meetingLink
    ) => {

        if (!meetingLink) {
            return;
        }

        window.open(
            meetingLink,
            "_blank",
            "noopener,noreferrer"
        );
    };


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const handleClearFilters = () => {

        setFilter("ALL");
        setSearchText("");
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="candidate-interviews-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <p>
                    Loading interview rounds...
                </p>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="candidate-interviews-page">

            <div className="container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="candidate-interviews-header">

                    <div>

                        <span className="candidate-interviews-eyebrow">
                            Interview Center
                        </span>

                        <h1>
                            My Interviews
                        </h1>

                        <p>
                            View every interview round,
                            schedule, meeting detail and
                            current interview status.
                        </p>

                    </div>


                    <div className="candidate-interviews-header-icon">

                        <i className="bi bi-calendar2-check"></i>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="alert alert-danger candidate-interviews-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="row g-3 mb-4">


                    {/* TOTAL */}

                    <div className="col-6 col-lg-3">

                        <div className="candidate-interview-stat-card">

                            <div className="candidate-interview-stat-icon total">

                                <i className="bi bi-diagram-3"></i>

                            </div>

                            <div>

                                <span>
                                    Total Rounds
                                </span>

                                <strong>
                                    {statistics.total}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* SCHEDULED */}

                    <div className="col-6 col-lg-3">

                        <div className="candidate-interview-stat-card">

                            <div className="candidate-interview-stat-icon scheduled">

                                <i className="bi bi-calendar-check"></i>

                            </div>

                            <div>

                                <span>
                                    Scheduled
                                </span>

                                <strong>
                                    {statistics.scheduled}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* COMPLETED */}

                    <div className="col-6 col-lg-3">

                        <div className="candidate-interview-stat-card">

                            <div className="candidate-interview-stat-icon completed">

                                <i className="bi bi-check-circle"></i>

                            </div>

                            <div>

                                <span>
                                    Completed
                                </span>

                                <strong>
                                    {statistics.completed}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* CANCELLED */}

                    <div className="col-6 col-lg-3">

                        <div className="candidate-interview-stat-card">

                            <div className="candidate-interview-stat-icon cancelled">

                                <i className="bi bi-x-circle"></i>

                            </div>

                            <div>

                                <span>
                                    Cancelled
                                </span>

                                <strong>
                                    {statistics.cancelled}
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="candidate-interviews-toolbar">

                    <div>

                        <h5>
                            Interview Timeline
                        </h5>

                        <p>
                            Interview rounds are grouped
                            by job application.
                        </p>

                    </div>


                    <div className="candidate-interviews-toolbar-actions">


                        {/* SEARCH */}

                        <div className="candidate-interview-search">

                            <i className="bi bi-search"></i>

                            <input
                                type="text"
                                placeholder="Search job or round..."
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


                        {/* STATUS */}

                        <select
                            value={
                                filter
                            }
                            onChange={
                                (event) =>
                                    setFilter(
                                        event.target.value
                                    )
                            }
                            className="candidate-interview-filter"
                        >

                            <option value="ALL">
                                All Rounds
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


                        {/* CLEAR */}

                        {(filter !== "ALL" ||
                            searchText.trim()) && (

                            <button
                                type="button"
                                className="candidate-interview-clear"
                                onClick={
                                    handleClearFilters
                                }
                            >

                                <i className="bi bi-x-circle"></i>

                                Clear

                            </button>

                        )}


                        {/* REFRESH */}

                        <button
                            type="button"
                            className="candidate-interview-refresh"
                            onClick={
                                loadInterviews
                            }
                        >

                            <i className="bi bi-arrow-clockwise"></i>

                            Refresh

                        </button>

                    </div>

                </div>


                {/* =================================================
                    EMPTY
                ================================================= */}

                {groupedInterviews.length === 0 && (

                    <div className="candidate-interviews-empty">

                        <div>

                            <i className="bi bi-calendar2-week"></i>

                        </div>

                        <h4>
                            No interview rounds found
                        </h4>

                        <p>

                            {filter === "ALL" &&
                            !searchText.trim()

                                ? "When a recruiter schedules an interview round, the details will appear here."

                                : "No interview rounds match your current search or status filter."
                            }

                        </p>


                        {(filter !== "ALL" ||
                            searchText.trim()) && (

                            <button
                                type="button"
                                className="candidate-interview-empty-clear"
                                onClick={
                                    handleClearFilters
                                }
                            >

                                Clear Filters

                            </button>

                        )}

                    </div>

                )}


                {/* =================================================
                    APPLICATION GROUPS
                ================================================= */}

                <div className="candidate-interviews-list">

                    {groupedInterviews.map(
                        (group) => (

                        <section
                            className="candidate-interview-group-card"
                            key={
                                group.key
                            }
                        >


                            {/* =====================================
                                JOB HEADER
                            ===================================== */}

                            <div className="candidate-interview-group-header">

                                <div className="candidate-interview-job">

                                    <div className="candidate-interview-job-icon">

                                        <i className="bi bi-briefcase"></i>

                                    </div>


                                    <div>

                                        <span>
                                            Interview Process
                                        </span>

                                        <h3>
                                            {group.jobTitle}
                                        </h3>

                                    </div>

                                </div>


                                <div className="candidate-interview-group-meta">

                                    <span>

                                        <i className="bi bi-file-earmark-text"></i>

                                        Application #

                                        {group.applicationId ??
                                            "-"}

                                    </span>


                                    <span>

                                        <i className="bi bi-diagram-3"></i>

                                        {group.interviews.length}

                                        {" "}

                                        {group.interviews.length === 1
                                            ? "round"
                                            : "rounds"
                                        }

                                    </span>

                                </div>

                            </div>


                            {/* =====================================
                                TIMELINE
                            ===================================== */}

                            <div className="candidate-interview-timeline">

                                {group.interviews.map(
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

                                        const upcoming =
                                            isUpcoming(
                                                interview
                                            );


                                        return (

                                            <div
                                                className="candidate-interview-round-row"
                                                key={
                                                    interview.id
                                                }
                                            >


                                                {/* =================
                                                    TIMELINE COLUMN
                                                ================= */}

                                                <div className="candidate-interview-timeline-column">

                                                    <div
                                                        className={
                                                            `candidate-interview-timeline-marker ${getStatusClass(
                                                                interview.status
                                                            )}`
                                                        }
                                                    >

                                                        <i
                                                            className={
                                                                getStatusIcon(
                                                                    interview.status
                                                                )
                                                            }
                                                        ></i>

                                                    </div>


                                                    {index <
                                                        group.interviews.length -
                                                        1 && (

                                                        <div className="candidate-interview-timeline-line"></div>

                                                    )}

                                                </div>


                                                {/* =================
                                                    ROUND CARD
                                                ================= */}

                                                <div
                                                    className={
                                                        `candidate-interview-round-card ${
                                                            upcoming
                                                                ? "upcoming"
                                                                : ""
                                                        }`
                                                    }
                                                >


                                                    {/* ROUND HEADER */}

                                                    <div className="candidate-interview-round-header">

                                                        <div className="candidate-interview-round-heading">

                                                            <span className="candidate-interview-round-number">

                                                                Round {roundNumber}

                                                            </span>


                                                            <div>

                                                                <small>
                                                                    Interview Round
                                                                </small>

                                                                <h4>
                                                                    {roundName}
                                                                </h4>

                                                            </div>

                                                        </div>


                                                        <span
                                                            className={
                                                                `candidate-interview-status ${getStatusClass(
                                                                    interview.status
                                                                )}`
                                                            }
                                                        >

                                                            <i
                                                                className={
                                                                    getStatusIcon(
                                                                        interview.status
                                                                    )
                                                                }
                                                            ></i>

                                                            {formatStatus(
                                                                interview.status
                                                            )}

                                                        </span>

                                                    </div>


                                                    {/* UPCOMING */}

                                                    {upcoming && (

                                                        <div className="candidate-interview-upcoming-banner">

                                                            <i className="bi bi-clock-history"></i>

                                                            Upcoming interview round

                                                        </div>

                                                    )}


                                                    {/* INFO */}

                                                    <div className="candidate-interview-information-grid">


                                                        {/* DATE */}

                                                        <div className="candidate-interview-info-item">

                                                            <div>

                                                                <i className="bi bi-calendar3"></i>

                                                            </div>

                                                            <span>

                                                                <small>
                                                                    Interview Date
                                                                </small>

                                                                <strong>

                                                                    {formatDate(
                                                                        interview.scheduledAt
                                                                    )}

                                                                </strong>

                                                            </span>

                                                        </div>


                                                        {/* TIME */}

                                                        <div className="candidate-interview-info-item">

                                                            <div>

                                                                <i className="bi bi-clock"></i>

                                                            </div>

                                                            <span>

                                                                <small>
                                                                    Interview Time
                                                                </small>

                                                                <strong>

                                                                    {formatTime(
                                                                        interview.scheduledAt
                                                                    )}

                                                                </strong>

                                                            </span>

                                                        </div>


                                                        {/* MODE */}

                                                        <div className="candidate-interview-info-item">

                                                            <div>

                                                                <i
                                                                    className={
                                                                        getModeIcon(
                                                                            interview.mode
                                                                        )
                                                                    }
                                                                ></i>

                                                            </div>

                                                            <span>

                                                                <small>
                                                                    Interview Mode
                                                                </small>

                                                                <strong>

                                                                    {formatStatus(
                                                                        interview.mode
                                                                    )}

                                                                </strong>

                                                            </span>

                                                        </div>


                                                        {/* ROUND */}

                                                        <div className="candidate-interview-info-item">

                                                            <div>

                                                                <i className="bi bi-hash"></i>

                                                            </div>

                                                            <span>

                                                                <small>
                                                                    Round Number
                                                                </small>

                                                                <strong>

                                                                    Round {roundNumber}

                                                                </strong>

                                                            </span>

                                                        </div>

                                                    </div>


                                                    {/* ONLINE */}

                                                    {interview.mode ===
                                                        "ONLINE" &&
                                                        interview.meetingLink && (

                                                        <div className="candidate-interview-location-card online">

                                                            <div>

                                                                <i className="bi bi-camera-video-fill"></i>

                                                            </div>

                                                            <span>

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

                                                            </span>

                                                        </div>

                                                    )}


                                                    {/* OFFLINE */}

                                                    {interview.mode ===
                                                        "OFFLINE" &&
                                                        interview.location && (

                                                        <div className="candidate-interview-location-card">

                                                            <div>

                                                                <i className="bi bi-geo-alt-fill"></i>

                                                            </div>

                                                            <span>

                                                                <small>
                                                                    Interview Location
                                                                </small>

                                                                <strong>

                                                                    {interview.location}

                                                                </strong>

                                                            </span>

                                                        </div>

                                                    )}


                                                    {/* NOTES */}

                                                    {interview.notes && (

                                                        <div className="candidate-interview-notes">

                                                            <div className="candidate-interview-notes-title">

                                                                <i className="bi bi-info-circle"></i>

                                                                Interview Notes

                                                            </div>

                                                            <p>
                                                                {interview.notes}
                                                            </p>

                                                        </div>

                                                    )}


                                                    {/* FOOTER */}

                                                    <div className="candidate-interview-card-footer">

                                                        <div>

                                                            <i className="bi bi-eye"></i>

                                                            <span>
                                                                Interview details are managed by the recruiter.
                                                            </span>

                                                        </div>


                                                        {interview.status ===
                                                            "SCHEDULED" &&
                                                            interview.mode ===
                                                                "ONLINE" &&
                                                            interview.meetingLink && (

                                                            <button
                                                                type="button"
                                                                className="candidate-interview-join-button"
                                                                onClick={
                                                                    () =>
                                                                        handleJoinMeeting(
                                                                            interview.meetingLink
                                                                        )
                                                                }
                                                            >

                                                                <i className="bi bi-camera-video-fill"></i>

                                                                Join Interview

                                                            </button>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>


                            {/* =====================================
                                GROUP FOOTER
                            ===================================== */}

                            <div className="candidate-interview-process-footer">

                                <i className="bi bi-info-circle"></i>

                                <span>
                                    New interview rounds will appear here automatically when the recruiter schedules them.
                                </span>

                            </div>

                        </section>

                    ))}

                </div>

            </div>

        </div>
    );
}


export default CandidateInterviews;