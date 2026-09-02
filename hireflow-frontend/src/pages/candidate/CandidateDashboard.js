import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import axiosInstance
    from "../../api/axiosInstance";

import {
    useAuth
} from "../../context/AuthContext";

import "./CandidateDashboard.css";


function CandidateDashboard() {

    const navigate =
        useNavigate();

    const {
        user
    } = useAuth();


    const [
        profile,
        setProfile
    ] = useState(null);


    const [
        applications,
        setApplications
    ] = useState([]);


    const [
        savedJobs,
        setSavedJobs
    ] = useState([]);


    const [
        jobs,
        setJobs
    ] = useState([]);


    const [
        offers,
        setOffers
    ] = useState([]);


    const [
        onboardings,
        setOnboardings
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadDashboard =
        useCallback(
            async () => {

                setLoading(
                    true
                );

                setError(
                    ""
                );


                try {

                    const results =
                        await Promise.allSettled([
                            axiosInstance.get(
                                "/api/candidate/profile"
                            ),

                            axiosInstance.get(
                                "/api/candidate/applications"
                            ),

                            axiosInstance.get(
                                "/api/candidate/saved-jobs"
                            ),

                            axiosInstance.get(
                                "/api/jobs"
                            ),

                            axiosInstance.get(
                                "/api/candidate/offers"
                            ),

                            axiosInstance.get(
                                "/api/candidate/onboarding"
                            )
                        ]);


                    // =========================================
                    // PROFILE
                    // =========================================

                    if (
                        results[0].status ===
                        "fulfilled"
                    ) {

                        setProfile(
                            results[0]
                                .value
                                .data
                        );

                    } else {

                        /*
                         * Candidate profile may not have been
                         * created yet. Do not fail dashboard.
                         */

                        setProfile(
                            null
                        );
                    }


                    // =========================================
                    // APPLICATIONS
                    // =========================================

                    if (
                        results[1].status ===
                        "fulfilled"
                    ) {

                        const data =
                            results[1]
                                .value
                                .data;


                        setApplications(
                            Array.isArray(
                                data
                            )
                                ? data
                                : []
                        );

                    } else {

                        setApplications(
                            []
                        );
                    }


                    // =========================================
                    // SAVED JOBS
                    // =========================================

                    if (
                        results[2].status ===
                        "fulfilled"
                    ) {

                        const data =
                            results[2]
                                .value
                                .data;


                        setSavedJobs(
                            Array.isArray(
                                data
                            )
                                ? data
                                : []
                        );

                    } else {

                        setSavedJobs(
                            []
                        );
                    }


                    // =========================================
                    // PUBLIC JOBS
                    // =========================================

                    if (
                        results[3].status ===
                        "fulfilled"
                    ) {

                        const data =
                            results[3]
                                .value
                                .data;


                        setJobs(
                            Array.isArray(
                                data
                            )
                                ? data
                                : []
                        );

                    } else {

                        setJobs(
                            []
                        );
                    }


                    // =========================================
                    // JOB OFFERS
                    // =========================================

                    if (
                        results[4].status ===
                        "fulfilled"
                    ) {

                        const data =
                            results[4]
                                .value
                                .data;


                        setOffers(
                            Array.isArray(
                                data
                            )
                                ? data
                                : []
                        );

                    } else {

                        console.error(
                            "Unable to load candidate offers:",
                            results[4].reason
                        );


                        setOffers(
                            []
                        );
                    }


                    // =========================================
                    // ONBOARDING
                    // =========================================

                    if (
                        results[5].status ===
                        "fulfilled"
                    ) {

                        const data =
                            results[5]
                                .value
                                .data;


                        setOnboardings(
                            Array.isArray(
                                data
                            )
                                ? data
                                : []
                        );

                    } else {

                        console.error(
                            "Unable to load candidate onboarding:",
                            results[5].reason
                        );


                        setOnboardings(
                            []
                        );
                    }


                    // =========================================
                    // COMPLETE FAILURE
                    // =========================================

                    const importantRequests = [
                        results[1],
                        results[2],
                        results[3]
                    ];


                    const allImportantFailed =
                        importantRequests.every(
                            (
                                result
                            ) =>
                                result.status ===
                                "rejected"
                        );


                    if (
                        allImportantFailed
                    ) {

                        setError(
                            "Unable to load dashboard information."
                        );
                    }

                } catch (
                    requestError
                ) {

                    console.error(
                        "Dashboard loading error:",
                        requestError
                    );


                    setError(
                        "Unable to load dashboard information."
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

    useEffect(
        () => {

            loadDashboard();

        },
        [
            loadDashboard
        ]
    );


    // =====================================================
    // PROFILE COMPLETION
    // =====================================================

    const profileCompletion =
        useMemo(
            () => {

                if (
                    !profile
                ) {

                    return 0;
                }


                const fields = [
                    profile.phone,
                    profile.location,
                    profile.skills,

                    profile.experience !== null &&
                    profile.experience !== undefined
                        ? profile.experience
                        : "",

                    profile.education,
                    profile.resumeUrl
                ];


                const completed =
                    fields.filter(
                        (
                            value
                        ) =>
                            value !== null &&
                            value !== undefined &&
                            String(
                                value
                            )
                                .trim() !==
                                ""
                    ).length;


                return Math.round(
                    (
                        completed /
                        fields.length
                    ) *
                    100
                );
            },
            [
                profile
            ]
        );


    // =====================================================
    // APPLICATION STATS
    // =====================================================

    const underReviewCount =
        applications.filter(
            (
                application
            ) =>
                application.status ===
                "UNDER_REVIEW"
        ).length;


    const shortlistedCount =
        applications.filter(
            (
                application
            ) =>
                application.status ===
                    "SHORTLISTED" ||

                application.status ===
                    "INTERVIEW"
        ).length;


    const selectedCount =
        applications.filter(
            (
                application
            ) =>
                application.status ===
                    "SELECTED" ||

                application.status ===
                    "HIRED"
        ).length;


    // =====================================================
    // OFFER STATS
    // =====================================================

    const pendingOfferCount =
        offers.filter(
            (
                offer
            ) =>
                offer?.status ===
                "SENT"
        ).length;


    const acceptedOfferCount =
        offers.filter(
            (
                offer
            ) =>
                offer?.status ===
                "ACCEPTED"
        ).length;


    const latestAcceptedOffer =
        useMemo(
            () =>
                offers
                    .filter(
                        (
                            offer
                        ) =>
                            offer?.status ===
                            "ACCEPTED"
                    )
                    .sort(
                        (
                            first,
                            second
                        ) =>
                            new Date(
                                second?.respondedAt ||
                                second?.updatedAt ||
                                second?.createdAt ||
                                0
                            ) -
                            new Date(
                                first?.respondedAt ||
                                first?.updatedAt ||
                                first?.createdAt ||
                                0
                            )
                    )[0] ||
                    null,
            [
                offers
            ]
        );


    // =====================================================
    // CURRENT ONBOARDING
    // =====================================================

    const currentOnboarding =
        useMemo(
            () => {

                if (
                    onboardings.length ===
                    0
                ) {

                    return null;
                }


                const offerMatch =
                    latestAcceptedOffer
                        ? onboardings.find(
                            (
                                onboarding
                            ) =>
                                String(
                                    onboarding?.offerId
                                ) ===
                                String(
                                    latestAcceptedOffer?.id
                                )
                        )
                        : null;


                if (
                    offerMatch
                ) {

                    return offerMatch;
                }


                const active =
                    onboardings.find(
                        (
                            onboarding
                        ) =>
                            onboarding?.status !==
                                "JOINED" &&
                            onboarding?.status !==
                                "NO_SHOW"
                    );


                return (
                    active ||
                    [...onboardings]
                        .sort(
                            (
                                first,
                                second
                            ) =>
                                new Date(
                                    second?.updatedAt ||
                                    second?.createdAt ||
                                    0
                                ) -
                                new Date(
                                    first?.updatedAt ||
                                    first?.createdAt ||
                                    0
                                )
                        )[0] ||
                    null
                );
            },
            [
                onboardings,
                latestAcceptedOffer
            ]
        );


    // =====================================================
    // RECENT APPLICATIONS
    // =====================================================

    const recentApplications =
        useMemo(
            () => {

                return [
                    ...applications
                ]
                    .sort(
                        (
                            first,
                            second
                        ) => {

                            const firstDate =
                                new Date(
                                    first.appliedAt ||
                                    first.createdAt ||
                                    0
                                );


                            const secondDate =
                                new Date(
                                    second.appliedAt ||
                                    second.createdAt ||
                                    0
                                );


                            return (
                                secondDate -
                                firstDate
                            );
                        }
                    )
                    .slice(
                        0,
                        4
                    );
            },
            [
                applications
            ]
        );


    // =====================================================
    // LATEST JOBS
    // =====================================================

    const latestJobs =
        useMemo(
            () => {

                return jobs
                    .filter(
                        (
                            job
                        ) =>
                            !job.status ||
                            job.status ===
                                "OPEN"
                    )
                    .slice(
                        0,
                        4
                    );
            },
            [
                jobs
            ]
        );


    // =====================================================
    // FORMAT STATUS
    // =====================================================

    const formatStatus =
        (
            status
        ) => {

            if (
                !status
            ) {

                return "Unknown";
            }


            return status
                .replaceAll(
                    "_",
                    " "
                )
                .toLowerCase()
                .replace(
                    /\b\w/g,
                    (
                        character
                    ) =>
                        character
                            .toUpperCase()
                );
        };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass =
        (
            status
        ) => {

            switch (
                status
            ) {

                case "APPLIED":

                    return "dashboard-status-applied";


                case "UNDER_REVIEW":

                    return "dashboard-status-review";


                case "SHORTLISTED":

                    return "dashboard-status-shortlisted";


                case "INTERVIEW":

                    return "dashboard-status-interview";


                case "SELECTED":
                case "HIRED":

                    return "dashboard-status-selected";


                case "REJECTED":

                    return "dashboard-status-rejected";


                case "WITHDRAWN":

                    return "dashboard-status-withdrawn";


                default:

                    return "";
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


            const parsedDate =
                new Date(
                    date
                );


            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                return "";
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
    // FORMAT MONEY
    // =====================================================

    const formatMoney =
        (
            amount,
            currency = "INR"
        ) => {

            if (
                amount === null ||
                amount === undefined ||
                amount === ""
            ) {

                return "Not specified";
            }

            const numericAmount =
                Number(
                    amount
                );

            if (
                Number.isNaN(
                    numericAmount
                )
            ) {

                return `${currency || "INR"} ${amount}`;
            }

            try {

                return new Intl.NumberFormat(
                    "en-IN",
                    {
                        style:
                            "currency",

                        currency:
                            currency ||
                            "INR",

                        maximumFractionDigits:
                            0
                    }
                ).format(
                    numericAmount
                );

            } catch (
                ignored
            ) {

                return `${currency || "INR"} ${numericAmount.toLocaleString(
                    "en-IN"
                )}`;
            }
        };


    // =====================================================
    // FORMAT EMPLOYMENT TYPE
    // =====================================================

    const formatEmploymentType =
        (
            type
        ) => {

            if (
                !type
            ) {

                return "Not specified";
            }


            return type
                .replaceAll(
                    "_",
                    " "
                )
                .toLowerCase()
                .replace(
                    /\b\w/g,
                    (
                        character
                    ) =>
                        character
                            .toUpperCase()
                );
        };


    // =====================================================
    // APPLICATION ID
    // =====================================================

    const getApplicationId =
        (
            application
        ) => {

            return (
                application.id ||
                application.applicationId
            );
        };


    // =====================================================
    // JOB ID
    // =====================================================

    const getJobIdFromApplication =
        (
            application
        ) => {

            return (
                application.jobId ||
                application.job?.id
            );
        };


    // =====================================================
    // JOB TITLE
    // =====================================================

    const getJobTitle =
        (
            application
        ) => {

            return (
                application.jobTitle ||
                application.title ||
                application.job?.title ||
                "Job Application"
            );
        };


    // =====================================================
    // COMPANY NAME
    // =====================================================

    const getCompanyName =
        (
            application
        ) => {

            return (
                application.companyName ||
                application.job?.companyName ||
                "Company"
            );
        };


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading
    ) {

        return (

            <div className="candidate-dashboard-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>


                <p>
                    Preparing your dashboard...
                </p>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="candidate-dashboard-page">

            <div className="container-fluid px-lg-5">


                {/* =========================================
                    WELCOME
                ========================================= */}

                <section className="candidate-welcome-section">

                    <div>

                        <span className="candidate-dashboard-eyebrow">
                            Candidate Dashboard
                        </span>


                        <h1>

                            Welcome back,{" "}

                            <span>

                                {user?.name ||
                                    "Candidate"
                                }

                            </span>

                        </h1>


                        <p>
                            Track applications, interviews,
                            job offers and discover your next
                            opportunity.
                        </p>

                    </div>


                    <Link
                        to="/candidate/jobs"
                        className="btn dashboard-find-jobs-button"
                    >

                        <i className="bi bi-search me-2"></i>

                        Find Jobs

                    </Link>

                </section>


                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (

                    <div className="alert alert-danger candidate-dashboard-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                {/* =========================================
                    STAT CARDS
                ========================================= */}

                <section className="candidate-dashboard-stats">


                    {/* APPLICATIONS */}

                    <div className="candidate-stat-card">

                        <div className="candidate-stat-icon stat-blue">

                            <i className="bi bi-file-earmark-text"></i>

                        </div>


                        <div>

                            <span>
                                Applications
                            </span>


                            <strong>
                                {applications.length}
                            </strong>


                            <small>
                                Total submitted
                            </small>

                        </div>

                    </div>


                    {/* UNDER REVIEW */}

                    <div className="candidate-stat-card">

                        <div className="candidate-stat-icon stat-orange">

                            <i className="bi bi-search"></i>

                        </div>


                        <div>

                            <span>
                                Under Review
                            </span>


                            <strong>
                                {underReviewCount}
                            </strong>


                            <small>
                                Being reviewed
                            </small>

                        </div>

                    </div>


                    {/* SHORTLISTED */}

                    <div className="candidate-stat-card">

                        <div className="candidate-stat-icon stat-purple">

                            <i className="bi bi-star"></i>

                        </div>


                        <div>

                            <span>
                                Shortlisted
                            </span>


                            <strong>
                                {shortlistedCount}
                            </strong>


                            <small>
                                Moving forward
                            </small>

                        </div>

                    </div>


                    {/* SAVED JOBS */}

                    <div className="candidate-stat-card">

                        <div className="candidate-stat-icon stat-green">

                            <i className="bi bi-bookmark-check"></i>

                        </div>


                        <div>

                            <span>
                                Saved Jobs
                            </span>


                            <strong>
                                {savedJobs.length}
                            </strong>


                            <small>
                                In your shortlist
                            </small>

                        </div>

                    </div>


                    {/* PENDING OFFERS */}

                    <div className="candidate-stat-card">

                        <div className="candidate-stat-icon stat-orange">

                            <i className="bi bi-envelope-paper"></i>

                        </div>


                        <div>

                            <span>
                                Pending Offers
                            </span>


                            <strong>
                                {pendingOfferCount}
                            </strong>


                            <small>
                                Awaiting response
                            </small>

                        </div>

                    </div>


                    {/* ACCEPTED OFFERS */}

                    <div className="candidate-stat-card">

                        <div className="candidate-stat-icon stat-green">

                            <i className="bi bi-patch-check"></i>

                        </div>


                        <div>

                            <span>
                                Accepted Offers
                            </span>


                            <strong>
                                {acceptedOfferCount}
                            </strong>


                            <small>
                                Offers accepted
                            </small>

                        </div>

                    </div>

                </section>


                {latestAcceptedOffer && (

                    <section className="candidate-hire-confirmed-card">

                        <div className="candidate-hire-confirmed-icon">

                            <i className="bi bi-patch-check-fill"></i>

                        </div>

                        <div className="candidate-hire-confirmed-main">

                            <span>
                                Hiring Confirmed
                            </span>

                            <h3>
                                Congratulations — your offer is accepted.
                            </h3>

                            <p>
                                {latestAcceptedOffer.jobTitle ||
                                    latestAcceptedOffer.job?.title ||
                                    "Your new position"
                                }
                                {" "}is confirmed. Your planned joining date is{" "}
                                <strong>
                                    {formatDate(
                                        currentOnboarding?.joiningDate ||
                                        latestAcceptedOffer.joiningDate
                                    ) ||
                                        "to be confirmed"
                                    }
                                </strong>
                                .
                            </p>

                            <div className="candidate-hire-confirmed-meta">

                                <div>
                                    <small>
                                        Joining Date
                                    </small>

                                    <strong>
                                        {formatDate(
                                            currentOnboarding?.joiningDate ||
                                        latestAcceptedOffer.joiningDate
                                        ) ||
                                            "To be confirmed"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <small>
                                        Compensation
                                    </small>

                                    <strong>
                                        {formatMoney(
                                            latestAcceptedOffer.offeredSalary,
                                            latestAcceptedOffer.currency
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <small>
                                        Onboarding Status
                                    </small>

                                    <strong className="candidate-onboarding-status-value">
                                        {formatStatus(
                                            currentOnboarding?.status ||
                                            "JOINING_PENDING"
                                        )}
                                    </strong>
                                </div>


                                <div>
                                    <small>
                                        Accepted On
                                    </small>

                                    <strong>
                                        {formatDate(
                                            latestAcceptedOffer.respondedAt
                                        ) ||
                                            "Confirmed"
                                        }
                                    </strong>
                                </div>

                            </div>

                        </div>

                        <Link
                            to="/candidate/onboarding"
                            className="candidate-hire-confirmed-action"
                        >
                            View Onboarding
                            <i className="bi bi-arrow-right"></i>
                        </Link>

                    </section>
                )}


                <div className="row g-4">


                    {/* =====================================
                        LEFT COLUMN
                    ===================================== */}

                    <div className="col-xl-8">


                        {/* =================================
                            PROFILE COMPLETION
                        ================================= */}

                        <section className="dashboard-section-card profile-progress-card">

                            <div className="dashboard-section-header">

                                <div>

                                    <span>
                                        Profile Strength
                                    </span>


                                    <h4>
                                        Complete Your Profile
                                    </h4>

                                </div>


                                <span className="profile-progress-value">

                                    {profileCompletion}%

                                </span>

                            </div>


                            <div className="candidate-progress-track">

                                <div
                                    className="candidate-progress-value"

                                    style={{
                                        width:
                                            `${profileCompletion}%`
                                    }}
                                ></div>

                            </div>


                            <div className="profile-progress-footer">

                                <div>

                                    {profileCompletion ===
                                    100 ? (

                                        <>

                                            <i className="bi bi-check-circle-fill"></i>

                                            Your profile is complete
                                            and ready for applications.

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-info-circle"></i>

                                            Complete your information
                                            and upload a resume to
                                            improve your profile.

                                        </>

                                    )}

                                </div>


                                <Link
                                    to="/candidate/profile"
                                >

                                    {profile
                                        ? "Update Profile"
                                        : "Create Profile"
                                    }

                                    <i className="bi bi-arrow-right ms-1"></i>

                                </Link>

                            </div>

                        </section>


                        {/* =================================
                            RECENT APPLICATIONS
                        ================================= */}

                        <section className="dashboard-section-card">

                            <div className="dashboard-section-header">

                                <div>

                                    <span>
                                        Activity
                                    </span>


                                    <h4>
                                        Recent Applications
                                    </h4>

                                </div>


                                <Link
                                    to="/candidate/applications"
                                    className="dashboard-view-all"
                                >

                                    View All

                                    <i className="bi bi-arrow-right"></i>

                                </Link>

                            </div>


                            {recentApplications.length ===
                            0 ? (

                                <div className="dashboard-empty-state">

                                    <div>

                                        <i className="bi bi-file-earmark-plus"></i>

                                    </div>


                                    <h5>
                                        No applications yet
                                    </h5>


                                    <p>
                                        Start applying to jobs and
                                        track their progress here.
                                    </p>


                                    <Link
                                        to="/candidate/jobs"
                                        className="btn dashboard-empty-button"
                                    >

                                        Browse Jobs

                                    </Link>

                                </div>

                            ) : (

                                <div className="dashboard-application-list">

                                    {recentApplications.map(
                                        (
                                            application
                                        ) => {

                                            const jobId =
                                                getJobIdFromApplication(
                                                    application
                                                );


                                            return (

                                                <div
                                                    className="dashboard-application-item"

                                                    key={
                                                        getApplicationId(
                                                            application
                                                        )
                                                    }
                                                >

                                                    <div className="dashboard-company-logo">

                                                        {getCompanyName(
                                                            application
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()
                                                        }

                                                    </div>


                                                    <div className="dashboard-application-info">

                                                        <span>

                                                            {getCompanyName(
                                                                application
                                                            )}

                                                        </span>


                                                        <h5>

                                                            {getJobTitle(
                                                                application
                                                            )}

                                                        </h5>


                                                        <small>

                                                            <i className="bi bi-calendar3"></i>

                                                            {formatDate(
                                                                application.appliedAt ||
                                                                application.createdAt
                                                            )}

                                                        </small>

                                                    </div>


                                                    <span
                                                        className={
                                                            `dashboard-application-status ${
                                                                getStatusClass(
                                                                    application.status
                                                                )
                                                            }`
                                                        }
                                                    >

                                                        {formatStatus(
                                                            application.status
                                                        )}

                                                    </span>


                                                    {jobId && (

                                                        <button
                                                            type="button"

                                                            className="dashboard-item-arrow"

                                                            onClick={
                                                                () =>
                                                                    navigate(
                                                                        `/candidate/jobs/${jobId}`
                                                                    )
                                                            }
                                                        >

                                                            <i className="bi bi-chevron-right"></i>

                                                        </button>

                                                    )}

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            )}

                        </section>


                        {/* =================================
                            LATEST JOBS
                        ================================= */}

                        <section className="dashboard-section-card">

                            <div className="dashboard-section-header">

                                <div>

                                    <span>
                                        Opportunities
                                    </span>


                                    <h4>
                                        Latest Jobs
                                    </h4>

                                </div>


                                <Link
                                    to="/candidate/jobs"
                                    className="dashboard-view-all"
                                >

                                    Browse All

                                    <i className="bi bi-arrow-right"></i>

                                </Link>

                            </div>


                            {latestJobs.length ===
                            0 ? (

                                <div className="dashboard-empty-state dashboard-small-empty">

                                    <p>
                                        No open jobs available right now.
                                    </p>

                                </div>

                            ) : (

                                <div className="dashboard-job-grid">

                                    {latestJobs.map(
                                        (
                                            job
                                        ) => (

                                            <div
                                                className="dashboard-job-card"
                                                key={
                                                    job.id
                                                }
                                            >

                                                <div className="dashboard-job-card-top">

                                                    <div className="dashboard-job-company-logo">

                                                        {job.companyName

                                                            ? job.companyName
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()

                                                            : "H"
                                                        }

                                                    </div>


                                                    <span className="dashboard-open-badge">

                                                        <span></span>

                                                        Open

                                                    </span>

                                                </div>


                                                <span className="dashboard-job-company">

                                                    {job.companyName ||
                                                        "Company"
                                                    }

                                                </span>


                                                <h5>
                                                    {job.title}
                                                </h5>


                                                <div className="dashboard-job-meta">

                                                    <span>

                                                        <i className="bi bi-geo-alt"></i>

                                                        {job.location ||
                                                            "Not specified"
                                                        }

                                                    </span>


                                                    <span>

                                                        <i className="bi bi-briefcase"></i>

                                                        {formatEmploymentType(
                                                            job.employmentType
                                                        )}

                                                    </span>

                                                </div>


                                                <button
                                                    type="button"

                                                    className="btn dashboard-job-button"

                                                    onClick={
                                                        () =>
                                                            navigate(
                                                                `/candidate/jobs/${job.id}`
                                                            )
                                                    }
                                                >

                                                    View Details

                                                    <i className="bi bi-arrow-right ms-2"></i>

                                                </button>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </section>

                    </div>


                    {/* =====================================
                        RIGHT COLUMN
                    ===================================== */}

                    <div className="col-xl-4">


                        {/* =================================
                            QUICK ACTIONS
                        ================================= */}

                        <section className="dashboard-section-card">

                            <div className="dashboard-section-header">

                                <div>

                                    <span>
                                        Shortcuts
                                    </span>


                                    <h4>
                                        Quick Actions
                                    </h4>

                                </div>

                            </div>


                            <div className="candidate-quick-actions">


                                {/* FIND JOBS */}

                                <Link
                                    to="/candidate/jobs"
                                    className="candidate-quick-action"
                                >

                                    <div className="quick-action-icon quick-blue">

                                        <i className="bi bi-search"></i>

                                    </div>


                                    <div>

                                        <strong>
                                            Find Jobs
                                        </strong>


                                        <span>
                                            Explore opportunities
                                        </span>

                                    </div>


                                    <i className="bi bi-chevron-right"></i>

                                </Link>


                                {/* SAVED JOBS */}

                                <Link
                                    to="/candidate/saved-jobs"
                                    className="candidate-quick-action"
                                >

                                    <div className="quick-action-icon quick-purple">

                                        <i className="bi bi-bookmark"></i>

                                    </div>


                                    <div>

                                        <strong>
                                            Saved Jobs
                                        </strong>


                                        <span>
                                            View your shortlist
                                        </span>

                                    </div>


                                    <i className="bi bi-chevron-right"></i>

                                </Link>


                                {/* APPLICATIONS */}

                                <Link
                                    to="/candidate/applications"
                                    className="candidate-quick-action"
                                >

                                    <div className="quick-action-icon quick-orange">

                                        <i className="bi bi-file-earmark-check"></i>

                                    </div>


                                    <div>

                                        <strong>
                                            Applications
                                        </strong>


                                        <span>
                                            Track application status
                                        </span>

                                    </div>


                                    <i className="bi bi-chevron-right"></i>

                                </Link>


                                {/* JOB OFFERS */}

                                <Link
                                    to="/candidate/offers"
                                    className="candidate-quick-action"
                                >

                                    <div className="quick-action-icon quick-green">

                                        <i className="bi bi-envelope-paper"></i>

                                    </div>


                                    <div>

                                        <strong>
                                            My Offers
                                        </strong>


                                        <span>

                                            {pendingOfferCount > 0

                                                ? `${pendingOfferCount} offer${
                                                    pendingOfferCount === 1
                                                        ? ""
                                                        : "s"
                                                } awaiting your response`

                                                : "Review your job offers"
                                            }

                                        </span>

                                    </div>


                                    <i className="bi bi-chevron-right"></i>

                                </Link>


                                {(onboardings.length > 0 ||
                                    acceptedOfferCount > 0) && (

                                    <Link
                                        to="/candidate/onboarding"
                                        className="candidate-quick-action candidate-onboarding-quick-action"
                                    >

                                        <div className="quick-action-icon quick-cyan">
                                            <i className="bi bi-person-workspace"></i>
                                        </div>


                                        <div>

                                            <strong>
                                                Onboarding
                                            </strong>

                                            <span>
                                                {currentOnboarding
                                                    ? formatStatus(
                                                        currentOnboarding.status
                                                    )
                                                    : "Review joining details"
                                                }
                                            </span>

                                        </div>


                                        <i className="bi bi-chevron-right"></i>

                                    </Link>
                                )}


                                {/* PROFILE */}

                                <Link
                                    to="/candidate/profile"
                                    className="candidate-quick-action"
                                >

                                    <div className="quick-action-icon quick-blue">

                                        <i className="bi bi-person"></i>

                                    </div>


                                    <div>

                                        <strong>
                                            My Profile
                                        </strong>


                                        <span>
                                            Update profile & resume
                                        </span>

                                    </div>


                                    <i className="bi bi-chevron-right"></i>

                                </Link>

                            </div>

                        </section>


                        {/* =================================
                            OFFER SUMMARY
                        ================================= */}

                        <section className="dashboard-career-card">

                            <div className="career-card-icon">

                                <i className="bi bi-envelope-paper-fill"></i>

                            </div>


                            <span>
                                Job Offers
                            </span>


                            <h3>

                                {pendingOfferCount > 0

                                    ? "You have an offer waiting."

                                    : acceptedOfferCount > 0

                                        ? "Your hiring is confirmed."

                                        : "Keep building momentum."
                                }

                            </h3>


                            <p>

                                {pendingOfferCount > 0

                                    ? "Review your offer details, joining date and expiry before responding."

                                    : acceptedOfferCount > 0

                                        ? "You accepted a job offer. Review your joining date and offer letter anytime."

                                        : "Complete your profile and continue applying for opportunities."
                                }

                            </p>


                            <div className="career-progress-stats">

                                <div>

                                    <strong>
                                        {offers.length}
                                    </strong>

                                    <span>
                                        Offers
                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        {pendingOfferCount}
                                    </strong>

                                    <span>
                                        Pending
                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        {acceptedOfferCount}
                                    </strong>

                                    <span>
                                        Hired
                                    </span>

                                </div>

                            </div>


                            <Link
                                to="/candidate/offers"
                                className="btn dashboard-job-button mt-3"
                            >

                                View My Offers

                                <i className="bi bi-arrow-right ms-2"></i>

                            </Link>

                        </section>


                        {/* =================================
                            CAREER PROGRESS
                        ================================= */}

                        <section className="dashboard-career-card">

                            <div className="career-card-icon">

                                <i className="bi bi-graph-up-arrow"></i>

                            </div>


                            <span>
                                Career Progress
                            </span>


                            <h3>
                                Keep the momentum going.
                            </h3>


                            <p>
                                A complete profile and consistent
                                applications can help you discover
                                better opportunities.
                            </p>


                            <div className="career-progress-stats">

                                <div>

                                    <strong>
                                        {applications.length}
                                    </strong>

                                    <span>
                                        Applied
                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        {shortlistedCount}
                                    </strong>

                                    <span>
                                        Shortlisted
                                    </span>

                                </div>


                                <div>

                                    <strong>
                                        {selectedCount}
                                    </strong>

                                    <span>
                                        Selected
                                    </span>

                                </div>

                            </div>

                        </section>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default CandidateDashboard;