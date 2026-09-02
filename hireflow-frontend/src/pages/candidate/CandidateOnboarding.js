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

import "./CandidateOnboarding.css";


function CandidateOnboarding() {

    const [
        onboardings,
        setOnboardings
    ] = useState([]);

    const [
        selectedId,
        setSelectedId
    ] = useState(null);

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


    // =====================================================
    // LOAD ONBOARDING
    // =====================================================

    const loadOnboarding =
        useCallback(
            async (
                showLoader = true
            ) => {

                if (
                    showLoader
                ) {

                    setLoading(
                        true
                    );

                } else {

                    setRefreshing(
                        true
                    );
                }

                setError("");

                try {

                    const response =
                        await axiosInstance.get(
                            "/api/candidate/onboarding"
                        );

                    const data =
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : [];

                    setOnboardings(
                        data
                    );

                    setSelectedId(
                        (
                            currentSelectedId
                        ) => {

                            if (
                                currentSelectedId &&
                                data.some(
                                    (
                                        onboarding
                                    ) =>
                                        onboarding.id ===
                                        currentSelectedId
                                )
                            ) {

                                return currentSelectedId;
                            }


                            const activeOnboarding =
                                data.find(
                                    (
                                        onboarding
                                    ) =>
                                        onboarding.status !==
                                            "JOINED" &&
                                        onboarding.status !==
                                            "NO_SHOW"
                                );


                            return (
                                activeOnboarding?.id ||
                                data[0]?.id ||
                                null
                            );
                        }
                    );

                } catch (
                    requestError
                ) {

                    console.error(
                        "Unable to load candidate onboarding:",
                        requestError
                    );

                    setError(
                        requestError
                            .response
                            ?.data
                            ?.message ||
                        requestError
                            .response
                            ?.data ||
                        "Unable to load your onboarding details."
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
            []
        );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(
        () => {

            loadOnboarding();

        },
        [
            loadOnboarding
        ]
    );


    // =====================================================
    // SELECTED ONBOARDING
    // =====================================================

    const selectedOnboarding =
        useMemo(
            () => {

                return (
                    onboardings.find(
                        (
                            onboarding
                        ) =>
                            onboarding.id ===
                            selectedId
                    ) ||
                    onboardings[0] ||
                    null
                );

            },
            [
                onboardings,
                selectedId
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
    // FORMAT DATE
    // =====================================================

    const formatDate =
        (
            value
        ) => {

            if (
                !value
            ) {

                return "To be confirmed";
            }

            const date =
                new Date(
                    `${value}T00:00:00`
                );

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return value;
            }

            return date
                .toLocaleDateString(
                    "en-IN",
                    {
                        day:
                            "2-digit",

                        month:
                            "long",

                        year:
                            "numeric"
                    }
                );
        };


    // =====================================================
    // FORMAT DATE TIME
    // =====================================================

    const formatDateTime =
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

                return value;
            }

            return date
                .toLocaleString(
                    "en-IN",
                    {
                        day:
                            "2-digit",

                        month:
                            "short",

                        year:
                            "numeric",

                        hour:
                            "2-digit",

                        minute:
                            "2-digit"
                    }
                );
        };


    // =====================================================
    // FORMAT TIME
    // =====================================================

    const formatTime =
        (
            value
        ) => {

            if (
                !value
            ) {

                return "To be confirmed";
            }

            const parts =
                value.split(
                    ":"
                );

            if (
                parts.length < 2
            ) {

                return value;
            }

            let hour =
                Number(
                    parts[0]
                );

            const minute =
                parts[1];

            if (
                Number.isNaN(
                    hour
                )
            ) {

                return value;
            }

            const period =
                hour >= 12
                    ? "PM"
                    : "AM";

            hour =
                hour % 12 ||
                12;

            return `${hour}:${minute} ${period}`;
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
                ignored
            ) {

                return `${currency || "INR"} ${numericAmount.toLocaleString(
                    "en-IN"
                )}`;
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

                case "JOINING_PENDING":

                    return "candidate-onboarding-status-pending";

                case "DOCUMENTS_PENDING":

                    return "candidate-onboarding-status-documents";

                case "READY_TO_JOIN":

                    return "candidate-onboarding-status-ready";

                case "JOINED":

                    return "candidate-onboarding-status-joined";

                case "NO_SHOW":

                    return "candidate-onboarding-status-no-show";

                default:

                    return "";
            }
        };


    // =====================================================
    // WORKFLOW
    // =====================================================

    const workflowSteps = [
        {
            status:
                "JOINING_PENDING",

            title:
                "Joining Confirmed",

            description:
                "Your accepted offer has entered onboarding.",

            icon:
                "bi-check-circle"
        },
        {
            status:
                "DOCUMENTS_PENDING",

            title:
                "Documents",

            description:
                "Complete the required joining documents.",

            icon:
                "bi-file-earmark-text"
        },
        {
            status:
                "READY_TO_JOIN",

            title:
                "Ready To Join",

            description:
                "Your onboarding formalities are complete.",

            icon:
                "bi-person-check"
        },
        {
            status:
                "JOINED",

            title:
                "Joined",

            description:
                "You have successfully joined the organization.",

            icon:
                "bi-building-check"
        }
    ];


    // =====================================================
    // CURRENT STEP
    // =====================================================

    const getCurrentStep =
        (
            status
        ) => {

            switch (
                status
            ) {

                case "JOINING_PENDING":

                    return 0;

                case "DOCUMENTS_PENDING":

                    return 1;

                case "READY_TO_JOIN":

                    return 2;

                case "JOINED":

                    return 3;

                default:

                    return -1;
            }
        };


    const currentStep =
        selectedOnboarding
            ? getCurrentStep(
                selectedOnboarding.status
            )
            : -1;


    // =====================================================
    // DOCUMENT LIST
    // =====================================================

    const requiredDocuments =
        useMemo(
            () => {

                if (
                    !selectedOnboarding
                        ?.documentsRequired
                ) {

                    return [];
                }

                return selectedOnboarding
                    .documentsRequired
                    .split(
                        /[,;\n]+/
                    )
                    .map(
                        (
                            document
                        ) =>
                            document.trim()
                    )
                    .filter(
                        Boolean
                    );

            },
            [
                selectedOnboarding
            ]
        );


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading
    ) {

        return (

            <div className="candidate-onboarding-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <p>
                    Preparing your onboarding portal...
                </p>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="candidate-onboarding-page">

            <div className="container-fluid px-lg-5">


                {/* =========================================
                    HEADER
                ========================================= */}

                <section className="candidate-onboarding-header">

                    <div>

                        <span className="candidate-onboarding-eyebrow">
                            Post-offer onboarding
                        </span>

                        <h1>
                            Your Onboarding
                        </h1>

                        <p>
                            Review your joining information,
                            documents and onboarding progress.
                        </p>

                    </div>


                    <div className="candidate-onboarding-header-actions">

                        <Link
                            to="/candidate/offers"
                            className="candidate-onboarding-offer-button"
                        >

                            <i className="bi bi-envelope-paper"></i>

                            My Offers

                        </Link>


                        <button
                            type="button"
                            className="candidate-onboarding-refresh-button"
                            disabled={
                                refreshing
                            }
                            onClick={
                                () =>
                                    loadOnboarding(
                                        false
                                    )
                            }
                        >

                            {refreshing ? (

                                <>
                                    <span className="spinner-border spinner-border-sm"></span>

                                    Refreshing
                                </>

                            ) : (

                                <>
                                    <i className="bi bi-arrow-clockwise"></i>

                                    Refresh
                                </>
                            )}

                        </button>

                    </div>

                </section>


                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (

                    <div className="alert alert-danger candidate-onboarding-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {typeof error ===
                        "string"
                            ? error
                            : "Unable to load onboarding."
                        }

                    </div>
                )}


                {/* =========================================
                    EMPTY
                ========================================= */}

                {!error &&
                onboardings.length ===
                    0 && (

                    <section className="candidate-onboarding-empty">

                        <div className="candidate-onboarding-empty-icon">

                            <i className="bi bi-briefcase"></i>

                        </div>

                        <span>
                            No active onboarding
                        </span>

                        <h2>
                            Your onboarding journey
                            has not started yet.
                        </h2>

                        <p>
                            Once you accept a job offer,
                            the recruiter will be able to
                            provide your joining details here.
                        </p>

                        <Link
                            to="/candidate/offers"
                            className="candidate-onboarding-primary-button"
                        >

                            View My Offers

                            <i className="bi bi-arrow-right"></i>

                        </Link>

                    </section>
                )}


                {selectedOnboarding && (

                    <>


                        {/* =====================================
                            MULTIPLE ONBOARDINGS
                        ===================================== */}

                        {onboardings.length > 1 && (

                            <section className="candidate-onboarding-switcher">

                                <div className="candidate-onboarding-switcher-heading">

                                    <div>

                                        <span>
                                            Your accepted positions
                                        </span>

                                        <h3>
                                            Onboarding Records
                                        </h3>

                                    </div>

                                    <strong>
                                        {onboardings.length}
                                    </strong>

                                </div>


                                <div className="candidate-onboarding-switcher-list">

                                    {onboardings.map(
                                        (
                                            onboarding
                                        ) => (

                                            <button
                                                type="button"
                                                key={
                                                    onboarding.id
                                                }
                                                className={
                                                    `candidate-onboarding-switch-card ${
                                                        selectedOnboarding.id ===
                                                        onboarding.id
                                                            ? "active"
                                                            : ""
                                                    }`
                                                }
                                                onClick={
                                                    () =>
                                                        setSelectedId(
                                                            onboarding.id
                                                        )
                                                }
                                            >

                                                <div className="candidate-onboarding-switch-icon">

                                                    <i className="bi bi-briefcase-fill"></i>

                                                </div>


                                                <div>

                                                    <strong>
                                                        {onboarding.jobTitle ||
                                                            "Job"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {formatStatus(
                                                            onboarding.status
                                                        )}
                                                    </span>

                                                </div>

                                            </button>
                                        )
                                    )}

                                </div>

                            </section>
                        )}


                        {/* =====================================
                            HERO
                        ===================================== */}

                        <section className="candidate-onboarding-hero">

                            <div className="candidate-onboarding-hero-accent"></div>


                            <div className="candidate-onboarding-hero-main">

                                <div className="candidate-onboarding-hero-icon">

                                    <i className="bi bi-building-check"></i>

                                </div>


                                <div className="candidate-onboarding-hero-content">

                                    <span>
                                        Your New Position
                                    </span>

                                    <h2>
                                        {selectedOnboarding.jobTitle ||
                                            "Your New Role"
                                        }
                                    </h2>

                                    <p>

                                        Congratulations{" "}

                                        <strong>
                                            {selectedOnboarding.candidateName ||
                                                ""
                                            }
                                        </strong>

                                        . Track all your joining information
                                        from this page.

                                    </p>

                                </div>

                            </div>


                            <div className="candidate-onboarding-hero-right">

                                <span
                                    className={`candidate-onboarding-status ${getStatusClass(
                                        selectedOnboarding.status
                                    )}`}
                                >

                                    {formatStatus(
                                        selectedOnboarding.status
                                    )}

                                </span>


                                <div className="candidate-onboarding-offer-salary">

                                    <small>
                                        Offered Compensation
                                    </small>

                                    <strong>
                                        {formatMoney(
                                            selectedOnboarding.offeredSalary,
                                            selectedOnboarding.currency
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </section>


                        {/* =====================================
                            JOINED SUCCESS
                        ===================================== */}

                        {selectedOnboarding.status ===
                            "JOINED" && (

                            <section className="candidate-onboarding-success">

                                <div>

                                    <i className="bi bi-patch-check-fill"></i>

                                </div>


                                <div>

                                    <span>
                                        Onboarding Completed
                                    </span>

                                    <h3>
                                        Welcome to your new role!
                                    </h3>

                                    <p>
                                        Your onboarding has been marked
                                        complete by the recruiter.
                                    </p>

                                    {selectedOnboarding.joinedAt && (

                                        <small>
                                            Joined on{" "}
                                            {formatDateTime(
                                                selectedOnboarding.joinedAt
                                            )}
                                        </small>
                                    )}

                                </div>

                            </section>
                        )}


                        {/* =====================================
                            NO SHOW
                        ===================================== */}

                        {selectedOnboarding.status ===
                            "NO_SHOW" && (

                            <section className="candidate-onboarding-no-show">

                                <i className="bi bi-exclamation-triangle-fill"></i>

                                <div>

                                    <strong>
                                        Onboarding marked as No Show
                                    </strong>

                                    <p>
                                        Contact the recruiter or HR
                                        representative if you believe this
                                        status needs to be reviewed.
                                    </p>

                                </div>

                            </section>
                        )}


                        {/* =====================================
                            WORKFLOW
                        ===================================== */}

                        {selectedOnboarding.status !==
                            "NO_SHOW" && (

                            <section className="candidate-onboarding-section">

                                <div className="candidate-onboarding-section-header">

                                    <div>

                                        <span>
                                            Progress
                                        </span>

                                        <h3>
                                            Your Joining Journey
                                        </h3>

                                        <p>
                                            Follow your onboarding progress
                                            from accepted offer to joining.
                                        </p>

                                    </div>

                                </div>


                                <div className="candidate-onboarding-progress">

                                    {workflowSteps.map(
                                        (
                                            step,
                                            index
                                        ) => {

                                            const completed =
                                                index <
                                                currentStep;

                                            const active =
                                                index ===
                                                currentStep;

                                            return (

                                                <div
                                                    className={
                                                        `candidate-onboarding-progress-step ${
                                                            completed
                                                                ? "completed"
                                                                : ""
                                                        } ${
                                                            active
                                                                ? "active"
                                                                : ""
                                                        }`
                                                    }
                                                    key={
                                                        step.status
                                                    }
                                                >

                                                    <div className="candidate-onboarding-progress-top">

                                                        <div className="candidate-onboarding-step-circle">

                                                            <i
                                                                className={
                                                                    completed
                                                                        ? "bi bi-check-lg"
                                                                        : `bi ${step.icon}`
                                                                }
                                                            ></i>

                                                        </div>


                                                        {index <
                                                        workflowSteps.length -
                                                            1 && (

                                                            <div className="candidate-onboarding-progress-line"></div>
                                                        )}

                                                    </div>


                                                    <div className="candidate-onboarding-step-info">

                                                        <small>
                                                            Step{" "}
                                                            {index + 1}
                                                        </small>

                                                        <strong>
                                                            {step.title}
                                                        </strong>

                                                        <p>
                                                            {step.description}
                                                        </p>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            </section>
                        )}


                        {/* =====================================
                            DETAILS
                        ===================================== */}

                        <div className="row g-4">


                            {/* LEFT */}

                            <div className="col-xl-8">


                                {/* JOINING DETAILS */}

                                <section className="candidate-onboarding-section">

                                    <div className="candidate-onboarding-section-header">

                                        <div>

                                            <span>
                                                Important Information
                                            </span>

                                            <h3>
                                                Joining Details
                                            </h3>

                                            <p>
                                                Details provided by your recruiter.
                                            </p>

                                        </div>


                                        <div className="candidate-onboarding-section-icon">

                                            <i className="bi bi-calendar2-check"></i>

                                        </div>

                                    </div>


                                    <div className="candidate-onboarding-detail-grid">


                                        <OnboardingDetail
                                            icon="bi-calendar-event"
                                            label="Joining Date"
                                            value={
                                                formatDate(
                                                    selectedOnboarding.joiningDate
                                                )
                                            }
                                        />


                                        <OnboardingDetail
                                            icon="bi-clock"
                                            label="Reporting Time"
                                            value={
                                                formatTime(
                                                    selectedOnboarding.reportingTime
                                                )
                                            }
                                        />


                                        <OnboardingDetail
                                            icon="bi-geo-alt"
                                            label="Reporting Location"
                                            value={
                                                selectedOnboarding.reportingLocation ||
                                                "To be confirmed"
                                            }
                                            full
                                        />


                                        <OnboardingDetail
                                            icon="bi-cash-stack"
                                            label="Compensation"
                                            value={
                                                formatMoney(
                                                    selectedOnboarding.offeredSalary,
                                                    selectedOnboarding.currency
                                                )
                                            }
                                        />


                                        <OnboardingDetail
                                            icon="bi-person-workspace"
                                            label="Recruiter"
                                            value={
                                                selectedOnboarding.recruiterName ||
                                                "Recruitment Team"
                                            }
                                        />

                                    </div>

                                </section>


                                {/* DOCUMENTS */}

                                <section className="candidate-onboarding-section">

                                    <div className="candidate-onboarding-section-header">

                                        <div>

                                            <span>
                                                Preparation
                                            </span>

                                            <h3>
                                                Documents Required
                                            </h3>

                                            <p>
                                                Keep these documents ready for
                                                your joining process.
                                            </p>

                                        </div>


                                        <div className="candidate-onboarding-section-icon document-icon">

                                            <i className="bi bi-file-earmark-text"></i>

                                        </div>

                                    </div>


                                    {requiredDocuments.length >
                                    0 ? (

                                        <div className="candidate-document-list">

                                            {requiredDocuments.map(
                                                (
                                                    document,
                                                    index
                                                ) => (

                                                    <div
                                                        className="candidate-document-item"
                                                        key={`${document}-${index}`}
                                                    >

                                                        <div>

                                                            <i className="bi bi-file-earmark-check"></i>

                                                        </div>


                                                        <span>
                                                            {document}
                                                        </span>

                                                    </div>
                                                )
                                            )}

                                        </div>

                                    ) : (

                                        <div className="candidate-onboarding-not-provided">

                                            <i className="bi bi-info-circle"></i>

                                            <span>
                                                Your recruiter has not provided
                                                a document checklist yet.
                                            </span>

                                        </div>
                                    )}

                                </section>


                                {/* INSTRUCTIONS */}

                                <section className="candidate-onboarding-section">

                                    <div className="candidate-onboarding-section-header">

                                        <div>

                                            <span>
                                                Before You Join
                                            </span>

                                            <h3>
                                                Joining Instructions
                                            </h3>

                                        </div>


                                        <div className="candidate-onboarding-section-icon instruction-icon">

                                            <i className="bi bi-list-check"></i>

                                        </div>

                                    </div>


                                    {selectedOnboarding.instructions ? (

                                        <div className="candidate-onboarding-instructions">

                                            <i className="bi bi-quote"></i>

                                            <p>
                                                {selectedOnboarding.instructions}
                                            </p>

                                        </div>

                                    ) : (

                                        <div className="candidate-onboarding-not-provided">

                                            <i className="bi bi-info-circle"></i>

                                            <span>
                                                No additional joining instructions
                                                have been provided yet.
                                            </span>

                                        </div>
                                    )}

                                </section>

                            </div>


                            {/* RIGHT */}

                            <div className="col-xl-4">


                                {/* HR CONTACT */}

                                <section className="candidate-onboarding-side-card">

                                    <div className="candidate-onboarding-side-icon">

                                        <i className="bi bi-headset"></i>

                                    </div>


                                    <span className="candidate-onboarding-side-eyebrow">
                                        Need Help?
                                    </span>

                                    <h3>
                                        HR Contact
                                    </h3>

                                    <p>
                                        Contact your HR representative for
                                        questions about joining.
                                    </p>


                                    <div className="candidate-hr-contact-list">


                                        <div>

                                            <i className="bi bi-person"></i>

                                            <span>

                                                <small>
                                                    Contact Person
                                                </small>

                                                <strong>
                                                    {selectedOnboarding.hrContactName ||
                                                        "To be confirmed"
                                                    }
                                                </strong>

                                            </span>

                                        </div>


                                        <div>

                                            <i className="bi bi-envelope"></i>

                                            <span>

                                                <small>
                                                    Email
                                                </small>

                                                {selectedOnboarding.hrContactEmail ? (

                                                    <a
                                                        href={`mailto:${selectedOnboarding.hrContactEmail}`}
                                                    >
                                                        {selectedOnboarding.hrContactEmail}
                                                    </a>

                                                ) : (

                                                    <strong>
                                                        To be confirmed
                                                    </strong>
                                                )}

                                            </span>

                                        </div>


                                        <div>

                                            <i className="bi bi-telephone"></i>

                                            <span>

                                                <small>
                                                    Phone
                                                </small>

                                                {selectedOnboarding.hrContactPhone ? (

                                                    <a
                                                        href={`tel:${selectedOnboarding.hrContactPhone}`}
                                                    >
                                                        {selectedOnboarding.hrContactPhone}
                                                    </a>

                                                ) : (

                                                    <strong>
                                                        To be confirmed
                                                    </strong>
                                                )}

                                            </span>

                                        </div>

                                    </div>

                                </section>


                                {/* SUMMARY */}

                                <section className="candidate-onboarding-side-card candidate-onboarding-summary-card">

                                    <span className="candidate-onboarding-side-eyebrow">
                                        At A Glance
                                    </span>

                                    <h3>
                                        Onboarding Summary
                                    </h3>


                                    <div className="candidate-onboarding-summary-list">


                                        <div>

                                            <span>
                                                Position
                                            </span>

                                            <strong>
                                                {selectedOnboarding.jobTitle ||
                                                    "—"
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Joining
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    selectedOnboarding.joiningDate
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Current Status
                                            </span>

                                            <strong>
                                                {formatStatus(
                                                    selectedOnboarding.status
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Offer Status
                                            </span>

                                            <strong>
                                                {formatStatus(
                                                    selectedOnboarding.offerStatus
                                                )}
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Last Updated
                                            </span>

                                            <strong>
                                                {formatDateTime(
                                                    selectedOnboarding.updatedAt
                                                )}
                                            </strong>

                                        </div>

                                    </div>


                                    <Link
                                        to="/candidate/offers"
                                        className="candidate-onboarding-view-offer"
                                    >

                                        View Accepted Offer

                                        <i className="bi bi-arrow-right"></i>

                                    </Link>

                                </section>

                            </div>

                        </div>

                    </>
                )}

            </div>

        </div>
    );
}


// =====================================================
// DETAIL COMPONENT
// =====================================================

function OnboardingDetail({
    icon,
    label,
    value,
    full = false
}) {

    return (

        <div
            className={
                `candidate-onboarding-detail-item ${
                    full
                        ? "full"
                        : ""
                }`
            }
        >

            <div className="candidate-onboarding-detail-icon">

                <i
                    className={`bi ${icon}`}
                ></i>

            </div>


            <div>

                <small>
                    {label}
                </small>

                <strong>
                    {value}
                </strong>

            </div>

        </div>
    );
}


export default CandidateOnboarding;