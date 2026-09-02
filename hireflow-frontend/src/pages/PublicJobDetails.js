import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import axiosInstance
    from "../api/axiosInstance";

import { useAuth }
    from "../context/AuthContext";

import "./PublicJobDetails.css";


// =====================================================
// BACKEND ERROR MESSAGE
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
        data?.message &&
        typeof data.message === "string"
    ) {

        return data.message;
    }


    if (
        data?.error &&
        typeof data.error === "string"
    ) {

        return data.error;
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
// FORMAT EMPLOYMENT TYPE
// =====================================================

const formatEmploymentType = (
    value
) => {

    if (!value) {

        return (
            "Not specified"
        );
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
                character.toUpperCase()
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


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};


// =====================================================
// FORMAT SALARY
// =====================================================

const formatSalary = (
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
            `₹${minimum} - ₹${maximum}`
        );
    }


    if (
        minimum !== null &&
        minimum !== undefined
    ) {

        return (
            `From ₹${minimum}`
        );
    }


    if (
        maximum !== null &&
        maximum !== undefined
    ) {

        return (
            `Up to ₹${maximum}`
        );
    }


    return (
        "Not disclosed"
    );
};


// =====================================================
// FORMAT APPLICATION STATUS
// =====================================================

const formatApplicationStatus = (
    status
) => {

    if (!status) {

        return (
            "Applied"
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
// PUBLIC JOB DETAILS
// =====================================================

function PublicJobDetails() {

    const {
        jobId
    } = useParams();


    const navigate =
        useNavigate();


    const {
        user,
        isAuthenticated
    } = useAuth();


    // =====================================================
    // JOB STATE
    // =====================================================

    const [
        job,
        setJob
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    // =====================================================
    // APPLICATION STATE
    // =====================================================

    const [
        existingApplication,
        setExistingApplication
    ] = useState(null);


    const [
        checkingApplication,
        setCheckingApplication
    ] = useState(false);


    const [
        showApplyModal,
        setShowApplyModal
    ] = useState(false);


    const [
        coverLetter,
        setCoverLetter
    ] = useState("");


    const [
        applying,
        setApplying
    ] = useState(false);


    const [
        applyError,
        setApplyError
    ] = useState("");


    const [
        applySuccess,
        setApplySuccess
    ] = useState("");


    const [
        resumeRequired,
        setResumeRequired
    ] = useState(false);


    // =====================================================
    // LOAD PUBLIC JOB
    // =====================================================

    const loadJob =
        useCallback(
            async () => {

                if (!jobId) {

                    setError(
                        "Job ID is missing."
                    );

                    setLoading(
                        false
                    );

                    return;
                }


                setLoading(
                    true
                );

                setError(
                    ""
                );


                try {

                    const response =
                        await axiosInstance.get(
                            `/api/jobs/${jobId}`
                        );


                    setJob(
                        response.data ||
                        null
                    );

                } catch (requestError) {

                    console.error(
                        "Public job details error:",
                        requestError
                    );


                    console.error(
                        "Backend response:",
                        requestError
                            ?.response
                            ?.data
                    );


                    setJob(
                        null
                    );


                    setError(
                        getBackendErrorMessage(
                            requestError,
                            "Unable to load this job."
                        )
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            },
            [
                jobId
            ]
        );


    // =====================================================
    // CHECK WHETHER CANDIDATE ALREADY APPLIED
    // =====================================================

    const loadApplicationStatus =
        useCallback(
            async () => {

                if (
                    !isAuthenticated ||
                    user?.role !==
                    "CANDIDATE" ||
                    !jobId
                ) {

                    setExistingApplication(
                        null
                    );

                    return;
                }


                setCheckingApplication(
                    true
                );


                try {

                    const response =
                        await axiosInstance.get(
                            "/api/candidate/applications"
                        );


                    const applications =
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : [];


                    const application =
                        applications.find(
                            (item) =>
                                String(
                                    item?.jobId
                                ) ===
                                String(
                                    jobId
                                )
                        ) ||
                        null;


                    setExistingApplication(
                        application
                    );

                } catch (requestError) {

                    console.error(
                        "Candidate application check error:",
                        requestError
                    );


                    /*
                     * Do not block the public job page only
                     * because application-status lookup failed.
                     *
                     * The backend still prevents duplicate
                     * applications when Apply is submitted.
                     */

                    setExistingApplication(
                        null
                    );

                } finally {

                    setCheckingApplication(
                        false
                    );
                }
            },
            [
                isAuthenticated,
                user?.role,
                jobId
            ]
        );


    // =====================================================
    // LOAD
    // =====================================================

    useEffect(() => {

        loadJob();

    }, [loadJob]);


    useEffect(() => {

        loadApplicationStatus();

    }, [loadApplicationStatus]);


    // =====================================================
    // SKILLS
    // =====================================================

    const skills =
        useMemo(
            () => {

                if (
                    !job?.skills
                ) {

                    return [];
                }


                if (
                    Array.isArray(
                        job.skills
                    )
                ) {

                    return job.skills
                        .map(
                            (skill) =>
                                String(
                                    skill
                                )
                                    .trim()
                        )
                        .filter(
                            Boolean
                        );
                }


                return String(
                    job.skills
                )
                    .split(",")
                    .map(
                        (skill) =>
                            skill.trim()
                    )
                    .filter(
                        Boolean
                    );
            },
            [
                job
            ]
        );


    // =====================================================
    // COMPANY INITIAL
    // =====================================================

    const companyInitial =
        useMemo(
            () => {

                return (
                    job?.companyName ||
                    "H"
                )
                    .charAt(0)
                    .toUpperCase();
            },
            [
                job
            ]
        );


    // =====================================================
    // OPEN APPLY
    // =====================================================

    const handleApplyClick = () => {

        setApplyError(
            ""
        );

        setApplySuccess(
            ""
        );

        setResumeRequired(
            false
        );


        // =================================================
        // GUEST
        // =================================================

        if (
            !isAuthenticated
        ) {

            navigate(
                "/login",
                {
                    state: {
                        from:
                            `/jobs/${jobId}`
                    }
                }
            );

            return;
        }


        // =================================================
        // RECRUITER
        // =================================================

        if (
            user?.role ===
            "RECRUITER"
        ) {

            navigate(
                "/recruiter/dashboard"
            );

            return;
        }


        // =================================================
        // ADMIN
        // =================================================

        if (
            user?.role ===
            "ADMIN"
        ) {

            navigate(
                "/admin/dashboard"
            );

            return;
        }


        // =================================================
        // CANDIDATE ONLY
        // =================================================

        if (
            user?.role !==
            "CANDIDATE"
        ) {

            return;
        }


        // =================================================
        // ALREADY APPLIED
        // =================================================

        if (
            existingApplication
        ) {

            navigate(
                "/candidate/applications"
            );

            return;
        }


        // =================================================
        // OPEN MODAL
        // =================================================

        setShowApplyModal(
            true
        );
    };


    // =====================================================
    // CLOSE APPLY MODAL
    // =====================================================

    const closeApplyModal = () => {

        if (
            applying
        ) {

            return;
        }


        setShowApplyModal(
            false
        );

        setApplyError(
            ""
        );

        setResumeRequired(
            false
        );
    };


    // =====================================================
    // SUBMIT APPLICATION
    // =====================================================

    const handleSubmitApplication =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                !jobId ||
                applying
            ) {

                return;
            }


            setApplying(
                true
            );

            setApplyError(
                ""
            );

            setApplySuccess(
                ""
            );

            setResumeRequired(
                false
            );


            try {

                const payload = {

                    coverLetter:
                        coverLetter.trim()
                            ? coverLetter.trim()
                            : null
                };


                const response =
                    await axiosInstance.post(
                        `/api/candidate/applications/job/${jobId}`,
                        payload
                    );


                const application =
                    response.data ||
                    {
                        jobId,
                        status:
                            "APPLIED"
                    };


                setExistingApplication(
                    application
                );


                setApplySuccess(
                    "Application submitted successfully."
                );


                setCoverLetter(
                    ""
                );


                setShowApplyModal(
                    false
                );

            } catch (requestError) {

                console.error(
                    "Apply job error:",
                    requestError
                );


                console.error(
                    "Backend response:",
                    requestError
                        ?.response
                        ?.data
                );


                const message =
                    getBackendErrorMessage(
                        requestError,
                        "Unable to submit your application."
                    );


                const normalizedMessage =
                    message
                        .toLowerCase();


                // =============================================
                // DUPLICATE APPLICATION
                // =============================================

                if (
                    normalizedMessage.includes(
                        "already applied"
                    )
                ) {

                    setExistingApplication({
                        jobId,
                        status:
                            "APPLIED"
                    });


                    setApplyError(
                        ""
                    );


                    setApplySuccess(
                        "You have already applied for this job."
                    );


                    setShowApplyModal(
                        false
                    );

                    return;
                }


                // =============================================
                // MISSING PROFILE / RESUME
                // =============================================

                if (
                    normalizedMessage.includes(
                        "resume"
                    )
                    ||
                    normalizedMessage.includes(
                        "candidate profile"
                    )
                ) {

                    setResumeRequired(
                        true
                    );
                }


                setApplyError(
                    message
                );

            } finally {

                setApplying(
                    false
                );
            }
        };


    // =====================================================
    // APPLY BUTTON TEXT
    // =====================================================

    const getApplyButtonText = () => {

        if (
            checkingApplication
        ) {

            return (
                "Checking..."
            );
        }


        if (
            existingApplication
        ) {

            if (
                existingApplication.status ===
                "WITHDRAWN"
            ) {

                return (
                    "Application Withdrawn"
                );
            }


            return (
                formatApplicationStatus(
                    existingApplication.status
                )
            );
        }


        if (
            !isAuthenticated
        ) {

            return (
                "Sign In to Apply"
            );
        }


        if (
            user?.role ===
            "CANDIDATE"
        ) {

            return (
                "Apply Now"
            );
        }


        if (
            user?.role ===
            "RECRUITER"
        ) {

            return (
                "Recruiter Dashboard"
            );
        }


        return (
            "Dashboard"
        );
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading
    ) {

        return (

            <div className="public-job-page">

                <div className="container">

                    <div className="public-job-loading">

                        <div
                            className="spinner-border text-primary"
                            role="status"
                        ></div>


                        <p>
                            Loading job details...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR / NOT FOUND
    // =====================================================

    if (
        error ||
        !job
    ) {

        return (

            <div className="public-job-page">

                <div className="container">

                    <div className="public-job-error-card">

                        <div className="public-job-error-icon">

                            <i className="bi bi-briefcase"></i>

                        </div>


                        <h2>
                            Job unavailable
                        </h2>


                        <p>

                            {error ||
                                "This job is no longer available."}

                        </p>


                        <Link
                            to="/"
                            className="public-job-primary-link"
                        >

                            <i className="bi bi-arrow-left"></i>

                            Back to Home

                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="public-job-page">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="public-job-hero">

                <div className="container">


                    <button
                        type="button"
                        className="public-job-back"
                        onClick={() =>
                            navigate(
                                -1
                            )
                        }
                    >

                        <i className="bi bi-arrow-left"></i>

                        Back

                    </button>


                    <div className="public-job-hero-card">


                        <div className="public-job-company-logo">

                            {companyInitial}

                        </div>


                        <div className="public-job-hero-content">


                            <div className="public-job-company-name">

                                <i className="bi bi-building"></i>

                                {job.companyName ||
                                    "Hiring Company"}

                            </div>


                            <h1>

                                {job.title ||
                                    "Open Position"}

                            </h1>


                            <div className="public-job-meta">


                                <span>

                                    <i className="bi bi-geo-alt"></i>

                                    {job.location ||
                                        "Location not specified"}

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

                                        ? `${job.experienceRequired}+ years experience`

                                        : "Experience flexible"
                                    }

                                </span>

                            </div>

                        </div>


                        <div className="public-job-open-badge">

                            <span></span>

                            Open

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                CONTENT
            ================================================= */}

            <section className="public-job-main">

                <div className="container">

                    <div className="row g-4">


                        {/* =====================================
                            LEFT
                        ===================================== */}

                        <div className="col-lg-8">


                            {/* SUCCESS */}

                            {applySuccess && (

                                <div className="public-job-success-alert">

                                    <i className="bi bi-check-circle-fill"></i>

                                    <div>

                                        <strong>
                                            Application updated
                                        </strong>

                                        <p>
                                            {applySuccess}
                                        </p>

                                    </div>

                                </div>

                            )}


                            {/* DESCRIPTION */}

                            <div className="public-job-content-card">

                                <div className="public-job-section-title">

                                    <div>

                                        <i className="bi bi-file-text"></i>

                                    </div>


                                    <h2>
                                        Job Description
                                    </h2>

                                </div>


                                <div className="public-job-description">

                                    {job.description ||
                                        "No job description has been provided."}

                                </div>

                            </div>


                            {/* SKILLS */}

                            <div className="public-job-content-card">

                                <div className="public-job-section-title">

                                    <div>

                                        <i className="bi bi-code-slash"></i>

                                    </div>


                                    <h2>
                                        Skills
                                    </h2>

                                </div>


                                {skills.length >
                                0 ? (

                                    <div className="public-job-skills">

                                        {skills.map(
                                            (
                                                skill,
                                                index
                                            ) => (

                                                <span
                                                    key={
                                                        `${skill}-${index}`
                                                    }
                                                >

                                                    {skill}

                                                </span>

                                            )
                                        )}

                                    </div>

                                ) : (

                                    <p className="public-job-muted">

                                        No specific skills listed.

                                    </p>

                                )}

                            </div>


                            {/* JOB INFORMATION */}

                            <div className="public-job-content-card">

                                <div className="public-job-section-title">

                                    <div>

                                        <i className="bi bi-info-circle"></i>

                                    </div>


                                    <h2>
                                        Job Information
                                    </h2>

                                </div>


                                <div className="public-job-info-grid">


                                    <div className="public-job-info-item">

                                        <span>

                                            <i className="bi bi-briefcase"></i>

                                        </span>


                                        <div>

                                            <small>
                                                Employment Type
                                            </small>

                                            <strong>

                                                {formatEmploymentType(
                                                    job.employmentType
                                                )}

                                            </strong>

                                        </div>

                                    </div>


                                    <div className="public-job-info-item">

                                        <span>

                                            <i className="bi bi-geo-alt"></i>

                                        </span>


                                        <div>

                                            <small>
                                                Location
                                            </small>

                                            <strong>

                                                {job.location ||
                                                    "Not specified"}

                                            </strong>

                                        </div>

                                    </div>


                                    <div className="public-job-info-item">

                                        <span>

                                            <i className="bi bi-person-workspace"></i>

                                        </span>


                                        <div>

                                            <small>
                                                Experience
                                            </small>

                                            <strong>

                                                {job.experienceRequired !==
                                                    null &&
                                                job.experienceRequired !==
                                                    undefined

                                                    ? `${job.experienceRequired}+ years`

                                                    : "Not specified"
                                                }

                                            </strong>

                                        </div>

                                    </div>


                                    <div className="public-job-info-item">

                                        <span>

                                            <i className="bi bi-cash-stack"></i>

                                        </span>


                                        <div>

                                            <small>
                                                Salary
                                            </small>

                                            <strong>

                                                {formatSalary(
                                                    job
                                                )}

                                            </strong>

                                        </div>

                                    </div>


                                    <div className="public-job-info-item">

                                        <span>

                                            <i className="bi bi-calendar-plus"></i>

                                        </span>


                                        <div>

                                            <small>
                                                Posted
                                            </small>

                                            <strong>

                                                {formatDate(
                                                    job.createdAt
                                                )}

                                            </strong>

                                        </div>

                                    </div>


                                    <div className="public-job-info-item">

                                        <span>

                                            <i className="bi bi-calendar-x"></i>

                                        </span>


                                        <div>

                                            <small>
                                                Application Deadline
                                            </small>

                                            <strong>

                                                {formatDate(
                                                    job.deadline
                                                )}

                                            </strong>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =====================================
                            RIGHT SIDEBAR
                        ===================================== */}

                        <div className="col-lg-4">

                            <div className="public-job-sidebar">


                                {/* APPLY CARD */}

                                <div className="public-job-apply-card">


                                    <div className="public-job-apply-icon">

                                        {existingApplication ? (

                                            <i className="bi bi-check2-circle"></i>

                                        ) : (

                                            <i className="bi bi-send"></i>

                                        )}

                                    </div>


                                    <h3>

                                        {existingApplication

                                            ? "Application Submitted"

                                            : "Interested in this role?"
                                        }

                                    </h3>


                                    <p>

                                        {existingApplication

                                            ? `Your current application status is ${formatApplicationStatus(
                                                existingApplication.status
                                            )}.`

                                            : user?.role ===
                                                "CANDIDATE"

                                                ? "Apply directly using the resume saved in your HireFlow profile."

                                                : !isAuthenticated

                                                    ? "Sign in as a candidate to submit your application."

                                                    : "Candidate accounts can apply for this position."
                                        }

                                    </p>


                                    <button
                                        type="button"
                                        className={
                                            existingApplication

                                                ? "public-job-applied-button"

                                                : "public-job-apply-button"
                                        }
                                        onClick={
                                            handleApplyClick
                                        }
                                        disabled={
                                            checkingApplication
                                        }
                                    >

                                        {checkingApplication ? (

                                            <>

                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                ></span>

                                                Checking...

                                            </>

                                        ) : (

                                            <>

                                                {existingApplication ? (

                                                    <i className="bi bi-check2-circle"></i>

                                                ) : (

                                                    <i className="bi bi-send"></i>

                                                )}

                                                {getApplyButtonText()}

                                            </>

                                        )}

                                    </button>


                                    {existingApplication && (

                                        <Link
                                            to="/candidate/applications"
                                            className="public-job-view-application"
                                        >

                                            View My Applications

                                            <i className="bi bi-arrow-right"></i>

                                        </Link>

                                    )}


                                    {!isAuthenticated && (

                                        <div className="public-job-register-text">

                                            New to HireFlow?

                                            {" "}

                                            <Link to="/register">

                                                Create an account

                                            </Link>

                                        </div>

                                    )}

                                </div>


                                {/* COMPANY */}

                                <div className="public-job-company-card">

                                    <div className="public-job-company-card-header">

                                        <div className="public-job-small-logo">

                                            {companyInitial}

                                        </div>


                                        <div>

                                            <small>
                                                Hiring Company
                                            </small>

                                            <strong>

                                                {job.companyName ||
                                                    "Hiring Company"}

                                            </strong>

                                        </div>

                                    </div>


                                    <div className="public-job-company-row">

                                        <i className="bi bi-geo-alt"></i>

                                        <span>

                                            {job.location ||
                                                "Location not specified"}

                                        </span>

                                    </div>


                                    <div className="public-job-company-row">

                                        <i className="bi bi-briefcase"></i>

                                        <span>

                                            {formatEmploymentType(
                                                job.employmentType
                                            )}

                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                APPLY MODAL
            ================================================= */}

            {showApplyModal && (

                <div
                    className="public-job-modal-backdrop"
                    onMouseDown={
                        closeApplyModal
                    }
                >

                    <div
                        className="public-job-modal"
                        onMouseDown={
                            (event) =>
                                event.stopPropagation()
                        }
                    >


                        {/* HEADER */}

                        <div className="public-job-modal-header">

                            <div>

                                <span>
                                    Job Application
                                </span>

                                <h2>
                                    Apply for {job.title}
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeApplyModal
                                }
                                disabled={
                                    applying
                                }
                                aria-label="Close"
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>


                        {/* COMPANY */}

                        <div className="public-job-modal-job">

                            <div className="public-job-modal-logo">

                                {companyInitial}

                            </div>


                            <div>

                                <strong>
                                    {job.companyName ||
                                        "Hiring Company"}
                                </strong>

                                <span>

                                    <i className="bi bi-geo-alt"></i>

                                    {job.location ||
                                        "Location not specified"}

                                </span>

                            </div>

                        </div>


                        {/* RESUME INFO */}

                        <div className="public-job-resume-info">

                            <i className="bi bi-file-earmark-pdf"></i>


                            <div>

                                <strong>
                                    Your profile resume will be used
                                </strong>

                                <span>

                                    You don't need to upload the resume again.

                                </span>

                            </div>

                        </div>


                        {/* ERROR */}

                        {applyError && (

                            <div className="public-job-apply-error">

                                <i className="bi bi-exclamation-circle-fill"></i>


                                <div>

                                    <strong>
                                        Unable to apply
                                    </strong>

                                    <p>
                                        {applyError}
                                    </p>


                                    {resumeRequired && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    "/candidate/profile"
                                                )
                                            }
                                        >

                                            Go to Candidate Profile

                                            <i className="bi bi-arrow-right"></i>

                                        </button>

                                    )}

                                </div>

                            </div>

                        )}


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmitApplication
                            }
                        >

                            <div className="public-job-form-group">

                                <div className="public-job-form-label">

                                    <label htmlFor="coverLetter">

                                        Cover Letter

                                    </label>


                                    <span>
                                        Optional
                                    </span>

                                </div>


                                <textarea
                                    id="coverLetter"
                                    rows="7"
                                    maxLength="5000"
                                    placeholder="Tell the recruiter why you're interested in this opportunity..."
                                    value={
                                        coverLetter
                                    }
                                    onChange={
                                        (event) =>
                                            setCoverLetter(
                                                event.target.value
                                            )
                                    }
                                    disabled={
                                        applying
                                    }
                                ></textarea>


                                <div className="public-job-character-count">

                                    {coverLetter.length}
                                    /5000

                                </div>

                            </div>


                            <div className="public-job-modal-actions">

                                <button
                                    type="button"
                                    className="public-job-modal-cancel"
                                    onClick={
                                        closeApplyModal
                                    }
                                    disabled={
                                        applying
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="public-job-modal-submit"
                                    disabled={
                                        applying
                                    }
                                >

                                    {applying ? (

                                        <>

                                            <span
                                                className="spinner-border spinner-border-sm"
                                                role="status"
                                            ></span>

                                            Submitting...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-send"></i>

                                            Submit Application

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


export default PublicJobDetails;