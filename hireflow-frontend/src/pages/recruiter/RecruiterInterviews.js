import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import axiosInstance
    from "../../api/axiosInstance";

import "./RecruiterInterviews.css";


// =====================================================
// FILTER OPTIONS
// =====================================================

const STATUS_OPTIONS = [
    "SCHEDULED",
    "COMPLETED",
    "CANCELLED"
];


const MODE_OPTIONS = [
    "ONLINE",
    "OFFLINE"
];


// =====================================================
// EMPTY FORM
// =====================================================

const EMPTY_FORM = {

    roundName: "",

    scheduledAt: "",

    mode: "ONLINE",

    meetingLink: "",

    location: "",

    notes: ""
};


// =====================================================
// RECRUITER INTERVIEWS
// =====================================================

function RecruiterInterviews() {

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
        success,
        setSuccess
    ] = useState("");


    const [
        searchText,
        setSearchText
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("ALL");


    const [
        modeFilter,
        setModeFilter
    ] = useState("ALL");


    const [
        selectedInterview,
        setSelectedInterview
    ] = useState(null);


    const [
        interviewForm,
        setInterviewForm
    ] = useState({
        ...EMPTY_FORM
    });


    const [
        submitting,
        setSubmitting
    ] = useState(false);


    const [
        actionId,
        setActionId
    ] = useState(null);


    // =====================================================
    // ERROR MESSAGE
    // =====================================================

    const getErrorMessage = (
        requestError,
        fallback
    ) => {

        const data =
            requestError
                ?.response
                ?.data;


        if (
            typeof data ===
                "string" &&
            data.trim()
        ) {

            return data.trim();
        }


        if (
            typeof data?.message ===
            "string"
        ) {

            return data.message;
        }


        if (
            typeof data?.error ===
            "string"
        ) {

            return data.error;
        }


        if (
            typeof data?.details ===
            "string"
        ) {

            return data.details;
        }


        if (
            !requestError?.response
        ) {

            return (
                requestError?.message ||
                "Unable to connect to the server."
            );
        }


        return fallback;
    };


    // =====================================================
    // LOAD INTERVIEWS
    // =====================================================

    const loadInterviews =
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
                            "/api/recruiter/interviews"
                        );


                    const data =
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : [];


                    setInterviews(
                        data
                    );

                } catch (requestError) {

                    console.error(
                        "Recruiter interviews error:",
                        requestError
                    );


                    console.error(
                        "Backend response:",
                        requestError
                            ?.response
                            ?.data
                    );


                    setInterviews(
                        []
                    );


                    setError(
                        getErrorMessage(
                            requestError,
                            "Unable to load interviews."
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

        loadInterviews();

    }, [loadInterviews]);


    // =====================================================
    // FORMAT STATUS
    // =====================================================

    const formatStatus = (
        value
    ) => {

        if (!value) {

            return "Unknown";
        }


        return String(
            value
        )
            .replaceAll(
                "_",
                " "
            )
            .toLowerCase()
            .replace(
                /\b\w/g,
                (character) =>
                    character
                        .toUpperCase()
            );
    };


    // =====================================================
    // ROUND LABEL
    // =====================================================

    const getRoundLabel = (
        interview
    ) => {

        if (!interview) {

            return "Interview";
        }


        if (
            interview.roundName &&
            String(
                interview.roundName
            ).trim()
        ) {

            return String(
                interview.roundName
            ).trim();
        }


        if (
            interview.roundNumber !==
                null &&
            interview.roundNumber !==
                undefined
        ) {

            return (
                `Interview Round ${interview.roundNumber}`
            );
        }


        return "Interview";
    };


    // =====================================================
    // ROUND NUMBER LABEL
    // =====================================================

    const getRoundNumberLabel = (
        interview
    ) => {

        if (
            interview?.roundNumber !==
                null &&
            interview?.roundNumber !==
                undefined
        ) {

            return (
                `Round ${interview.roundNumber}`
            );
        }


        return "Interview";
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDateTime = (
        value
    ) => {

        if (!value) {

            return "Not available";
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

            return value;
        }


        return date
            .toLocaleString(
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
    // DATETIME LOCAL
    // =====================================================

    const toDateTimeLocalValue = (
        value
    ) => {

        if (!value) {

            return "";
        }


        return String(
            value
        )
            .substring(
                0,
                16
            );
    };


    // =====================================================
    // JAVA LocalDateTime
    // =====================================================

    const normalizeScheduledAt = (
        value
    ) => {

        if (!value) {

            return null;
        }


        const normalized =
            String(
                value
            )
                .trim();


        if (
            normalized.length ===
            16
        ) {

            return `${normalized}:00`;
        }


        return normalized;
    };


    // =====================================================
    // MINIMUM INTERVIEW DATE
    // =====================================================

    const getMinimumDateTime =
        () => {

            const date =
                new Date(
                    Date.now() +
                    5 * 60 * 1000
                );


            const pad =
                (number) =>
                    String(
                        number
                    )
                        .padStart(
                            2,
                            "0"
                        );


            return (
                `${date.getFullYear()}-` +
                `${pad(
                    date.getMonth() + 1
                )}-` +
                `${pad(
                    date.getDate()
                )}T` +
                `${pad(
                    date.getHours()
                )}:` +
                `${pad(
                    date.getMinutes()
                )}`
            );
        };


    // =====================================================
    // STATUS CSS
    // =====================================================

    const getStatusClass = (
        status
    ) => {

        switch (status) {

            case "SCHEDULED":

                return (
                    "recruiter-interviews-status-scheduled"
                );


            case "COMPLETED":

                return (
                    "recruiter-interviews-status-completed"
                );


            case "CANCELLED":

                return (
                    "recruiter-interviews-status-cancelled"
                );


            default:

                return "";
        }
    };


    // =====================================================
    // UPCOMING
    // =====================================================

    const isUpcoming = (
        interview
    ) => {

        if (
            interview?.status !==
            "SCHEDULED"
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
    // SORT
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

                            const firstDate =
                                new Date(
                                    first?.scheduledAt
                                )
                                    .getTime();


                            const secondDate =
                                new Date(
                                    second?.scheduledAt
                                )
                                    .getTime();


                            if (
                                Number.isNaN(
                                    firstDate
                                )
                            ) {

                                return 1;
                            }


                            if (
                                Number.isNaN(
                                    secondDate
                                )
                            ) {

                                return -1;
                            }


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
    // FILTERED INTERVIEWS
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

                            const searchable = [

                                interview?.candidateName,

                                interview?.candidateEmail,

                                interview?.jobTitle,

                                interview?.location,

                                interview?.meetingLink,

                                interview?.notes,

                                interview?.status,

                                interview?.mode,

                                interview?.roundName,

                                interview?.roundNumber,

                                interview?.applicationId

                            ]
                                .filter(
                                    (value) =>
                                        value !==
                                            null &&
                                        value !==
                                            undefined
                                )
                                .join(
                                    " "
                                )
                                .toLowerCase();


                            const matchesSearch =
                                !query ||
                                searchable.includes(
                                    query
                                );


                            const matchesStatus =
                                statusFilter ===
                                    "ALL" ||

                                interview?.status ===
                                    statusFilter;


                            const matchesMode =
                                modeFilter ===
                                    "ALL" ||

                                interview?.mode ===
                                    modeFilter;


                            return (
                                matchesSearch &&
                                matchesStatus &&
                                matchesMode
                            );
                        }
                    );
            },
            [
                sortedInterviews,
                searchText,
                statusFilter,
                modeFilter
            ]
        );


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalCount =
        interviews.length;


    const upcomingCount =
        interviews
            .filter(
                isUpcoming
            )
            .length;


    const completedCount =
        interviews
            .filter(
                (interview) =>
                    interview?.status ===
                    "COMPLETED"
            )
            .length;


    const cancelledCount =
        interviews
            .filter(
                (interview) =>
                    interview?.status ===
                    "CANCELLED"
            )
            .length;


    // =====================================================
    // OPEN RESCHEDULE
    // =====================================================

    const openRescheduleModal = (
        interview
    ) => {

        if (
            interview?.status !==
            "SCHEDULED"
        ) {

            setError(
                "Only scheduled interviews can be rescheduled."
            );

            return;
        }


        setSelectedInterview(
            interview
        );


        setInterviewForm({

            roundName:
                interview.roundName ||
                "",

            scheduledAt:
                toDateTimeLocalValue(
                    interview.scheduledAt
                ),

            mode:
                interview.mode ||
                "ONLINE",

            meetingLink:
                interview.meetingLink ||
                "",

            location:
                interview.location ||
                "",

            notes:
                interview.notes ||
                ""
        });


        setError(
            ""
        );

        setSuccess(
            ""
        );
    };


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {

        if (
            submitting
        ) {

            return;
        }


        setSelectedInterview(
            null
        );


        setInterviewForm({
            ...EMPTY_FORM
        });
    };


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleFormChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setInterviewForm(
            (previous) => {

                const updated = {

                    ...previous,

                    [name]:
                        value
                };


                if (
                    name ===
                    "mode"
                ) {

                    if (
                        value ===
                        "ONLINE"
                    ) {

                        updated.location =
                            "";

                    } else {

                        updated.meetingLink =
                            "";
                    }
                }


                return updated;
            }
        );
    };


    // =====================================================
    // VALIDATE FORM
    // =====================================================

    const validateForm =
        () => {

            const roundName =
                interviewForm
                    .roundName
                    .trim();


            if (
                roundName.length >
                150
            ) {

                return (
                    "Interview round name cannot exceed 150 characters."
                );
            }


            if (
                !interviewForm
                    .scheduledAt
            ) {

                return (
                    "Interview date and time are required."
                );
            }


            const date =
                new Date(
                    interviewForm
                        .scheduledAt
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return (
                    "Please enter a valid interview date and time."
                );
            }


            if (
                date.getTime() <=
                Date.now()
            ) {

                return (
                    "Interview date and time must be in the future."
                );
            }


            if (
                interviewForm.mode ===
                "ONLINE"
            ) {

                const link =
                    interviewForm
                        .meetingLink
                        .trim();


                if (!link) {

                    return (
                        "Meeting link is required for an online interview."
                    );
                }


                if (
                    !link.startsWith(
                        "http://"
                    ) &&
                    !link.startsWith(
                        "https://"
                    )
                ) {

                    return (
                        "Meeting link must start with http:// or https://."
                    );
                }
            }


            if (
                interviewForm.mode ===
                    "OFFLINE" &&
                !interviewForm
                    .location
                    .trim()
            ) {

                return (
                    "Interview location is required for an offline interview."
                );
            }


            return null;
        };


    // =====================================================
    // RESCHEDULE
    // =====================================================

    const handleReschedule =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                !selectedInterview?.id
            ) {

                return;
            }


            const validationError =
                validateForm();


            if (
                validationError
            ) {

                setError(
                    validationError
                );

                return;
            }


            const payload = {

                roundName:
                    interviewForm
                        .roundName
                        .trim() ||
                    null,

                scheduledAt:
                    normalizeScheduledAt(
                        interviewForm
                            .scheduledAt
                    ),

                mode:
                    interviewForm.mode,

                meetingLink:
                    interviewForm.mode ===
                    "ONLINE"

                        ? interviewForm
                            .meetingLink
                            .trim()

                        : null,

                location:
                    interviewForm.mode ===
                    "OFFLINE"

                        ? interviewForm
                            .location
                            .trim()

                        : null,

                notes:
                    interviewForm
                        .notes
                        .trim() ||
                    null
            };


            setSubmitting(
                true
            );

            setError(
                ""
            );

            setSuccess(
                ""
            );


            try {

                const response =
                    await axiosInstance.put(
                        `/api/recruiter/interviews/${selectedInterview.id}`,
                        payload,
                        {
                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                await loadInterviews();


                setSuccess(
                    `${getRoundLabel(
                        response.data ||
                        selectedInterview
                    )} for ${selectedInterview.candidateName || "candidate"} rescheduled successfully.`
                );


                setSelectedInterview(
                    null
                );


                setInterviewForm({
                    ...EMPTY_FORM
                });

            } catch (requestError) {

                console.error(
                    "Interview reschedule error:",
                    requestError
                );


                console.error(
                    "Backend response:",
                    requestError
                        ?.response
                        ?.data
                );


                setError(
                    getErrorMessage(
                        requestError,
                        "Unable to reschedule interview."
                    )
                );

            } finally {

                setSubmitting(
                    false
                );
            }
        };


    // =====================================================
    // CANCEL INTERVIEW
    // =====================================================

    const handleCancel =
        async (
            interview
        ) => {

            if (
                !interview?.id
            ) {

                return;
            }


            const confirmed =
                window.confirm(
                    `Cancel ${getRoundLabel(
                        interview
                    )} for ${interview.candidateName || "this candidate"}?`
                );


            if (!confirmed) {

                return;
            }


            setActionId(
                interview.id
            );

            setError(
                ""
            );

            setSuccess(
                ""
            );


            try {

                await axiosInstance.patch(
                    `/api/recruiter/interviews/${interview.id}/cancel`
                );


                await loadInterviews();


                setSuccess(
                    `${getRoundLabel(
                        interview
                    )} cancelled successfully.`
                );

            } catch (requestError) {

                console.error(
                    "Interview cancel error:",
                    requestError
                );


                setError(
                    getErrorMessage(
                        requestError,
                        "Unable to cancel interview."
                    )
                );

            } finally {

                setActionId(
                    null
                );
            }
        };


    // =====================================================
    // COMPLETE INTERVIEW
    // =====================================================

    const handleComplete =
        async (
            interview
        ) => {

            if (
                !interview?.id
            ) {

                return;
            }


            const confirmed =
                window.confirm(
                    `Mark ${getRoundLabel(
                        interview
                    )} for ${interview.candidateName || "this candidate"} as completed?`
                );


            if (!confirmed) {

                return;
            }


            setActionId(
                interview.id
            );

            setError(
                ""
            );

            setSuccess(
                ""
            );


            try {

                await axiosInstance.patch(
                    `/api/recruiter/interviews/${interview.id}/complete`
                );


                await loadInterviews();


                setSuccess(
                    `${getRoundLabel(
                        interview
                    )} marked as completed.`
                );

            } catch (requestError) {

                console.error(
                    "Interview completion error:",
                    requestError
                );


                setError(
                    getErrorMessage(
                        requestError,
                        "Unable to complete interview."
                    )
                );

            } finally {

                setActionId(
                    null
                );
            }
        };


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading
    ) {

        return (

            <div className="recruiter-interviews-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>


                <p>
                    Loading interviews...
                </p>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="recruiter-interviews-page">

            <div className="container-fluid px-lg-5">


                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="recruiter-interviews-header">

                    <div>

                        <span className="recruiter-interviews-eyebrow">
                            Recruitment
                        </span>


                        <h1>
                            Interviews
                        </h1>


                        <p>

                            Manage interview rounds,
                            upcoming schedules,
                            completed rounds and
                            cancelled interviews.

                        </p>

                    </div>


                    <button
                        type="button"
                        className="recruiter-interviews-refresh"
                        onClick={
                            loadInterviews
                        }
                    >

                        <i className="bi bi-arrow-clockwise"></i>

                        Refresh

                    </button>

                </div>


                {/* =====================================
                    SUCCESS
                ===================================== */}

                {success && (

                    <div className="alert alert-success recruiter-interviews-alert">

                        <i className="bi bi-check-circle-fill me-2"></i>

                        {success}

                    </div>

                )}


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (

                    <div className="alert alert-danger recruiter-interviews-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                {/* =====================================
                    STATS
                ===================================== */}

                <div className="recruiter-interviews-stats">


                    <div className="recruiter-interviews-stat">

                        <div className="recruiter-interviews-stat-icon">

                            <i className="bi bi-calendar2-check"></i>

                        </div>


                        <div>

                            <span>
                                Total Rounds
                            </span>

                            <strong>
                                {totalCount}
                            </strong>

                        </div>

                    </div>


                    <div className="recruiter-interviews-stat">

                        <div className="recruiter-interviews-stat-icon">

                            <i className="bi bi-clock"></i>

                        </div>


                        <div>

                            <span>
                                Upcoming
                            </span>

                            <strong>
                                {upcomingCount}
                            </strong>

                        </div>

                    </div>


                    <div className="recruiter-interviews-stat">

                        <div className="recruiter-interviews-stat-icon">

                            <i className="bi bi-check-circle"></i>

                        </div>


                        <div>

                            <span>
                                Completed
                            </span>

                            <strong>
                                {completedCount}
                            </strong>

                        </div>

                    </div>


                    <div className="recruiter-interviews-stat">

                        <div className="recruiter-interviews-stat-icon">

                            <i className="bi bi-x-circle"></i>

                        </div>


                        <div>

                            <span>
                                Cancelled
                            </span>

                            <strong>
                                {cancelledCount}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    FILTERS
                ===================================== */}

                <div className="recruiter-interviews-toolbar">


                    <div className="recruiter-interviews-search">

                        <i className="bi bi-search"></i>


                        <input
                            type="text"
                            placeholder="Search candidate, job or round..."
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


                    <select
                        value={
                            modeFilter
                        }
                        onChange={
                            (event) =>
                                setModeFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="ALL">
                            All Modes
                        </option>


                        {MODE_OPTIONS.map(
                            (mode) => (

                                <option
                                    key={
                                        mode
                                    }
                                    value={
                                        mode
                                    }
                                >

                                    {formatStatus(
                                        mode
                                    )}

                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* =====================================
                    EMPTY
                ===================================== */}

                {filteredInterviews.length ===
                    0 && (

                    <div className="recruiter-interviews-empty">

                        <i className="bi bi-calendar-x"></i>


                        <h3>
                            No interviews found
                        </h3>


                        <p>

                            Interview rounds will
                            appear here.

                        </p>

                    </div>

                )}


                {/* =====================================
                    INTERVIEW CARDS
                ===================================== */}

                {filteredInterviews.length >
                    0 && (

                    <div className="recruiter-interviews-list">

                        {filteredInterviews.map(
                            (interview) => {

                                const busy =
                                    actionId ===
                                    interview.id;


                                return (

                                    <div
                                        className="recruiter-interview-card"
                                        key={
                                            interview.id
                                        }
                                    >


                                        {/* =====================
                                            TOP
                                        ===================== */}

                                        <div className="recruiter-interview-card-top">

                                            <div className="recruiter-interview-avatar">

                                                {(
                                                    interview.candidateName ||
                                                    "C"
                                                )
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}

                                            </div>


                                            <div className="recruiter-interview-person">

                                                <span>
                                                    Candidate
                                                </span>


                                                <h3>

                                                    {interview.candidateName ||
                                                        "Candidate"}

                                                </h3>


                                                <p>

                                                    <i className="bi bi-envelope"></i>

                                                    {interview.candidateEmail ||
                                                        "Email not available"}

                                                </p>

                                            </div>


                                            <span
                                                className={
                                                    `recruiter-interviews-status ${getStatusClass(
                                                        interview.status
                                                    )}`
                                                }
                                            >

                                                {formatStatus(
                                                    interview.status
                                                )}

                                            </span>

                                        </div>


                                        {/* =====================
                                            ROUND
                                        ===================== */}

                                        <div className="d-flex align-items-center gap-2 flex-wrap mb-3">

                                            <span className="badge rounded-pill text-bg-primary">

                                                {getRoundNumberLabel(
                                                    interview
                                                )}

                                            </span>


                                            <strong>

                                                {getRoundLabel(
                                                    interview
                                                )}

                                            </strong>

                                        </div>


                                        {/* =====================
                                            JOB
                                        ===================== */}

                                        <div className="recruiter-interview-job">

                                            <i className="bi bi-briefcase"></i>


                                            <div>

                                                <span>
                                                    Position
                                                </span>


                                                <strong>

                                                    {interview.jobTitle ||
                                                        `Job #${interview.jobId}`}

                                                </strong>

                                            </div>

                                        </div>


                                        {/* =====================
                                            DETAILS
                                        ===================== */}

                                        <div className="recruiter-interview-grid">


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


                                            <div>

                                                <i className="bi bi-hash"></i>


                                                <span>

                                                    <small>
                                                        Application
                                                    </small>


                                                    <strong>

                                                        #{interview.applicationId}

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

                                            <div className="recruiter-interview-info">

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

                                            <div className="recruiter-interview-info">

                                                <i className="bi bi-geo-alt-fill"></i>


                                                <div>

                                                    <small>
                                                        Location
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

                                            <div className="recruiter-interview-notes">

                                                <i className="bi bi-info-circle"></i>


                                                <p>
                                                    {interview.notes}
                                                </p>

                                            </div>

                                        )}


                                        {/* =====================
                                            UPCOMING
                                        ===================== */}

                                        {isUpcoming(
                                            interview
                                        ) && (

                                            <div className="recruiter-interview-upcoming">

                                                <i className="bi bi-clock-history"></i>

                                                Upcoming {getRoundLabel(
                                                    interview
                                                )}

                                            </div>

                                        )}


                                        {/* =====================
                                            ACTIONS
                                        ===================== */}

                                        {interview.status ===
                                            "SCHEDULED" && (

                                            <div className="recruiter-interview-card-actions">


                                                <button
                                                    type="button"
                                                    className="recruiter-interview-edit"
                                                    disabled={
                                                        busy
                                                    }
                                                    onClick={() =>
                                                        openRescheduleModal(
                                                            interview
                                                        )
                                                    }
                                                >

                                                    <i className="bi bi-calendar-event"></i>

                                                    Reschedule

                                                </button>


                                                <button
                                                    type="button"
                                                    className="recruiter-interview-cancel"
                                                    disabled={
                                                        busy
                                                    }
                                                    onClick={() =>
                                                        handleCancel(
                                                            interview
                                                        )
                                                    }
                                                >

                                                    <i className="bi bi-calendar-x"></i>

                                                    Cancel

                                                </button>


                                                <button
                                                    type="button"
                                                    className="recruiter-interview-complete"
                                                    disabled={
                                                        busy
                                                    }
                                                    onClick={() =>
                                                        handleComplete(
                                                            interview
                                                        )
                                                    }
                                                >

                                                    {busy ? (

                                                        <span className="spinner-border spinner-border-sm"></span>

                                                    ) : (

                                                        <i className="bi bi-check-circle"></i>

                                                    )}

                                                    Complete

                                                </button>

                                            </div>

                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>


            {/* =============================================
                RESCHEDULE MODAL
            ============================================= */}

            {selectedInterview && (

                <div
                    className="recruiter-interviews-overlay"
                    onClick={
                        closeModal
                    }
                >

                    <div
                        className="recruiter-interviews-modal"
                        onClick={
                            (event) =>
                                event.stopPropagation()
                        }
                    >


                        {/* =============================
                            HEADER
                        ============================= */}

                        <div className="recruiter-interviews-modal-header">

                            <div>

                                <span>
                                    Interview Management
                                </span>


                                <h3>
                                    Reschedule Interview
                                </h3>


                                <p>

                                    {selectedInterview.candidateName}

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    submitting
                                }
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleReschedule
                            }
                        >

                            <div className="recruiter-interviews-modal-body">


                                {/* =========================
                                    ROUND NUMBER
                                ========================= */}

                                <div className="recruiter-interviews-form-group">

                                    <label>
                                        Round Number
                                    </label>


                                    <input
                                        type="text"
                                        value={
                                            selectedInterview.roundNumber !==
                                                null &&
                                            selectedInterview.roundNumber !==
                                                undefined

                                                ? `Round ${selectedInterview.roundNumber}`

                                                : "Interview"
                                        }
                                        disabled
                                    />

                                </div>


                                {/* =========================
                                    ROUND NAME
                                ========================= */}

                                <div className="recruiter-interviews-form-group">

                                    <label>
                                        Round Name
                                    </label>


                                    <input
                                        type="text"
                                        name="roundName"
                                        maxLength="150"
                                        placeholder="Technical Round, HR Round..."
                                        value={
                                            interviewForm.roundName
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    />

                                </div>


                                {/* =========================
                                    DATE
                                ========================= */}

                                <div className="recruiter-interviews-form-group">

                                    <label>

                                        Date & Time

                                        <span>*</span>

                                    </label>


                                    <input
                                        type="datetime-local"
                                        name="scheduledAt"
                                        value={
                                            interviewForm.scheduledAt
                                        }
                                        min={
                                            getMinimumDateTime()
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                </div>


                                {/* =========================
                                    MODE
                                ========================= */}

                                <div className="recruiter-interviews-form-group">

                                    <label>

                                        Mode

                                        <span>*</span>

                                    </label>


                                    <select
                                        name="mode"
                                        value={
                                            interviewForm.mode
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    >

                                        <option value="ONLINE">
                                            Online
                                        </option>


                                        <option value="OFFLINE">
                                            Offline
                                        </option>

                                    </select>

                                </div>


                                {/* =========================
                                    ONLINE LINK
                                ========================= */}

                                {interviewForm.mode ===
                                    "ONLINE" && (

                                    <div className="recruiter-interviews-form-group recruiter-interviews-form-full">

                                        <label>

                                            Meeting Link

                                            <span>*</span>

                                        </label>


                                        <input
                                            type="url"
                                            name="meetingLink"
                                            placeholder="https://meet.google.com/..."
                                            value={
                                                interviewForm.meetingLink
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            required
                                        />

                                    </div>

                                )}


                                {/* =========================
                                    OFFLINE LOCATION
                                ========================= */}

                                {interviewForm.mode ===
                                    "OFFLINE" && (

                                    <div className="recruiter-interviews-form-group recruiter-interviews-form-full">

                                        <label>

                                            Location

                                            <span>*</span>

                                        </label>


                                        <input
                                            type="text"
                                            name="location"
                                            placeholder="Office address"
                                            value={
                                                interviewForm.location
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            required
                                        />

                                    </div>

                                )}


                                {/* =========================
                                    NOTES
                                ========================= */}

                                <div className="recruiter-interviews-form-group recruiter-interviews-form-full">

                                    <label>
                                        Notes
                                    </label>


                                    <textarea
                                        name="notes"
                                        rows="4"
                                        value={
                                            interviewForm.notes
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Interview instructions..."
                                    ></textarea>

                                </div>

                            </div>


                            {/* =============================
                                FOOTER
                            ============================= */}

                            <div className="recruiter-interviews-modal-footer">

                                <button
                                    type="button"
                                    className="recruiter-interviews-modal-cancel"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="recruiter-interviews-modal-submit"
                                    disabled={
                                        submitting
                                    }
                                >

                                    {submitting ? (

                                        <>

                                            <span className="spinner-border spinner-border-sm"></span>

                                            Saving...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-calendar-check"></i>

                                            Save Changes

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}


export default RecruiterInterviews;