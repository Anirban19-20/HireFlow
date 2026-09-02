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

import "./RecruiterDashboard.css";


function RecruiterDashboard() {

    const navigate =
        useNavigate();

    const {
        user
    } = useAuth();


    const [
        dashboard,
        setDashboard
    ] = useState(null);


    const [
        jobs,
        setJobs
    ] = useState([]);


    const [
        applications,
        setApplications
    ] = useState([]);


    const [
        profile,
        setProfile
    ] = useState(null);


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
                                "/api/recruiter/dashboard"
                            ),

                            axiosInstance.get(
                                "/api/recruiter/jobs"
                            ),

                            axiosInstance.get(
                                "/api/recruiter/profile"
                            ),

                            axiosInstance.get(
                                "/api/recruiter/offers"
                            ),

                            axiosInstance.get(
                                "/api/recruiter/onboarding"
                            )
                        ]);


                    // =========================================
                    // DASHBOARD
                    // =========================================

                    if (
                        results[0].status ===
                        "fulfilled"
                    ) {

                        const data =
                            results[0]
                                .value
                                .data;


                        setDashboard(
                            data
                        );


                        setApplications(
                            Array.isArray(
                                data?.recentApplications
                            )
                                ? data.recentApplications

                                : Array.isArray(
                                    data?.applications
                                )
                                    ? data.applications
                                    : []
                        );

                    } else {

                        console.error(
                            "Recruiter dashboard request failed:",
                            results[0].reason
                        );


                        setDashboard(
                            null
                        );
                    }


                    // =========================================
                    // JOBS
                    // =========================================

                    if (
                        results[1].status ===
                        "fulfilled"
                    ) {

                        const data =
                            results[1]
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

                        console.error(
                            "Unable to load recruiter jobs:",
                            results[1].reason
                        );


                        setJobs(
                            []
                        );
                    }


                    // =========================================
                    // PROFILE
                    // =========================================

                    if (
                        results[2].status ===
                        "fulfilled"
                    ) {

                        setProfile(
                            results[2]
                                .value
                                .data
                        );

                    } else {

                        setProfile(
                            null
                        );
                    }


                    // =========================================
                    // JOB OFFERS
                    // =========================================

                    if (
                        results[3].status ===
                        "fulfilled"
                    ) {

                        const data =
                            results[3]
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
                            "Unable to load recruiter offers:",
                            results[3].reason
                        );


                        setOffers(
                            []
                        );
                    }


                    // =========================================
                    // ONBOARDING
                    // =========================================

                    if (
                        results[4].status ===
                        "fulfilled"
                    ) {

                        const data =
                            results[4]
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
                            "Unable to load recruiter onboarding:",
                            results[4].reason
                        );


                        setOnboardings(
                            []
                        );
                    }


                    // =========================================
                    // CRITICAL FAILURE
                    // =========================================

                    if (
                        results[0].status ===
                            "rejected" &&
                        results[1].status ===
                            "rejected"
                    ) {

                        setError(
                            results[0]
                                .reason
                                ?.response
                                ?.data
                                ?.message ||
                            "Unable to load recruiter dashboard."
                        );
                    }

                } catch (
                    requestError
                ) {

                    console.error(
                        "Recruiter dashboard error:",
                        requestError
                    );


                    setError(
                        requestError
                            .response
                            ?.data
                            ?.message ||
                        "Unable to load recruiter dashboard."
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
    // JOB COUNTS
    // =====================================================

    const totalJobs =
        dashboard?.totalJobs ??
        jobs.length;


    const openJobs =
        dashboard?.openJobs ??
        jobs.filter(
            (
                job
            ) =>
                job.status ===
                "OPEN"
        ).length;


    const closedJobs =
        dashboard?.closedJobs ??
        jobs.filter(
            (
                job
            ) =>
                job.status ===
                "CLOSED"
        ).length;


    const expiredJobs =
        dashboard?.expiredJobs ??
        jobs.filter(
            (
                job
            ) =>
                job.status ===
                "EXPIRED"
        ).length;


    // =====================================================
    // APPLICATION COUNTS
    // =====================================================

    const totalApplications =
        dashboard?.totalApplications ??
        dashboard?.applicationCount ??
        applications.length;


    const shortlistedCount =
        dashboard?.shortlistedApplications ??
        dashboard?.shortlistedCandidates ??
        dashboard?.shortlistedCount ??
        0;


    const interviewCount =
        dashboard?.interviewApplications ??
        dashboard?.interviewCandidates ??
        dashboard?.interviewCount ??
        0;


    const selectedCount =
        dashboard?.selectedApplications ??
        dashboard?.selectedCandidates ??
        dashboard?.selectedCount ??
        0;


    // =====================================================
    // OFFER COUNTS
    // =====================================================

    const totalOffers =
        offers.length;


    const draftOffers =
        offers.filter(
            (
                offer
            ) =>
                offer?.status ===
                "DRAFT"
        ).length;


    const pendingOffers =
        offers.filter(
            (
                offer
            ) =>
                offer?.status ===
                "SENT"
        ).length;


    const acceptedOffers =
        offers.filter(
            (
                offer
            ) =>
                offer?.status ===
                "ACCEPTED"
        ).length;


    const closedOffers =
        offers.filter(
            (
                offer
            ) =>
                offer?.status ===
                    "REJECTED" ||

                offer?.status ===
                    "WITHDRAWN" ||

                offer?.status ===
                    "EXPIRED"
        ).length;


    // =====================================================
    // ONBOARDING COUNTS
    // =====================================================

    const joiningPendingCount =
        onboardings.filter(
            (
                onboarding
            ) =>
                onboarding?.status ===
                "JOINING_PENDING"
        ).length;


    const documentsPendingCount =
        onboardings.filter(
            (
                onboarding
            ) =>
                onboarding?.status ===
                "DOCUMENTS_PENDING"
        ).length;


    const readyToJoinCount =
        onboardings.filter(
            (
                onboarding
            ) =>
                onboarding?.status ===
                "READY_TO_JOIN"
        ).length;


    const joinedCount =
        onboardings.filter(
            (
                onboarding
            ) =>
                onboarding?.status ===
                "JOINED"
        ).length;


    // =====================================================
    // RECENT JOBS
    // =====================================================

    const recentJobs =
        useMemo(
            () => {

                const backendRecent =
                    dashboard?.recentJobs;


                if (
                    Array.isArray(
                        backendRecent
                    )
                ) {

                    return backendRecent
                        .slice(
                            0,
                            5
                        );
                }


                return [
                    ...jobs
                ]
                    .sort(
                        (
                            first,
                            second
                        ) => {

                            const firstDate =
                                new Date(
                                    first?.createdAt ||
                                    0
                                );


                            const secondDate =
                                new Date(
                                    second?.createdAt ||
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
                        5
                    );
            },
            [
                dashboard,
                jobs
            ]
        );


    // =====================================================
    // RECENT APPLICATIONS
    // =====================================================

    const recentApplications =
        useMemo(
            () => {

                const backendRecent =
                    dashboard?.recentApplications ||
                    dashboard?.applications;


                if (
                    Array.isArray(
                        backendRecent
                    )
                ) {

                    return backendRecent
                        .slice(
                            0,
                            5
                        );
                }


                return applications
                    .slice(
                        0,
                        5
                    );
            },
            [
                dashboard,
                applications
            ]
        );


    // =====================================================
    // RECENT OFFERS
    // =====================================================

    const recentOffers =
        useMemo(
            () => {

                return [
                    ...offers
                ]
                    .sort(
                        (
                            first,
                            second
                        ) => {

                            const firstDate =
                                new Date(
                                    first?.respondedAt ||
                                    first?.sentAt ||
                                    first?.updatedAt ||
                                    first?.createdAt ||
                                    0
                                );


                            const secondDate =
                                new Date(
                                    second?.respondedAt ||
                                    second?.sentAt ||
                                    second?.updatedAt ||
                                    second?.createdAt ||
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
                        5
                    );
            },
            [
                offers
            ]
        );


    // =====================================================
    // RECENT HIRES
    // =====================================================

    const recentHires =
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
                    )
                    .slice(
                        0,
                        4
                    ),
            [
                offers
            ]
        );


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate =
        (
            value
        ) => {

            if (
                !value
            ) {

                return "—";
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

                return "—";
            }


            return date
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
                        letter
                    ) =>
                        letter
                            .toUpperCase()
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

                return "—";
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

                return String(
                    amount
                );
            }


            try {

                return new Intl
                    .NumberFormat(
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
                    )
                    .format(
                        numericAmount
                    );

            } catch (
                formatError
            ) {

                console.error(
                    "Salary formatting error:",
                    formatError
                );


                return `${currency || "INR"} ${numericAmount}`;
            }
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

                case "OPEN":
                case "SELECTED":

                    return "status-success";


                case "SHORTLISTED":

                    return "status-primary";


                case "INTERVIEW":

                    return "status-purple";


                case "UNDER_REVIEW":

                    return "status-warning";


                case "REJECTED":
                case "CLOSED":

                    return "status-danger";


                case "EXPIRED":
                case "WITHDRAWN":

                    return "status-muted";


                default:

                    return "status-primary";
            }
        };


    // =====================================================
    // OFFER STATUS CLASS
    // =====================================================

    const getOfferStatusClass =
        (
            status
        ) => {

            switch (
                status
            ) {

                case "DRAFT":

                    return "dashboard-offer-draft";


                case "SENT":

                    return "dashboard-offer-sent";


                case "ACCEPTED":

                    return "dashboard-offer-accepted";


                case "REJECTED":

                    return "dashboard-offer-rejected";


                case "WITHDRAWN":

                    return "dashboard-offer-withdrawn";


                case "EXPIRED":

                    return "dashboard-offer-expired";


                default:

                    return "dashboard-offer-default";
            }
        };


    // =====================================================
    // APPLICATION HELPERS
    // =====================================================

    const getApplicationId =
        (
            application
        ) => {

            return (
                application?.applicationId ||
                application?.id
            );
        };


    const getCandidateName =
        (
            application
        ) => {

            return (
                application?.candidateName ||
                application?.candidate?.name ||
                "Candidate"
            );
        };


    const getJobTitle =
        (
            application
        ) => {

            return (
                application?.jobTitle ||
                application?.job?.title ||
                "Job"
            );
        };


    const getCandidateInitial =
        (
            application
        ) => {

            return getCandidateName(
                application
            )
                .charAt(
                    0
                )
                .toUpperCase();
        };


    // =====================================================
    // OFFER HELPERS
    // =====================================================

    const getOfferCandidateName =
        (
            offer
        ) => {

            return (
                offer?.candidateName ||
                "Candidate"
            );
        };


    const getOfferJobTitle =
        (
            offer
        ) => {

            return (
                offer?.jobTitle ||
                "Job"
            );
        };


    const openOfferApplication =
        (
            offer
        ) => {

            if (
                !offer?.jobId
            ) {

                navigate(
                    "/recruiter/jobs"
                );

                return;
            }


            navigate(
                `/recruiter/jobs/${offer.jobId}/applications`
            );
        };


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading
    ) {

        return (

            <div className="recruiter-dashboard-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>


                <p>
                    Loading recruiter dashboard...
                </p>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="recruiter-dashboard-page">

            <div className="container">


                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="recruiter-dashboard-header">

                    <div>

                        <span className="dashboard-eyebrow">
                            Recruiter Workspace
                        </span>


                        <h1>

                            Welcome back

                            {user?.name
                                ? `, ${user.name}`
                                : ""
                            }

                        </h1>


                        <p>
                            Manage jobs, applications,
                            interviews and job offers from
                            one workspace.
                        </p>

                    </div>


                    <div className="recruiter-dashboard-header-actions">

                        <button
                            type="button"
                            className="btn dashboard-refresh-btn"

                            onClick={
                                loadDashboard
                            }
                        >

                            <i className="bi bi-arrow-clockwise me-2"></i>

                            Refresh

                        </button>


                        <button
                            type="button"
                            className="btn dashboard-post-job-btn"

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


                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (

                    <div className="alert alert-danger recruiter-dashboard-alert">

                        <i className="bi bi-exclamation-circle me-2"></i>

                        {error}

                    </div>

                )}


                {/* =========================================
                    PROFILE WARNING
                ========================================= */}

                {!profile && (

                    <div className="dashboard-profile-warning">

                        <div>

                            <div className="dashboard-profile-warning-icon">

                                <i className="bi bi-building-exclamation"></i>

                            </div>


                            <div>

                                <h5>
                                    Complete your company profile
                                </h5>


                                <p>
                                    Add your company information so
                                    candidates can identify your
                                    organization.
                                </p>

                            </div>

                        </div>


                        <Link
                            to="/recruiter/profile"
                            className="btn"
                        >

                            Complete Profile

                        </Link>

                    </div>

                )}


                {/* =========================================
                    MAIN STATS
                ========================================= */}

                <div className="dashboard-stat-grid">


                    <DashboardStat
                        icon="bi-briefcase"
                        iconClass="stat-icon-blue"
                        label="Total Jobs"
                        value={
                            totalJobs
                        }
                        helper="All job postings"
                    />


                    <DashboardStat
                        icon="bi-check-circle"
                        iconClass="stat-icon-green"
                        label="Open Jobs"
                        value={
                            openJobs
                        }
                        helper="Accepting applications"
                    />


                    <DashboardStat
                        icon="bi-people"
                        iconClass="stat-icon-purple"
                        label="Applications"
                        value={
                            totalApplications
                        }
                        helper="Across all jobs"
                    />


                    <DashboardStat
                        icon="bi-person-check"
                        iconClass="stat-icon-orange"
                        label="Shortlisted"
                        value={
                            shortlistedCount
                        }
                        helper="Candidates moving forward"
                    />

                </div>


                {/* =========================================
                    OFFER OVERVIEW
                ========================================= */}

                <section className="recruiter-offer-overview">

                    <div className="recruiter-offer-overview-header">

                        <div>

                            <span>
                                Offer Management
                            </span>


                            <h3>
                                Job Offer Overview
                            </h3>


                            <p>
                                Track offers from draft through
                                candidate response.
                            </p>

                        </div>


                        <div className="recruiter-offer-overview-icon">

                            <i className="bi bi-envelope-paper"></i>

                        </div>

                    </div>


                    <div className="recruiter-offer-stat-grid">


                        <OfferStat
                            icon="bi-envelope-paper"
                            label="Total Offers"
                            value={
                                totalOffers
                            }
                            className="offer-stat-total"
                        />


                        <OfferStat
                            icon="bi-pencil-square"
                            label="Draft"
                            value={
                                draftOffers
                            }
                            className="offer-stat-draft"
                        />


                        <OfferStat
                            icon="bi-send"
                            label="Pending"
                            value={
                                pendingOffers
                            }
                            className="offer-stat-pending"
                        />


                        <OfferStat
                            icon="bi-patch-check"
                            label="Hires"
                            value={
                                acceptedOffers
                            }
                            className="offer-stat-accepted"
                        />


                        <OfferStat
                            icon="bi-x-circle"
                            label="Closed"
                            value={
                                closedOffers
                            }
                            className="offer-stat-closed"
                        />

                    </div>

                </section>


                {/* =========================================
                    ONBOARDING OVERVIEW
                ========================================= */}

                {(onboardings.length > 0 ||
                    acceptedOffers > 0) && (

                    <section className="recruiter-onboarding-overview">

                        <div className="recruiter-onboarding-overview-header">

                            <div>

                                <span>
                                    Post-offer Workflow
                                </span>

                                <h3>
                                    Candidate Onboarding
                                </h3>

                                <p>
                                    Track accepted candidates from joining
                                    confirmation through their first day.
                                </p>

                            </div>


                            <Link
                                to="/recruiter/onboarding"
                                className="recruiter-onboarding-overview-link"
                            >

                                Manage Onboarding

                                <i className="bi bi-arrow-right"></i>

                            </Link>

                        </div>


                        <div className="recruiter-onboarding-stat-grid">

                            <OnboardingStat
                                icon="bi-clock-history"
                                label="Joining Pending"
                                value={
                                    joiningPendingCount
                                }
                                className="onboarding-stat-pending"
                            />


                            <OnboardingStat
                                icon="bi-file-earmark-text"
                                label="Documents Pending"
                                value={
                                    documentsPendingCount
                                }
                                className="onboarding-stat-documents"
                            />


                            <OnboardingStat
                                icon="bi-person-check"
                                label="Ready To Join"
                                value={
                                    readyToJoinCount
                                }
                                className="onboarding-stat-ready"
                            />


                            <OnboardingStat
                                icon="bi-building-check"
                                label="Joined"
                                value={
                                    joinedCount
                                }
                                className="onboarding-stat-joined"
                            />

                        </div>

                    </section>
                )}


                {/* =========================================
                    RECENT HIRES
                ========================================= */}

                {recentHires.length > 0 && (

                    <section className="recruiter-hire-section">

                        <div className="recruiter-hire-section-header">

                            <div>

                                <span>
                                    Hiring Completed
                                </span>

                                <h3>
                                    Recent Hires
                                </h3>

                                <p>
                                    Candidates who accepted your job offers.
                                </p>

                            </div>

                            <div className="recruiter-hire-section-icon">

                                <i className="bi bi-person-check-fill"></i>

                            </div>

                        </div>

                        <div className="recruiter-hire-grid">

                            {recentHires.map(
                                (
                                    offer
                                ) => (

                                <article
                                    className="recruiter-hire-card"
                                    key={
                                        offer.id
                                    }
                                >

                                    <div className="recruiter-hire-card-top">

                                        <div className="recruiter-hire-avatar">

                                            {getOfferCandidateName(
                                                offer
                                            )
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase()
                                            }

                                        </div>

                                        <div>

                                            <span>
                                                Hire Confirmed
                                            </span>

                                            <strong>
                                                {getOfferCandidateName(
                                                    offer
                                                )}
                                            </strong>

                                            <small>
                                                {getOfferJobTitle(
                                                    offer
                                                )}
                                            </small>

                                        </div>

                                    </div>

                                    <div className="recruiter-hire-card-details">

                                        <div>
                                            <small>
                                                Joining Date
                                            </small>

                                            <strong>
                                                {formatDate(
                                                    offer.joiningDate
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <small>
                                                Compensation
                                            </small>

                                            <strong>
                                                {formatMoney(
                                                    offer.offeredSalary,
                                                    offer.currency
                                                )}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className="recruiter-hire-card-footer">

                                        <span>
                                            <i className="bi bi-patch-check-fill"></i>
                                            Accepted{" "}
                                            {formatDate(
                                                offer.respondedAt
                                            )}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={
                                                () =>
                                                    navigate(
                                                        "/recruiter/onboarding"
                                                    )
                                            }
                                        >
                                            Manage Onboarding
                                            <i className="bi bi-arrow-right"></i>
                                        </button>

                                    </div>

                                </article>
                            ))}

                        </div>

                    </section>
                )}


                {/* =========================================
                    JOBS + PIPELINE
                ========================================= */}

                <div className="row g-4 mt-1">


                    {/* RECENT JOBS */}

                    <div className="col-xl-7">

                        <div className="dashboard-section-card">

                            <div className="dashboard-section-header">

                                <div>

                                    <h4>
                                        Recent Jobs
                                    </h4>


                                    <p>
                                        Your latest job postings
                                    </p>

                                </div>


                                <Link
                                    to="/recruiter/jobs"
                                    className="dashboard-view-all"
                                >

                                    View All

                                    <i className="bi bi-arrow-right"></i>

                                </Link>

                            </div>


                            {recentJobs.length ===
                            0 ? (

                                <div className="dashboard-empty-state">

                                    <div>

                                        <i className="bi bi-briefcase"></i>

                                    </div>


                                    <h5>
                                        No jobs posted yet
                                    </h5>


                                    <p>
                                        Create your first job posting
                                        to start receiving applications.
                                    </p>


                                    <button
                                        type="button"
                                        className="btn"

                                        onClick={
                                            () =>
                                                navigate(
                                                    "/recruiter/jobs/create"
                                                )
                                        }
                                    >

                                        Post a Job

                                    </button>

                                </div>

                            ) : (

                                <div className="dashboard-job-list">

                                    {recentJobs.map(
                                        (
                                            job
                                        ) => (

                                            <div
                                                className="dashboard-job-item"
                                                key={
                                                    job.id
                                                }
                                            >

                                                <div className="dashboard-job-main">

                                                    <div className="dashboard-job-icon">

                                                        <i className="bi bi-briefcase"></i>

                                                    </div>


                                                    <div>

                                                        <h5>
                                                            {job.title}
                                                        </h5>


                                                        <p>

                                                            <span>

                                                                <i className="bi bi-geo-alt"></i>

                                                                {job.location ||
                                                                    "Not specified"
                                                                }

                                                            </span>


                                                            <span>

                                                                <i className="bi bi-calendar3"></i>

                                                                {formatDate(
                                                                    job.createdAt
                                                                )}

                                                            </span>

                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="dashboard-job-actions">

                                                    <span
                                                        className={
                                                            `dashboard-status ${
                                                                getStatusClass(
                                                                    job.status
                                                                )
                                                            }`
                                                        }
                                                    >

                                                        {formatStatus(
                                                            job.status
                                                        )}

                                                    </span>


                                                    <button
                                                        type="button"
                                                        className="dashboard-icon-button"
                                                        title="View applications"

                                                        onClick={
                                                            () =>
                                                                navigate(
                                                                    `/recruiter/jobs/${job.id}/applications`
                                                                )
                                                        }
                                                    >

                                                        <i className="bi bi-people"></i>

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="dashboard-icon-button"
                                                        title="Edit job"

                                                        onClick={
                                                            () =>
                                                                navigate(
                                                                    `/recruiter/jobs/${job.id}/edit`
                                                                )
                                                        }
                                                    >

                                                        <i className="bi bi-pencil"></i>

                                                    </button>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* HIRING PIPELINE */}

                    <div className="col-xl-5">

                        <div className="dashboard-section-card h-100">

                            <div className="dashboard-section-header">

                                <div>

                                    <h4>
                                        Hiring Pipeline
                                    </h4>


                                    <p>
                                        Candidate progress overview
                                    </p>

                                </div>

                            </div>


                            <div className="pipeline-list">


                                <PipelineItem
                                    icon="bi-inbox"
                                    label="Applications"
                                    value={
                                        totalApplications
                                    }
                                    percentage={
                                        totalApplications > 0
                                            ? 100
                                            : 0
                                    }
                                />


                                <PipelineItem
                                    icon="bi-person-check"
                                    label="Shortlisted"
                                    value={
                                        shortlistedCount
                                    }
                                    percentage={
                                        calculatePercentage(
                                            shortlistedCount,
                                            totalApplications
                                        )
                                    }
                                />


                                <PipelineItem
                                    icon="bi-calendar-event"
                                    label="Interview"
                                    value={
                                        interviewCount
                                    }
                                    percentage={
                                        calculatePercentage(
                                            interviewCount,
                                            totalApplications
                                        )
                                    }
                                />


                                <PipelineItem
                                    icon="bi-trophy"
                                    label="Selected"
                                    value={
                                        selectedCount
                                    }
                                    percentage={
                                        calculatePercentage(
                                            selectedCount,
                                            totalApplications
                                        )
                                    }
                                />

                            </div>


                            <div className="pipeline-footer">

                                <span>
                                    Job Status
                                </span>


                                <div>

                                    <small>

                                        <strong>
                                            {openJobs}
                                        </strong>

                                        {" "}Open

                                    </small>


                                    <small>

                                        <strong>
                                            {closedJobs}
                                        </strong>

                                        {" "}Closed

                                    </small>


                                    <small>

                                        <strong>
                                            {expiredJobs}
                                        </strong>

                                        {" "}Expired

                                    </small>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    OFFER ACTIVITY + QUICK ACTIONS
                ========================================= */}

                <div className="row g-4 mt-1">


                    {/* OFFER ACTIVITY */}

                    <div className="col-xl-8">

                        <div className="dashboard-section-card">

                            <div className="dashboard-section-header">

                                <div>

                                    <h4>
                                        Recent Offer Activity
                                    </h4>


                                    <p>
                                        Latest candidate offer updates
                                    </p>

                                </div>

                            </div>


                            {recentOffers.length ===
                            0 ? (

                                <div className="dashboard-empty-state compact">

                                    <div>

                                        <i className="bi bi-envelope-paper"></i>

                                    </div>


                                    <h5>
                                        No job offers yet
                                    </h5>


                                    <p>
                                        Offers created for selected
                                        candidates will appear here.
                                    </p>

                                </div>

                            ) : (

                                <div className="dashboard-offer-list">

                                    {recentOffers.map(
                                        (
                                            offer
                                        ) => (

                                            <div
                                                className="dashboard-offer-item"

                                                key={
                                                    offer.id
                                                }
                                            >

                                                <div className="dashboard-offer-main">

                                                    <div className="dashboard-offer-avatar">

                                                        {getOfferCandidateName(
                                                            offer
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()
                                                        }

                                                    </div>


                                                    <div className="dashboard-offer-info">

                                                        <strong>

                                                            {getOfferCandidateName(
                                                                offer
                                                            )}

                                                        </strong>


                                                        <span>

                                                            {getOfferJobTitle(
                                                                offer
                                                            )}

                                                        </span>


                                                        <small>

                                                            {formatMoney(
                                                                offer.offeredSalary,
                                                                offer.currency
                                                            )}

                                                            {" • "}

                                                            {formatDate(
                                                                offer.respondedAt ||
                                                                offer.sentAt ||
                                                                offer.updatedAt ||
                                                                offer.createdAt
                                                            )}

                                                        </small>

                                                    </div>

                                                </div>


                                                <div className="dashboard-offer-actions">

                                                    <span
                                                        className={
                                                            `dashboard-offer-status ${
                                                                getOfferStatusClass(
                                                                    offer.status
                                                                )
                                                            }`
                                                        }
                                                    >

                                                        {formatStatus(
                                                            offer.status
                                                        )}

                                                    </span>


                                                    <button
                                                        type="button"

                                                        onClick={
                                                            () =>
                                                                openOfferApplication(
                                                                    offer
                                                                )
                                                        }
                                                    >

                                                        View

                                                        <i className="bi bi-arrow-right"></i>

                                                    </button>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* QUICK ACTIONS */}

                    <div className="col-xl-4">

                        <div className="dashboard-section-card h-100">

                            <div className="dashboard-section-header">

                                <div>

                                    <h4>
                                        Quick Actions
                                    </h4>


                                    <p>
                                        Common recruiter tasks
                                    </p>

                                </div>

                            </div>


                            <div className="dashboard-quick-actions">


                                <DashboardQuickAction
                                    to="/recruiter/jobs/create"
                                    icon="bi-plus-circle"
                                    title="Post New Job"
                                    description="Create a new opportunity"
                                />


                                <DashboardQuickAction
                                    to="/recruiter/jobs"
                                    icon="bi-briefcase"
                                    title="Manage Jobs"
                                    description="Jobs, candidates and offers"
                                />


                                <DashboardQuickAction
                                    to="/recruiter/interviews"
                                    icon="bi-calendar-event"
                                    title="Interviews"
                                    description="Manage interview rounds"
                                />


                                <DashboardQuickAction
                                    to="/recruiter/onboarding"
                                    icon="bi-person-workspace"
                                    title="Onboarding"
                                    description="Manage accepted candidates"
                                />


                                <DashboardQuickAction
                                    to="/recruiter/profile"
                                    icon="bi-building"
                                    title="Company Profile"
                                    description="Update company information"
                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    RECENT APPLICATIONS
                ========================================= */}

                <div className="row g-4 mt-1">

                    <div className="col-12">

                        <div className="dashboard-section-card">

                            <div className="dashboard-section-header">

                                <div>

                                    <h4>
                                        Recent Applications
                                    </h4>


                                    <p>
                                        Latest candidates in your
                                        recruitment pipeline
                                    </p>

                                </div>

                            </div>


                            {recentApplications.length ===
                            0 ? (

                                <div className="dashboard-empty-state compact">

                                    <div>

                                        <i className="bi bi-people"></i>

                                    </div>


                                    <h5>
                                        No applications yet
                                    </h5>


                                    <p>
                                        Applications will appear here
                                        when candidates apply.
                                    </p>

                                </div>

                            ) : (

                                <div className="dashboard-applicant-list">

                                    {recentApplications.map(
                                        (
                                            application
                                        ) => (

                                            <div
                                                className="dashboard-applicant-item"

                                                key={
                                                    getApplicationId(
                                                        application
                                                    )
                                                }
                                            >

                                                <div className="dashboard-applicant-main">

                                                    <div className="dashboard-candidate-avatar">

                                                        {getCandidateInitial(
                                                            application
                                                        )}

                                                    </div>


                                                    <div>

                                                        <h5>

                                                            {getCandidateName(
                                                                application
                                                            )}

                                                        </h5>


                                                        <p>

                                                            Applied for{" "}

                                                            <strong>

                                                                {getJobTitle(
                                                                    application
                                                                )}

                                                            </strong>

                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="dashboard-applicant-side">

                                                    <span
                                                        className={
                                                            `dashboard-status ${
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


                                                    <small>

                                                        {formatDate(
                                                            application.appliedAt
                                                        )}

                                                    </small>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


// =====================================================
// DASHBOARD STAT
// =====================================================

function DashboardStat({
    icon,
    iconClass,
    label,
    value,
    helper
}) {

    return (

        <div className="dashboard-stat-card">

            <div
                className={
                    `dashboard-stat-icon ${iconClass}`
                }
            >

                <i
                    className={
                        `bi ${icon}`
                    }
                ></i>

            </div>


            <div>

                <span>
                    {label}
                </span>


                <h3>
                    {value}
                </h3>


                <small>
                    {helper}
                </small>

            </div>

        </div>
    );
}


// =====================================================
// ONBOARDING STAT
// =====================================================

function OnboardingStat({
    icon,
    label,
    value,
    className
}) {

    return (

        <div
            className={
                `recruiter-onboarding-stat ${className || ""}`
            }
        >

            <div>
                <i className={`bi ${icon}`}></i>
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


// =====================================================
// OFFER STAT
// =====================================================

function OfferStat({
    icon,
    label,
    value,
    className
}) {

    return (

        <div
            className={
                `recruiter-offer-stat-card ${className}`
            }
        >

            <div>

                <i
                    className={
                        `bi ${icon}`
                    }
                ></i>

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


// =====================================================
// PIPELINE ITEM
// =====================================================

function PipelineItem({
    icon,
    label,
    value,
    percentage
}) {

    return (

        <div className="pipeline-item">

            <div className="pipeline-label">

                <span>

                    <i
                        className={
                            `bi ${icon}`
                        }
                    ></i>

                    {label}

                </span>


                <strong>
                    {value}
                </strong>

            </div>


            <div className="pipeline-track">

                <div
                    className="pipeline-progress"

                    style={{
                        width:
                            `${percentage}%`
                    }}
                ></div>

            </div>

        </div>
    );
}


// =====================================================
// QUICK ACTION
// =====================================================

function DashboardQuickAction({
    to,
    icon,
    title,
    description
}) {

    return (

        <Link
            to={
                to
            }

            className="dashboard-quick-action"
        >

            <div>

                <i
                    className={
                        `bi ${icon}`
                    }
                ></i>

            </div>


            <span>

                <strong>
                    {title}
                </strong>


                <small>
                    {description}
                </small>

            </span>


            <i className="bi bi-chevron-right"></i>

        </Link>
    );
}


// =====================================================
// PERCENTAGE
// =====================================================

function calculatePercentage(
    value,
    total
) {

    if (
        !total ||
        total <= 0
    ) {

        return 0;
    }


    return Math.min(
        Math.round(
            (
                Number(
                    value || 0
                ) /
                Number(
                    total
                )
            ) *
            100
        ),
        100
    );
}


export default RecruiterDashboard;