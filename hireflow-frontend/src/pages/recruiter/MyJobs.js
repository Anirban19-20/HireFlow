import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import axiosInstance
    from "../../api/axiosInstance";

import "./MyJobs.css";


// =====================================================
// EMPTY PIPELINE
// =====================================================

const EMPTY_PIPELINE = {

    total: 0,

    applied: 0,

    underReview: 0,

    shortlisted: 0,

    interview: 0,

    selected: 0,

    rejected: 0,

    withdrawn: 0,

    loading: false,

    error: false
};


// =====================================================
// BACKEND ERROR MESSAGE
// =====================================================

const getBackendErrorMessage = (
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


    return fallback;
};


// =====================================================
// CALCULATE PIPELINE
// =====================================================

const calculatePipeline = (
    applications
) => {

    const values =
        Array.isArray(
            applications
        )
            ? applications
            : [];


    const count =
        (status) =>

            values.filter(
                (application) =>
                    application?.status ===
                    status
            )
                .length;


    return {

        total:
            values.length,

        applied:
            count(
                "APPLIED"
            ),

        underReview:
            count(
                "UNDER_REVIEW"
            ),

        shortlisted:
            count(
                "SHORTLISTED"
            ),

        interview:
            count(
                "INTERVIEW"
            ),

        selected:
            values.filter(
                (application) =>

                    application?.status ===
                        "SELECTED" ||

                    application?.status ===
                        "HIRED"
            )
                .length,

        rejected:
            count(
                "REJECTED"
            ),

        withdrawn:
            count(
                "WITHDRAWN"
            ),

        loading:
            false,

        error:
            false
    };
};


// =====================================================
// FORMAT EMPLOYMENT TYPE
// =====================================================

const formatEmploymentType = (
    type
) => {

    if (!type) {

        return (
            "Not specified"
        );
    }


    return String(
        type
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
// FORMAT DATE
// =====================================================

const formatDate = (
    value
) => {

    if (!value) {

        return (
            "Not specified"
        );
    }


    const parsedDate =
        new Date(
            value
        );


    if (
        Number.isNaN(
            parsedDate
                .getTime()
        )
    ) {

        return String(
            value
        );
    }


    return parsedDate
        .toLocaleDateString(
            "en-IN",
            {
                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"
            }
        );
};


// =====================================================
// FORMAT SALARY
// =====================================================

const formatSalary = (
    salary
) => {

    if (
        salary === null ||
        salary === undefined
    ) {

        return null;
    }


    return new Intl.NumberFormat(
        "en-IN",
        {
            style:
                "currency",

            currency:
                "INR",

            maximumFractionDigits:
                0
        }
    )
        .format(
            salary
        );
};


// =====================================================
// FORMAT SALARY RANGE
// =====================================================

const formatSalaryRange = (
    job
) => {

    const minimum =
        job?.salaryMin;


    const maximum =
        job?.salaryMax;


    if (
        minimum !== null &&
        minimum !== undefined &&
        maximum !== null &&
        maximum !== undefined
    ) {

        return (
            `${formatSalary(
                minimum
            )} - ${formatSalary(
                maximum
            )}`
        );
    }


    if (
        minimum !== null &&
        minimum !== undefined
    ) {

        return (
            `From ${formatSalary(
                minimum
            )}`
        );
    }


    if (
        maximum !== null &&
        maximum !== undefined
    ) {

        return (
            `Up to ${formatSalary(
                maximum
            )}`
        );
    }


    return (
        "Not disclosed"
    );
};


// =====================================================
// JOB STATUS CLASS
// =====================================================

const getStatusClass = (
    status
) => {

    switch (
        status
    ) {

        case "OPEN":

            return (
                "recruiter-job-status-open"
            );


        case "CLOSED":

            return (
                "recruiter-job-status-closed"
            );


        case "EXPIRED":

            return (
                "recruiter-job-status-expired"
            );


        default:

            return "";
    }
};


// =====================================================
// PIPELINE WIDTH
// =====================================================

const getPipelineWidth = (
    value,
    total
) => {

    if (
        !total ||
        total <=
        0
    ) {

        return (
            "0%"
        );
    }


    return (
        `${Math.min(
            (
                value /
                total
            ) *
            100,
            100
        )}%`
    );
};


// =====================================================
// MY JOBS
// =====================================================

function MyJobs() {

    const navigate =
        useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [
        jobs,
        setJobs
    ] = useState([]);


    const [
        jobPipelines,
        setJobPipelines
    ] = useState({});


    const [
        searchText,
        setSearchText
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
        statusUpdatingId,
        setStatusUpdatingId
    ] = useState(null);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    // =====================================================
    // FETCH ONE JOB PIPELINE
    // =====================================================

    const fetchJobPipeline =
        useCallback(
            async (
                jobId
            ) => {

                const response =
                    await axiosInstance.get(
                        `/api/recruiter/jobs/${jobId}/applications`
                    );


                return calculatePipeline(
                    response.data
                );
            },
            []
        );


    // =====================================================
    // LOAD ALL JOB PIPELINES
    // =====================================================

    const loadJobPipelines =
        useCallback(
            async (
                jobList
            ) => {

                if (
                    !Array.isArray(
                        jobList
                    ) ||
                    jobList.length ===
                    0
                ) {

                    setJobPipelines(
                        {}
                    );

                    return;
                }


                const loadingMap =
                    {};


                jobList.forEach(
                    (job) => {

                        loadingMap[
                            job.id
                        ] = {

                            ...EMPTY_PIPELINE,

                            loading:
                                true
                        };
                    }
                );


                setJobPipelines(
                    loadingMap
                );


                const results =
                    await Promise.allSettled(

                        jobList.map(
                            async (
                                job
                            ) => ({

                                jobId:
                                    job.id,

                                pipeline:
                                    await fetchJobPipeline(
                                        job.id
                                    )
                            })
                        )
                    );


                const nextMap =
                    {};


                results.forEach(
                    (
                        result,
                        index
                    ) => {

                        const jobId =
                            jobList[
                                index
                            ].id;


                        if (
                            result.status ===
                            "fulfilled"
                        ) {

                            nextMap[
                                jobId
                            ] =
                                result
                                    .value
                                    .pipeline;

                        } else {

                            console.error(
                                `Unable to load pipeline for job ${jobId}:`,
                                result.reason
                            );


                            nextMap[
                                jobId
                            ] = {

                                ...EMPTY_PIPELINE,

                                error:
                                    true
                            };
                        }
                    }
                );


                setJobPipelines(
                    nextMap
                );
            },
            [
                fetchJobPipeline
            ]
        );


    // =====================================================
    // LOAD RECRUITER JOBS
    // =====================================================

    const loadJobs =
        useCallback(
            async (
                showPageLoader =
                    false
            ) => {

                if (
                    showPageLoader
                ) {

                    setLoading(
                        true
                    );

                } else {

                    setRefreshing(
                        true
                    );
                }


                setError(
                    ""
                );


                try {

                    const response =
                        await axiosInstance.get(
                            "/api/recruiter/jobs"
                        );


                    const data =
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : [];


                    setJobs(
                        data
                    );


                    await loadJobPipelines(
                        data
                    );

                } catch (
                    requestError
                ) {

                    console.error(
                        "Recruiter jobs loading error:",
                        requestError
                    );


                    setJobs(
                        []
                    );


                    setJobPipelines(
                        {}
                    );


                    setError(
                        getBackendErrorMessage(
                            requestError,
                            "Unable to load your jobs."
                        )
                    );

                } finally {

                    setLoading(
                        false
                    );


                    setRefreshing(
                        false
                    );
                }
            },
            [
                loadJobPipelines
            ]
        );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadJobs(
            true
        );

    }, [loadJobs]);


    // =====================================================
    // RETRY ONE PIPELINE
    // =====================================================

    const retryPipeline =
        async (
            jobId
        ) => {

            setJobPipelines(
                (
                    previous
                ) => ({

                    ...previous,

                    [jobId]: {

                        ...EMPTY_PIPELINE,

                        ...(
                            previous[
                                jobId
                            ] ||
                            {}
                        ),

                        loading:
                            true,

                        error:
                            false
                    }
                })
            );


            try {

                const pipeline =
                    await fetchJobPipeline(
                        jobId
                    );


                setJobPipelines(
                    (
                        previous
                    ) => ({

                        ...previous,

                        [jobId]:
                            pipeline
                    })
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Job pipeline retry error:",
                    requestError
                );


                setJobPipelines(
                    (
                        previous
                    ) => ({

                        ...previous,

                        [jobId]: {

                            ...EMPTY_PIPELINE,

                            error:
                                true
                        }
                    })
                );
            }
        };


    // =====================================================
    // CHANGE JOB STATUS
    // =====================================================

    const handleStatusChange =
        async (
            job,
            newStatus
        ) => {

            const action =
                newStatus ===
                    "CLOSED"

                    ? "close"

                    : "reopen";


            const confirmed =
                window.confirm(
                    `Are you sure you want to ${action} "${job.title}"?`
                );


            if (
                !confirmed
            ) {

                return;
            }


            setStatusUpdatingId(
                job.id
            );


            setError(
                ""
            );


            setSuccess(
                ""
            );


            try {

                const response =
                    await axiosInstance.post(
                        `/api/recruiter/jobs/${job.id}/status`,
                        null,
                        {
                            params: {
                                status:
                                    newStatus
                            }
                        }
                    );


                const updatedJob =
                    response.data &&
                    typeof response.data ===
                        "object"

                        ? response.data

                        : {

                            ...job,

                            status:
                                newStatus
                        };


                setJobs(
                    (
                        previous
                    ) =>

                        previous.map(
                            (
                                existingJob
                            ) =>

                                existingJob.id ===
                                job.id

                                    ? {

                                        ...existingJob,

                                        ...updatedJob,

                                        status:
                                            updatedJob.status ||
                                            newStatus
                                    }

                                    : existingJob
                        )
                );


                setSuccess(
                    newStatus ===
                        "CLOSED"

                        ? "Job closed successfully."

                        : "Job reopened successfully."
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Job status update error:",
                    requestError
                );


                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to update the job status."
                    )
                );

            } finally {

                setStatusUpdatingId(
                    null
                );
            }
        };


    // =====================================================
    // FILTERED JOBS
    // =====================================================

    const filteredJobs =
        useMemo(
            () => {

                const query =
                    searchText
                        .trim()
                        .toLowerCase();


                return jobs.filter(
                    (
                        job
                    ) => {

                        const matchesSearch =
                            !query ||

                            [
                                job.title,
                                job.companyName,
                                job.location,
                                job.skills,
                                job.employmentType
                            ]
                                .filter(
                                    Boolean
                                )
                                .join(
                                    " "
                                )
                                .toLowerCase()
                                .includes(
                                    query
                                );


                        const matchesStatus =
                            statusFilter ===
                                "ALL" ||

                            job.status ===
                                statusFilter;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );
                    }
                );
            },
            [
                jobs,
                searchText,
                statusFilter
            ]
        );


    // =====================================================
    // JOB COUNTS
    // =====================================================

    const openJobs =
        jobs.filter(
            (
                job
            ) =>
                job.status ===
                "OPEN"
        )
            .length;


    const closedJobs =
        jobs.filter(
            (
                job
            ) =>
                job.status ===
                "CLOSED"
        )
            .length;


    const expiredJobs =
        jobs.filter(
            (
                job
            ) =>
                job.status ===
                "EXPIRED"
        )
            .length;


    // =====================================================
    // OVERALL CANDIDATE PIPELINE
    // =====================================================

    const overallPipeline =
        useMemo(
            () =>

                Object.values(
                    jobPipelines
                )
                    .filter(
                        (
                            pipeline
                        ) =>

                            !pipeline.loading &&
                            !pipeline.error
                    )
                    .reduce(
                        (
                            total,
                            pipeline
                        ) => ({

                            total:
                                total.total +
                                pipeline.total,

                            shortlisted:
                                total.shortlisted +
                                pipeline.shortlisted,

                            interview:
                                total.interview +
                                pipeline.interview,

                            selected:
                                total.selected +
                                pipeline.selected
                        }),
                        {

                            total:
                                0,

                            shortlisted:
                                0,

                            interview:
                                0,

                            selected:
                                0
                        }
                    ),
            [
                jobPipelines
            ]
        );


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const clearFilters =
        () => {

            setSearchText(
                ""
            );


            setStatusFilter(
                "ALL"
            );
        };


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading
    ) {

        return (

            <div className="recruiter-jobs-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>


                <p>
                    Loading your jobs and candidate pipelines...
                </p>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="recruiter-jobs-page">

            <div className="container-fluid px-lg-5">


                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="recruiter-jobs-header">

                    <div>

                        <span className="recruiter-jobs-eyebrow">
                            Recruitment Management
                        </span>


                        <h1>
                            My Jobs
                        </h1>


                        <p>

                            Manage your job postings and
                            monitor the candidate pipeline
                            for every role.

                        </p>

                    </div>


                    <div className="recruiter-jobs-header-actions">


                        <button
                            type="button"
                            className="recruiter-jobs-refresh-button"
                            onClick={
                                () =>
                                    loadJobs(
                                        false
                                    )
                            }
                            disabled={
                                refreshing
                            }
                        >

                            {refreshing ? (

                                <span className="spinner-border spinner-border-sm"></span>

                            ) : (

                                <i className="bi bi-arrow-clockwise"></i>

                            )}


                            Refresh

                        </button>


                        <button
                            type="button"
                            className="btn recruiter-post-job-button"
                            onClick={
                                () =>
                                    navigate(
                                        "/recruiter/jobs/create"
                                    )
                            }
                        >

                            <i className="bi bi-plus-lg me-2"></i>

                            Post New Job

                        </button>

                    </div>

                </div>


                {/* =====================================
                    ALERTS
                ===================================== */}

                {success && (

                    <div className="alert alert-success recruiter-job-alert">

                        <i className="bi bi-check-circle-fill me-2"></i>

                        {success}

                    </div>

                )}


                {error && (

                    <div className="alert alert-danger recruiter-job-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                {/* =====================================
                    JOB STATISTICS
                ===================================== */}

                <div className="recruiter-job-stats">


                    <div className="recruiter-job-stat-card">

                        <div className="recruiter-stat-icon recruiter-stat-total">

                            <i className="bi bi-briefcase"></i>

                        </div>


                        <div>

                            <span>
                                Total Jobs
                            </span>

                            <strong>
                                {jobs.length}
                            </strong>

                            <small>
                                All postings
                            </small>

                        </div>

                    </div>


                    <div className="recruiter-job-stat-card">

                        <div className="recruiter-stat-icon recruiter-stat-open">

                            <i className="bi bi-check-circle"></i>

                        </div>


                        <div>

                            <span>
                                Open
                            </span>

                            <strong>
                                {openJobs}
                            </strong>

                            <small>
                                Accepting applications
                            </small>

                        </div>

                    </div>


                    <div className="recruiter-job-stat-card">

                        <div className="recruiter-stat-icon recruiter-stat-closed">

                            <i className="bi bi-lock"></i>

                        </div>


                        <div>

                            <span>
                                Closed
                            </span>

                            <strong>
                                {closedJobs}
                            </strong>

                            <small>
                                No longer accepting
                            </small>

                        </div>

                    </div>


                    <div className="recruiter-job-stat-card">

                        <div className="recruiter-stat-icon recruiter-stat-expired">

                            <i className="bi bi-clock-history"></i>

                        </div>


                        <div>

                            <span>
                                Expired
                            </span>

                            <strong>
                                {expiredJobs}
                            </strong>

                            <small>
                                Deadline passed
                            </small>

                        </div>

                    </div>

                </div>


                {/* =====================================
                    OVERALL PIPELINE
                ===================================== */}

                {jobs.length >
                    0 && (

                    <div className="recruiter-overall-pipeline">


                        <div className="recruiter-overall-pipeline-heading">

                            <div>

                                <span>
                                    Hiring Overview
                                </span>

                                <h4>
                                    Candidate Pipeline Across All Jobs
                                </h4>

                            </div>


                            <small>
                                Live from your job applications
                            </small>

                        </div>


                        <div className="recruiter-overall-pipeline-grid">


                            <div>

                                <span>
                                    Applications
                                </span>

                                <strong>
                                    {overallPipeline.total}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Shortlisted
                                </span>

                                <strong>
                                    {overallPipeline.shortlisted}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Interview
                                </span>

                                <strong>
                                    {overallPipeline.interview}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Selected
                                </span>

                                <strong>
                                    {overallPipeline.selected}
                                </strong>

                            </div>

                        </div>

                    </div>

                )}


                {/* =====================================
                    TOOLBAR
                ===================================== */}

                {jobs.length >
                    0 && (

                    <div className="recruiter-jobs-toolbar">


                        <div className="recruiter-jobs-search">

                            <i className="bi bi-search"></i>


                            <input
                                type="text"
                                placeholder="Search jobs by title, company, location or skill..."
                                value={
                                    searchText
                                }
                                onChange={
                                    (
                                        event
                                    ) =>
                                        setSearchText(
                                            event.target.value
                                        )
                                }
                            />


                            {searchText && (

                                <button
                                    type="button"
                                    onClick={
                                        () =>
                                            setSearchText(
                                                ""
                                            )
                                    }
                                    aria-label="Clear search"
                                >

                                    <i className="bi bi-x-lg"></i>

                                </button>

                            )}

                        </div>


                        <select
                            className="form-select recruiter-status-filter"
                            value={
                                statusFilter
                            }
                            onChange={
                                (
                                    event
                                ) =>
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


                        <div className="recruiter-jobs-result-count">

                            <strong>
                                {filteredJobs.length}
                            </strong>

                            <span>

                                {filteredJobs.length ===
                                1

                                    ? "job"

                                    : "jobs"
                                }

                            </span>

                        </div>

                    </div>

                )}


                {/* =====================================
                    EMPTY JOB LIST
                ===================================== */}

                {jobs.length ===
                    0 && (

                    <div className="recruiter-jobs-empty">

                        <div className="recruiter-jobs-empty-icon">

                            <i className="bi bi-briefcase"></i>

                        </div>


                        <h3>
                            No jobs posted yet
                        </h3>


                        <p>

                            Create your first job posting
                            and start receiving applications.

                        </p>


                        <button
                            type="button"
                            className="btn recruiter-empty-post-button"
                            onClick={
                                () =>
                                    navigate(
                                        "/recruiter/jobs/create"
                                    )
                            }
                        >

                            <i className="bi bi-plus-circle me-2"></i>

                            Post Your First Job

                        </button>

                    </div>

                )}


                {/* =====================================
                    NO FILTER RESULTS
                ===================================== */}

                {jobs.length >
                    0 &&
                    filteredJobs.length ===
                    0 && (

                    <div className="recruiter-jobs-empty">

                        <div className="recruiter-jobs-empty-icon">

                            <i className="bi bi-search"></i>

                        </div>


                        <h3>
                            No matching jobs
                        </h3>


                        <p>

                            Try changing your search
                            or status filter.

                        </p>


                        <button
                            type="button"
                            className="btn recruiter-clear-filter-button"
                            onClick={
                                clearFilters
                            }
                        >

                            Clear Filters

                        </button>

                    </div>

                )}


                {/* =====================================
                    JOB LIST
                ===================================== */}

                {filteredJobs.length >
                    0 && (

                    <div className="recruiter-job-list">

                        {filteredJobs.map(
                            (
                                job
                            ) => {

                                const pipeline =
                                    jobPipelines[
                                        job.id
                                    ] ||
                                    {

                                        ...EMPTY_PIPELINE,

                                        loading:
                                            true
                                    };


                                return (

                                    <article
                                        className="recruiter-job-card"
                                        key={
                                            job.id
                                        }
                                    >


                                        {/* =========================
                                            COMPANY LOGO
                                        ========================= */}

                                        <div className="recruiter-job-company-logo">

                                            {job.companyName

                                                ? String(
                                                    job.companyName
                                                )
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()

                                                : "H"
                                            }

                                        </div>


                                        {/* =========================
                                            JOB CONTENT
                                        ========================= */}

                                        <div className="recruiter-job-main">


                                            {/* TITLE */}

                                            <div className="recruiter-job-title-row">

                                                <div>

                                                    <span className="recruiter-job-company">

                                                        {job.companyName ||
                                                            "Company"}

                                                    </span>


                                                    <h3>
                                                        {job.title}
                                                    </h3>

                                                </div>


                                                <span
                                                    className={
                                                        `recruiter-job-status ${getStatusClass(
                                                            job.status
                                                        )}`
                                                    }
                                                >

                                                    <span></span>

                                                    {job.status}

                                                </span>

                                            </div>


                                            {/* META */}

                                            <div className="recruiter-job-meta">


                                                <span>

                                                    <i className="bi bi-geo-alt"></i>

                                                    {job.location ||
                                                        "Not specified"}

                                                </span>


                                                <span>

                                                    <i className="bi bi-briefcase"></i>

                                                    {formatEmploymentType(
                                                        job.employmentType
                                                    )}

                                                </span>


                                                <span>

                                                    <i className="bi bi-person-workspace"></i>


                                                    {job.experienceRequired !==
                                                        null &&
                                                    job.experienceRequired !==
                                                        undefined

                                                        ? `${job.experienceRequired}+ years`

                                                        : "Experience not specified"
                                                    }

                                                </span>

                                            </div>


                                            {/* INFO */}

                                            <div className="recruiter-job-info-row">


                                                <div>

                                                    <span>
                                                        Salary
                                                    </span>

                                                    <strong>

                                                        {formatSalaryRange(
                                                            job
                                                        )}

                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Deadline
                                                    </span>

                                                    <strong>

                                                        {formatDate(
                                                            job.deadline
                                                        )}

                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Created
                                                    </span>

                                                    <strong>

                                                        {formatDate(
                                                            job.createdAt
                                                        )}

                                                    </strong>

                                                </div>

                                            </div>


                                            {/* SKILLS */}

                                            {job.skills && (

                                                <div className="recruiter-job-skills">

                                                    {String(
                                                        job.skills
                                                    )
                                                        .split(
                                                            ","
                                                        )
                                                        .map(
                                                            (
                                                                skill
                                                            ) =>
                                                                skill.trim()
                                                        )
                                                        .filter(
                                                            Boolean
                                                        )
                                                        .slice(
                                                            0,
                                                            5
                                                        )
                                                        .map(
                                                            (
                                                                skill,
                                                                index
                                                            ) => (

                                                            <span
                                                                key={
                                                                    `${job.id}-${skill}-${index}`
                                                                }
                                                            >

                                                                {skill}

                                                            </span>

                                                        )
                                                    )}

                                                </div>

                                            )}


                                            {/* =========================
                                                CANDIDATE PIPELINE
                                            ========================= */}

                                            <div className="recruiter-job-pipeline">


                                                <div className="recruiter-job-pipeline-header">

                                                    <div>

                                                        <span>
                                                            Candidate Pipeline
                                                        </span>

                                                        <h5>
                                                            Hiring Progress
                                                        </h5>

                                                    </div>


                                                    {!pipeline.loading &&
                                                        !pipeline.error && (

                                                        <button
                                                            type="button"
                                                            onClick={
                                                                () =>
                                                                    navigate(
                                                                        `/recruiter/jobs/${job.id}/applications`
                                                                    )
                                                            }
                                                        >

                                                            View Candidates

                                                            <i className="bi bi-arrow-right"></i>

                                                        </button>

                                                    )}

                                                </div>


                                                {pipeline.loading ? (

                                                    <div className="recruiter-pipeline-loading">

                                                        <span className="spinner-border spinner-border-sm"></span>

                                                        Loading candidate pipeline...

                                                    </div>

                                                ) : pipeline.error ? (

                                                    <div className="recruiter-pipeline-error">


                                                        <div>

                                                            <i className="bi bi-exclamation-circle"></i>

                                                            Candidate pipeline could not be loaded.

                                                        </div>


                                                        <button
                                                            type="button"
                                                            onClick={
                                                                () =>
                                                                    retryPipeline(
                                                                        job.id
                                                                    )
                                                            }
                                                        >

                                                            Retry

                                                        </button>

                                                    </div>

                                                ) : (

                                                    <>


                                                        {/* COUNTS */}

                                                        <div className="recruiter-pipeline-count-grid">


                                                            <div>

                                                                <span>
                                                                    Applications
                                                                </span>

                                                                <strong>
                                                                    {pipeline.total}
                                                                </strong>

                                                            </div>


                                                            <div>

                                                                <span>
                                                                    Shortlisted
                                                                </span>

                                                                <strong>
                                                                    {pipeline.shortlisted}
                                                                </strong>

                                                            </div>


                                                            <div>

                                                                <span>
                                                                    Interview
                                                                </span>

                                                                <strong>
                                                                    {pipeline.interview}
                                                                </strong>

                                                            </div>


                                                            <div>

                                                                <span>
                                                                    Selected
                                                                </span>

                                                                <strong>
                                                                    {pipeline.selected}
                                                                </strong>

                                                            </div>

                                                        </div>


                                                        {/* PROGRESS */}

                                                        <div className="recruiter-pipeline-progress-list">


                                                            <div>

                                                                <div className="recruiter-pipeline-progress-label">

                                                                    <span>
                                                                        Under Review
                                                                    </span>

                                                                    <strong>
                                                                        {pipeline.underReview}
                                                                    </strong>

                                                                </div>


                                                                <div className="recruiter-pipeline-track">

                                                                    <div
                                                                        className="recruiter-pipeline-bar pipeline-review"
                                                                        style={{
                                                                            width:
                                                                                getPipelineWidth(
                                                                                    pipeline.underReview,
                                                                                    pipeline.total
                                                                                )
                                                                        }}
                                                                    ></div>

                                                                </div>

                                                            </div>


                                                            <div>

                                                                <div className="recruiter-pipeline-progress-label">

                                                                    <span>
                                                                        Shortlisted
                                                                    </span>

                                                                    <strong>
                                                                        {pipeline.shortlisted}
                                                                    </strong>

                                                                </div>


                                                                <div className="recruiter-pipeline-track">

                                                                    <div
                                                                        className="recruiter-pipeline-bar pipeline-shortlisted"
                                                                        style={{
                                                                            width:
                                                                                getPipelineWidth(
                                                                                    pipeline.shortlisted,
                                                                                    pipeline.total
                                                                                )
                                                                        }}
                                                                    ></div>

                                                                </div>

                                                            </div>


                                                            <div>

                                                                <div className="recruiter-pipeline-progress-label">

                                                                    <span>
                                                                        Interview
                                                                    </span>

                                                                    <strong>
                                                                        {pipeline.interview}
                                                                    </strong>

                                                                </div>


                                                                <div className="recruiter-pipeline-track">

                                                                    <div
                                                                        className="recruiter-pipeline-bar pipeline-interview"
                                                                        style={{
                                                                            width:
                                                                                getPipelineWidth(
                                                                                    pipeline.interview,
                                                                                    pipeline.total
                                                                                )
                                                                        }}
                                                                    ></div>

                                                                </div>

                                                            </div>


                                                            <div>

                                                                <div className="recruiter-pipeline-progress-label">

                                                                    <span>
                                                                        Selected
                                                                    </span>

                                                                    <strong>
                                                                        {pipeline.selected}
                                                                    </strong>

                                                                </div>


                                                                <div className="recruiter-pipeline-track">

                                                                    <div
                                                                        className="recruiter-pipeline-bar pipeline-selected"
                                                                        style={{
                                                                            width:
                                                                                getPipelineWidth(
                                                                                    pipeline.selected,
                                                                                    pipeline.total
                                                                                )
                                                                        }}
                                                                    ></div>

                                                                </div>

                                                            </div>

                                                        </div>


                                                        {/* OTHER COUNTS */}

                                                        <div className="recruiter-pipeline-footer">


                                                            <span>

                                                                <i className="bi bi-send-check"></i>

                                                                {pipeline.applied}
                                                                {" "}
                                                                applied

                                                            </span>


                                                            <span>

                                                                <i className="bi bi-x-circle"></i>

                                                                {pipeline.rejected}
                                                                {" "}
                                                                rejected

                                                            </span>


                                                            <span>

                                                                <i className="bi bi-arrow-return-left"></i>

                                                                {pipeline.withdrawn}
                                                                {" "}
                                                                withdrawn

                                                            </span>

                                                        </div>

                                                    </>

                                                )}

                                            </div>


                                            {/* =========================
                                                ACTIONS
                                            ========================= */}

                                            <div className="recruiter-job-actions">


                                                <button
                                                    type="button"
                                                    className="btn recruiter-job-action-button recruiter-candidates-button"
                                                    onClick={
                                                        () =>
                                                            navigate(
                                                                `/recruiter/jobs/${job.id}/applications`
                                                            )
                                                    }
                                                >

                                                    <i className="bi bi-people me-2"></i>

                                                    View Candidates


                                                    {!pipeline.loading &&
                                                        !pipeline.error && (

                                                        <span className="recruiter-action-count">

                                                            {pipeline.total}

                                                        </span>

                                                    )}

                                                </button>


                                                <button
                                                    type="button"
                                                    className="btn recruiter-job-action-button"
                                                    onClick={
                                                        () =>
                                                            navigate(
                                                                `/recruiter/jobs/${job.id}/edit`
                                                            )
                                                    }
                                                >

                                                    <i className="bi bi-pencil-square me-2"></i>

                                                    Edit

                                                </button>


                                                <button
                                                    type="button"
                                                    className="btn recruiter-job-action-button"
                                                    onClick={
                                                        () =>
                                                            navigate(
                                                                `/jobs/${job.id}`
                                                            )
                                                    }
                                                >

                                                    <i className="bi bi-box-arrow-up-right me-2"></i>

                                                    Preview

                                                </button>


                                                {job.status ===
                                                    "OPEN" && (

                                                    <button
                                                        type="button"
                                                        className="btn recruiter-close-job-button"
                                                        onClick={
                                                            () =>
                                                                handleStatusChange(
                                                                    job,
                                                                    "CLOSED"
                                                                )
                                                        }
                                                        disabled={
                                                            statusUpdatingId ===
                                                            job.id
                                                        }
                                                    >

                                                        {statusUpdatingId ===
                                                        job.id ? (

                                                            <span className="spinner-border spinner-border-sm"></span>

                                                        ) : (

                                                            <>

                                                                <i className="bi bi-lock me-2"></i>

                                                                Close Job

                                                            </>

                                                        )}

                                                    </button>

                                                )}


                                                {job.status ===
                                                    "CLOSED" && (

                                                    <button
                                                        type="button"
                                                        className="btn recruiter-reopen-job-button"
                                                        onClick={
                                                            () =>
                                                                handleStatusChange(
                                                                    job,
                                                                    "OPEN"
                                                                )
                                                        }
                                                        disabled={
                                                            statusUpdatingId ===
                                                            job.id
                                                        }
                                                    >

                                                        {statusUpdatingId ===
                                                        job.id ? (

                                                            <span className="spinner-border spinner-border-sm"></span>

                                                        ) : (

                                                            <>

                                                                <i className="bi bi-arrow-counterclockwise me-2"></i>

                                                                Reopen

                                                            </>

                                                        )}

                                                    </button>

                                                )}

                                            </div>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}


export default MyJobs;