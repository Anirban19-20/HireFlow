import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import axiosInstance
    from "../../api/axiosInstance";

import "./AdminDashboard.css";


// =========================================================
// FORMAT STATUS
// =========================================================

const formatStatus = (value) => {

    if (!value) {
        return "Unknown";
    }

    return String(value)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
};


// =========================================================
// FORMAT DATE
// =========================================================

const formatDate = (value) => {

    if (!value) {
        return "Not available";
    }

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? "Not available"
        : date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
};


// =========================================================
// EFFECTIVE JOB STATUS
// =========================================================

const getEffectiveJobStatus = (
    job
) => {

    if (!job) {
        return "UNKNOWN";
    }

    if (
        job.status ===
        "CLOSED"
    ) {

        return "CLOSED";
    }

    if (
        job.status === "OPEN" &&
        job.deadline
    ) {

        const deadline =
            new Date(
                `${job.deadline}T23:59:59`
            );

        if (
            !Number.isNaN(
                deadline.getTime()
            ) &&
            deadline.getTime() <
                Date.now()
        ) {

            return "EXPIRED";
        }
    }

    return (
        job.status ||
        "UNKNOWN"
    );
};


// =========================================================
// FORMAT SALARY
// =========================================================

const formatSalary = (
    minimum,
    maximum
) => {

    const formatter =
        new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        );


    if (
        minimum != null &&
        maximum != null
    ) {

        return (
            `${formatter.format(
                Number(minimum)
            )} - ${formatter.format(
                Number(maximum)
            )}`
        );
    }


    if (minimum != null) {

        return (
            `From ${formatter.format(
                Number(minimum)
            )}`
        );
    }


    if (maximum != null) {

        return (
            `Up to ${formatter.format(
                Number(maximum)
            )}`
        );
    }


    return "Not disclosed";
};


// =========================================================
// ADMIN JOBS
// =========================================================

function AdminJobs() {

    // =====================================================
    // STATE
    // =====================================================

    const [
        jobs,
        setJobs
    ] = useState([]);

    const [
        search,
        setSearch
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter
    ] = useState("ALL");

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        refreshing,
        setRefreshing
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        successMessage,
        setSuccessMessage
    ] = useState("");

    const [
        deletingJobId,
        setDeletingJobId
    ] = useState(null);


    // =====================================================
    // LOAD JOBS
    // =====================================================

    const loadJobs =
        useCallback(
            async (
                manualRefresh = false
            ) => {

                if (manualRefresh) {

                    setRefreshing(true);

                } else {

                    setLoading(true);
                }

                setError("");
                setSuccessMessage("");

                try {

                    const response =
                        await axiosInstance.get(
                            "/api/admin/jobs"
                        );


                    setJobs(
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : []
                    );


                } catch (
                    requestError
                ) {

                    console.error(
                        "Admin jobs error:",
                        requestError
                    );

                    setError(
                        requestError
                            ?.response
                            ?.data
                            ?.message ||
                        "Unable to load jobs."
                    );

                } finally {

                    setLoading(false);

                    setRefreshing(false);
                }
            },
            []
        );


    // =====================================================
    // LOAD ON PAGE START
    // =====================================================

    useEffect(() => {

        loadJobs();

    }, [loadJobs]);


    // =====================================================
    // DELETE INVALID JOB
    // =====================================================

    const handleDeleteJob =
        async (job) => {

            if (
                !job ||
                !job.id
            ) {

                setError(
                    "Invalid job selected."
                );

                return;
            }


            const applicationCount =
                Number(
                    job.applicationCount ??
                    0
                );


            let confirmationMessage =
                `Are you sure you want to delete "${job.title || "this job"}"?\n\n`
                +
                "Use this option only when the job is invalid, fake, misleading, inappropriate or incorrectly posted.\n\n";


            if (
                applicationCount > 0
            ) {

                confirmationMessage +=
                    `Warning: This job currently has ${applicationCount} application${applicationCount === 1 ? "" : "s"}.\n\n`;
            }


            confirmationMessage +=
                "This action cannot be undone.";


            const confirmed =
                window.confirm(
                    confirmationMessage
                );


            if (!confirmed) {

                return;
            }


            setDeletingJobId(
                job.id
            );

            setError("");

            setSuccessMessage("");


            try {

                const response =
                    await axiosInstance.delete(
                        `/api/admin/jobs/${job.id}`
                    );


                // =========================================
                // REMOVE DELETED JOB FROM UI
                // =========================================

                setJobs(
                    (currentJobs) =>
                        currentJobs.filter(
                            (currentJob) =>
                                currentJob.id !==
                                job.id
                        )
                );


                setSuccessMessage(
                    response
                        ?.data
                        ?.message ||
                    "Invalid job deleted successfully."
                );


            } catch (
                requestError
            ) {

                console.error(
                    "Admin delete job error:",
                    requestError
                );


                const backendMessage =
                    requestError
                        ?.response
                        ?.data
                        ?.message;


                if (backendMessage) {

                    setError(
                        backendMessage
                    );

                } else if (
                    requestError.code ===
                    "ERR_NETWORK"
                ) {

                    setError(
                        "Unable to connect to the backend server."
                    );

                } else {

                    setError(
                        "Unable to delete this job. It may contain related recruitment records."
                    );
                }


            } finally {

                setDeletingJobId(
                    null
                );
            }
        };


    // =====================================================
    // FILTER JOBS
    // =====================================================

    const filteredJobs =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                return jobs.filter(
                    (job) => {

                        const effectiveStatus =
                            getEffectiveJobStatus(
                                job
                            );


                        const statusMatches =
                            statusFilter ===
                                "ALL" ||
                            effectiveStatus ===
                                statusFilter;


                        const searchMatches =
                            !query ||

                            String(
                                job.title || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                job.companyName || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                job.recruiterName || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                job.location || ""
                            )
                                .toLowerCase()
                                .includes(query);


                        return (
                            statusMatches &&
                            searchMatches
                        );
                    }
                );
            },
            [
                jobs,
                search,
                statusFilter
            ]
        );


    // =====================================================
    // STAT COUNTS
    // =====================================================

    const counts =
        useMemo(
            () => ({

                total:
                    jobs.length,

                open:
                    jobs.filter(
                        (job) =>
                            getEffectiveJobStatus(
                                job
                            ) ===
                            "OPEN"
                    ).length,

                closed:
                    jobs.filter(
                        (job) =>
                            getEffectiveJobStatus(
                                job
                            ) ===
                            "CLOSED"
                    ).length,

                expired:
                    jobs.filter(
                        (job) =>
                            getEffectiveJobStatus(
                                job
                            ) ===
                            "EXPIRED"
                    ).length

            }),
            [jobs]
        );


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <Loader
                text="Loading jobs..."
            />
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-page">

            <div className="container">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <PageHeader
                    eyebrow="Job Oversight"
                    title="All Jobs"
                    text="Review every position posted by recruiters and remove invalid or inappropriate jobs from HireFlow."
                    refreshing={
                        refreshing
                    }
                    onRefresh={() =>
                        loadJobs(true)
                    }
                />


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <Alert
                        text={
                            error
                        }
                    />

                )}


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {successMessage && (

                    <SuccessAlert
                        text={
                            successMessage
                        }
                    />

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="admin-mini-stat-grid">

                    <MiniStat
                        label="Total Jobs"
                        value={
                            counts.total
                        }
                        icon="bi-briefcase"
                    />

                    <MiniStat
                        label="Open"
                        value={
                            counts.open
                        }
                        icon="bi-unlock"
                    />

                    <MiniStat
                        label="Closed"
                        value={
                            counts.closed
                        }
                        icon="bi-lock"
                    />

                    <MiniStat
                        label="Expired"
                        value={
                            counts.expired
                        }
                        icon="bi-clock-history"
                    />

                </div>


                {/* =================================================
                    JOB PANEL
                ================================================= */}

                <section className="admin-panel">


                    {/* =================================================
                        SEARCH + FILTER
                    ================================================= */}

                    <div className="admin-toolbar">


                        {/* SEARCH */}

                        <div className="admin-search-box">

                            <i className="bi bi-search" />

                            <input
                                value={
                                    search
                                }
                                onChange={
                                    (event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                }
                                placeholder="Search jobs, companies, recruiters or locations..."
                            />


                            {search && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    aria-label="Clear search"
                                >

                                    <i className="bi bi-x" />

                                </button>

                            )}

                        </div>


                        {/* FILTER */}

                        <select
                            className="
                                form-select
                                admin-filter-select
                            "
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

                            <option value="OPEN">
                                Open
                            </option>

                            <option value="CLOSED">
                                Closed
                            </option>

                            <option value="EXPIRED">
                                Expired
                            </option>

                        </select>

                    </div>


                    {/* =================================================
                        RESULT COUNT
                    ================================================= */}

                    <div className="admin-result-summary">

                        Showing{" "}
                        {filteredJobs.length}
                        {" "}of{" "}
                        {jobs.length}
                        {" "}jobs

                    </div>


                    {/* =================================================
                        EMPTY STATE
                    ================================================= */}

                    {filteredJobs.length ===
                    0 ? (

                        <Empty
                            title="No jobs found"
                            text="Try changing the current filters."
                        />

                    ) : (

                        // =================================================
                        // JOB CARDS
                        // =================================================

                        <div className="admin-card-list">

                            {filteredJobs.map(
                                (job) => {

                                    const effectiveStatus =
                                        getEffectiveJobStatus(
                                            job
                                        );


                                    const isDeleting =
                                        deletingJobId ===
                                        job.id;


                                    return (

                                        <article
                                            className="admin-record-card"
                                            key={
                                                job.id
                                            }
                                        >


                                            {/* =================================
                                                ICON
                                            ================================= */}

                                            <div className="admin-record-icon admin-record-job-icon">

                                                <i className="bi bi-briefcase-fill" />

                                            </div>


                                            {/* =================================
                                                MAIN CONTENT
                                            ================================= */}

                                            <div className="admin-record-main">


                                                {/* =============================
                                                    TITLE
                                                ============================= */}

                                                <div className="admin-record-title-row">

                                                    <div>

                                                        <span>
                                                            Job #{job.id}
                                                        </span>

                                                        <h3>
                                                            {job.title ||
                                                                "Untitled Job"}
                                                        </h3>

                                                        <p>

                                                            {job.companyName ||
                                                                "Company"}

                                                            {job.recruiterName
                                                                ? ` • ${job.recruiterName}`
                                                                : ""
                                                            }

                                                        </p>

                                                    </div>


                                                    {/* STATUS */}

                                                    <span
                                                        className={
                                                            `admin-status-pill ${
                                                                getJobStatusClass(
                                                                    effectiveStatus
                                                                )
                                                            }`
                                                        }
                                                    >

                                                        {formatStatus(
                                                            effectiveStatus
                                                        )}

                                                    </span>

                                                </div>


                                                {/* =============================
                                                    META INFORMATION
                                                ============================= */}

                                                <div className="admin-record-meta-grid">

                                                    <Meta
                                                        icon="bi-geo-alt"
                                                        label="Location"
                                                        value={
                                                            job.location ||
                                                            "Not specified"
                                                        }
                                                    />

                                                    <Meta
                                                        icon="bi-clock"
                                                        label="Type"
                                                        value={
                                                            formatStatus(
                                                                job.employmentType
                                                            )
                                                        }
                                                    />

                                                    <Meta
                                                        icon="bi-cash-stack"
                                                        label="Salary"
                                                        value={
                                                            formatSalary(
                                                                job.salaryMin,
                                                                job.salaryMax
                                                            )
                                                        }
                                                    />

                                                    <Meta
                                                        icon="bi-people"
                                                        label="Applications"
                                                        value={
                                                            job.applicationCount ??
                                                            0
                                                        }
                                                    />

                                                    <Meta
                                                        icon="bi-calendar3"
                                                        label="Created"
                                                        value={
                                                            formatDate(
                                                                job.createdAt
                                                            )
                                                        }
                                                    />

                                                    <Meta
                                                        icon="bi-calendar-x"
                                                        label="Deadline"
                                                        value={
                                                            formatDate(
                                                                job.deadline
                                                            )
                                                        }
                                                    />

                                                </div>


                                                {/* =============================
                                                    SKILLS
                                                ============================= */}

                                                {job.skills && (

                                                    <div className="admin-skill-row">

                                                        {String(
                                                            job.skills
                                                        )
                                                            .split(
                                                                /[,;|]/
                                                            )
                                                            .map(
                                                                (skill) =>
                                                                    skill.trim()
                                                            )
                                                            .filter(Boolean)
                                                            .slice(
                                                                0,
                                                                8
                                                            )
                                                            .map(
                                                                (skill) => (

                                                                    <span
                                                                        key={
                                                                            skill
                                                                        }
                                                                    >

                                                                        {skill}

                                                                    </span>

                                                                )
                                                            )
                                                        }

                                                    </div>

                                                )}


                                                {/* =============================
                                                    ADMIN MODERATION ACTION
                                                ============================= */}

                                                <div
                                                    className="
                                                        d-flex
                                                        justify-content-between
                                                        align-items-center
                                                        flex-wrap
                                                        gap-2
                                                        mt-3
                                                        pt-3
                                                        border-top
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            text-muted
                                                            small
                                                        "
                                                    >

                                                        <i className="bi bi-shield-check me-1" />

                                                        Admin moderation

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="
                                                            btn
                                                            btn-outline-danger
                                                            btn-sm
                                                            d-inline-flex
                                                            align-items-center
                                                            gap-2
                                                        "
                                                        onClick={() =>
                                                            handleDeleteJob(
                                                                job
                                                            )
                                                        }
                                                        disabled={
                                                            isDeleting
                                                        }
                                                    >

                                                        {isDeleting ? (

                                                            <>

                                                                <span
                                                                    className="
                                                                        spinner-border
                                                                        spinner-border-sm
                                                                    "
                                                                    role="status"
                                                                    aria-hidden="true"
                                                                ></span>

                                                                Deleting...

                                                            </>

                                                        ) : (

                                                            <>

                                                                <i className="bi bi-trash3-fill" />

                                                                Delete Invalid Job

                                                            </>

                                                        )}

                                                    </button>

                                                </div>

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

            </div>

        </div>
    );
}


// =========================================================
// PAGE HEADER
// =========================================================

function PageHeader({
    eyebrow,
    title,
    text,
    refreshing,
    onRefresh
}) {

    return (

        <header className="admin-page-header">

            <div>

                <Link
                    to="/admin/dashboard"
                    className="admin-back-link"
                >

                    <i className="bi bi-arrow-left" />

                    Admin Dashboard

                </Link>


                <span className="admin-eyebrow">
                    {eyebrow}
                </span>


                <h1>
                    {title}
                </h1>


                <p>
                    {text}
                </p>

            </div>


            <button
                type="button"
                className="admin-refresh-button"
                onClick={
                    onRefresh
                }
                disabled={
                    refreshing
                }
            >

                <i
                    className={
                        `bi bi-arrow-clockwise ${
                            refreshing
                                ? "admin-spin"
                                : ""
                        }`
                    }
                />

                Refresh

            </button>

        </header>
    );
}


// =========================================================
// MINI STAT
// =========================================================

function MiniStat({
    label,
    value,
    icon
}) {

    return (

        <div className="admin-mini-stat">

            <div>

                <i
                    className={
                        `bi ${icon}`
                    }
                />

            </div>


            <span>

                <small>
                    {label}
                </small>

                <strong>
                    {value}
                </strong>

            </span>

        </div>
    );
}


// =========================================================
// META
// =========================================================

function Meta({
    icon,
    label,
    value
}) {

    return (

        <div className="admin-record-meta">

            <i
                className={
                    `bi ${icon}`
                }
            />


            <span>

                <small>
                    {label}
                </small>

                <strong>
                    {value}
                </strong>

            </span>

        </div>
    );
}


// =========================================================
// LOADER
// =========================================================

function Loader({
    text
}) {

    return (

        <div className="admin-loading-screen">

            <div className="spinner-border text-primary" />

            <p>
                {text}
            </p>

        </div>
    );
}


// =========================================================
// ERROR ALERT
// =========================================================

function Alert({
    text
}) {

    return (

        <div className="alert alert-danger admin-alert">

            <i className="bi bi-exclamation-triangle-fill" />

            <span>
                {text}
            </span>

        </div>
    );
}


// =========================================================
// SUCCESS ALERT
// =========================================================

function SuccessAlert({
    text
}) {

    return (

        <div className="alert alert-success admin-alert">

            <i className="bi bi-check-circle-fill" />

            <span>
                {text}
            </span>

        </div>
    );
}


// =========================================================
// EMPTY
// =========================================================

function Empty({
    title,
    text
}) {

    return (

        <div className="admin-empty-state">

            <i className="bi bi-briefcase" />

            <h4>
                {title}
            </h4>

            <p>
                {text}
            </p>

        </div>
    );
}


// =========================================================
// JOB STATUS CLASS
// =========================================================

const getJobStatusClass = (
    status
) => {

    switch (status) {

        case "OPEN":

            return "admin-status-open";


        case "CLOSED":

            return "admin-status-closed";


        case "EXPIRED":

            return "admin-status-expired";


        default:

            return "admin-status-default";
    }
};


export default AdminJobs;