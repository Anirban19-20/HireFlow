import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import axiosInstance
    from "../../api/axiosInstance";

import "./RecruiterOnboarding.css";


function RecruiterOnboarding() {

    const [
        onboardings,
        setOnboardings
    ] = useState([]);

    const [
        selectedOnboarding,
        setSelectedOnboarding
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        saving,
        setSaving
    ] = useState(false);

    const [
        statusUpdating,
        setStatusUpdating
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        success,
        setSuccess
    ] = useState("");

    const [
        search,
        setSearch
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter
    ] = useState("ALL");

    const [
        formData,
        setFormData
    ] = useState({
        joiningDate: "",
        reportingTime: "",
        reportingLocation: "",
        hrContactName: "",
        hrContactEmail: "",
        hrContactPhone: "",
        instructions: "",
        documentsRequired: ""
    });


    // =====================================================
    // LOAD ONBOARDINGS
    // =====================================================

    const loadOnboardings =
        useCallback(
            async () => {

                setLoading(true);
                setError("");

                try {

                    const response =
                        await axiosInstance.get(
                            "/api/recruiter/onboarding"
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

                } catch (
                    requestError
                ) {

                    console.error(
                        "Unable to load onboarding records:",
                        requestError
                    );

                    setError(
                        requestError
                            .response
                            ?.data
                            ?.message ||
                        "Unable to load onboarding records."
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

            loadOnboardings();

        },
        [
            loadOnboardings
        ]
    );


    // =====================================================
    // FILTERED RECORDS
    // =====================================================

    const filteredOnboardings =
        useMemo(
            () => {

                const normalizedSearch =
                    search
                        .trim()
                        .toLowerCase();

                return onboardings
                    .filter(
                        (
                            onboarding
                        ) => {

                            const matchesStatus =
                                statusFilter ===
                                    "ALL" ||
                                onboarding.status ===
                                    statusFilter;

                            const matchesSearch =
                                normalizedSearch ===
                                    "" ||
                                onboarding
                                    .candidateName
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    ) ||
                                onboarding
                                    .candidateEmail
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    ) ||
                                onboarding
                                    .jobTitle
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    );

                            return (
                                matchesStatus &&
                                matchesSearch
                            );
                        }
                    )
                    .sort(
                        (
                            first,
                            second
                        ) => {

                            const firstDate =
                                first.joiningDate
                                    ? new Date(
                                        first.joiningDate
                                    )
                                    : new Date(
                                        "2999-12-31"
                                    );

                            const secondDate =
                                second.joiningDate
                                    ? new Date(
                                        second.joiningDate
                                    )
                                    : new Date(
                                        "2999-12-31"
                                    );

                            return (
                                firstDate -
                                secondDate
                            );
                        }
                    );
            },
            [
                onboardings,
                search,
                statusFilter
            ]
        );


    // =====================================================
    // COUNTS
    // =====================================================

    const joiningPendingCount =
        onboardings.filter(
            (
                item
            ) =>
                item.status ===
                "JOINING_PENDING"
        ).length;


    const documentsPendingCount =
        onboardings.filter(
            (
                item
            ) =>
                item.status ===
                "DOCUMENTS_PENDING"
        ).length;


    const readyCount =
        onboardings.filter(
            (
                item
            ) =>
                item.status ===
                "READY_TO_JOIN"
        ).length;


    const joinedCount =
        onboardings.filter(
            (
                item
            ) =>
                item.status ===
                "JOINED"
        ).length;


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

                case "JOINING_PENDING":

                    return "onboarding-status-joining";

                case "DOCUMENTS_PENDING":

                    return "onboarding-status-documents";

                case "READY_TO_JOIN":

                    return "onboarding-status-ready";

                case "JOINED":

                    return "onboarding-status-joined";

                case "NO_SHOW":

                    return "onboarding-status-no-show";

                default:

                    return "";
            }
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

                return "Not confirmed";
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
            value,
            currency = "INR"
        ) => {

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return "Not specified";
            }

            const amount =
                Number(
                    value
                );

            if (
                Number.isNaN(
                    amount
                )
            ) {

                return `${currency} ${value}`;
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
                        amount
                    );

            } catch (
                ignored
            ) {

                return `${currency} ${amount}`;
            }
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

                return "Not confirmed";
            }

            return value
                .substring(
                    0,
                    5
                );
        };


    // =====================================================
    // OPEN MANAGE PANEL
    // =====================================================

    const openOnboarding =
        (
            onboarding
        ) => {

            setError("");
            setSuccess("");

            setSelectedOnboarding(
                onboarding
            );

            setFormData({
                joiningDate:
                    onboarding.joiningDate ||
                    "",

                reportingTime:
                    onboarding.reportingTime
                        ? onboarding.reportingTime
                            .substring(
                                0,
                                5
                            )
                        : "",

                reportingLocation:
                    onboarding.reportingLocation ||
                    "",

                hrContactName:
                    onboarding.hrContactName ||
                    "",

                hrContactEmail:
                    onboarding.hrContactEmail ||
                    "",

                hrContactPhone:
                    onboarding.hrContactPhone ||
                    "",

                instructions:
                    onboarding.instructions ||
                    "",

                documentsRequired:
                    onboarding.documentsRequired ||
                    ""
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        };


    // =====================================================
    // CLOSE MANAGE PANEL
    // =====================================================

    const closeOnboarding =
        () => {

            setSelectedOnboarding(
                null
            );

            setSuccess("");
            setError("");
        };


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    const handleChange =
        (
            event
        ) => {

            const {
                name,
                value
            } =
                event.target;

            setFormData(
                (
                    previous
                ) => ({
                    ...previous,
                    [name]:
                        value
                })
            );
        };


    // =====================================================
    // UPDATE LOCAL RECORD
    // =====================================================

    const updateLocalRecord =
        (
            updated
        ) => {

            setOnboardings(
                (
                    previous
                ) =>
                    previous.map(
                        (
                            item
                        ) =>
                            item.id ===
                            updated.id
                                ? updated
                                : item
                    )
            );

            setSelectedOnboarding(
                updated
            );
        };


    // =====================================================
    // SAVE JOINING DETAILS
    // =====================================================

    const saveOnboarding =
        async (
            event
        ) => {

            event.preventDefault();

            if (
                !selectedOnboarding
            ) {

                return;
            }

            setSaving(true);
            setError("");
            setSuccess("");

            try {

                const payload = {

                    joiningDate:
                        formData.joiningDate ||
                        null,

                    reportingTime:
                        formData.reportingTime
                            ? `${formData.reportingTime}:00`
                            : null,

                    reportingLocation:
                        formData.reportingLocation
                            .trim() ||
                        null,

                    hrContactName:
                        formData.hrContactName
                            .trim() ||
                        null,

                    hrContactEmail:
                        formData.hrContactEmail
                            .trim() ||
                        null,

                    hrContactPhone:
                        formData.hrContactPhone
                            .trim() ||
                        null,

                    instructions:
                        formData.instructions
                            .trim() ||
                        null,

                    documentsRequired:
                        formData.documentsRequired
                            .trim() ||
                        null
                };


                const response =
                    await axiosInstance.put(
                        `/api/recruiter/onboarding/${selectedOnboarding.id}`,
                        payload
                    );


                updateLocalRecord(
                    response.data
                );

                setSuccess(
                    "Onboarding details updated successfully."
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Unable to update onboarding:",
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
                    "Unable to update onboarding details."
                );

            } finally {

                setSaving(
                    false
                );
            }
        };


    // =====================================================
    // CHANGE STATUS
    // =====================================================

    const changeStatus =
        async (
            status
        ) => {

            if (
                !selectedOnboarding ||
                !status
            ) {

                return;
            }


            const confirmed =
                window.confirm(
                    `Change onboarding status to "${formatStatus(status)}"?`
                );

            if (
                !confirmed
            ) {

                return;
            }


            setStatusUpdating(true);
            setError("");
            setSuccess("");

            try {

                const response =
                    await axiosInstance.patch(
                        `/api/recruiter/onboarding/${selectedOnboarding.id}/status`,
                        {
                            status
                        }
                    );


                updateLocalRecord(
                    response.data
                );

                setSuccess(
                    `Onboarding moved to ${formatStatus(status)}.`
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Unable to update onboarding status:",
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
                    "Unable to update onboarding status."
                );

            } finally {

                setStatusUpdating(
                    false
                );
            }
        };


    // =====================================================
    // VALID NEXT STATUS OPTIONS
    // =====================================================

    const getNextStatuses =
        (
            status
        ) => {

            switch (
                status
            ) {

                case "JOINING_PENDING":

                    return [
                        {
                            value:
                                "DOCUMENTS_PENDING",
                            label:
                                "Documents Pending"
                        },
                        {
                            value:
                                "READY_TO_JOIN",
                            label:
                                "Ready To Join"
                        },
                        {
                            value:
                                "NO_SHOW",
                            label:
                                "Mark No Show"
                        }
                    ];

                case "DOCUMENTS_PENDING":

                    return [
                        {
                            value:
                                "READY_TO_JOIN",
                            label:
                                "Ready To Join"
                        },
                        {
                            value:
                                "NO_SHOW",
                            label:
                                "Mark No Show"
                        }
                    ];

                case "READY_TO_JOIN":

                    return [
                        {
                            value:
                                "JOINED",
                            label:
                                "Mark Joined"
                        },
                        {
                            value:
                                "NO_SHOW",
                            label:
                                "Mark No Show"
                        }
                    ];

                default:

                    return [];
            }
        };


    // =====================================================
    // TERMINAL STATUS
    // =====================================================

    const isCompleted =
        selectedOnboarding?.status ===
            "JOINED" ||
        selectedOnboarding?.status ===
            "NO_SHOW";


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading
    ) {

        return (

            <div className="recruiter-onboarding-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <p>
                    Loading onboarding records...
                </p>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="recruiter-onboarding-page">

            <div className="container-fluid px-lg-5">


                {/* =========================================
                    HEADER
                ========================================= */}

                <section className="recruiter-onboarding-header">

                    <div>

                        <span className="onboarding-eyebrow">
                            Post-offer workflow
                        </span>

                        <h1>
                            Candidate Onboarding
                        </h1>

                        <p>
                            Manage joining details, documents and
                            onboarding progress for candidates who
                            accepted your offers.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="onboarding-refresh-button"
                        onClick={
                            loadOnboardings
                        }
                    >

                        <i className="bi bi-arrow-clockwise"></i>

                        Refresh

                    </button>

                </section>


                {/* =========================================
                    MESSAGES
                ========================================= */}

                {error && (

                    <div className="alert alert-danger onboarding-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {typeof error === "string"
                            ? error
                            : "Something went wrong."
                        }

                    </div>
                )}


                {success && (

                    <div className="alert alert-success onboarding-alert">

                        <i className="bi bi-check-circle-fill me-2"></i>

                        {success}

                    </div>
                )}


                {/* =========================================
                    STATS
                ========================================= */}

                <section className="onboarding-stat-grid">

                    <div className="onboarding-stat-card">

                        <div className="onboarding-stat-icon stat-blue">

                            <i className="bi bi-person-workspace"></i>

                        </div>

                        <div>

                            <span>
                                Total Hires
                            </span>

                            <strong>
                                {onboardings.length}
                            </strong>

                            <small>
                                Accepted offers
                            </small>

                        </div>

                    </div>


                    <div className="onboarding-stat-card">

                        <div className="onboarding-stat-icon stat-orange">

                            <i className="bi bi-clock-history"></i>

                        </div>

                        <div>

                            <span>
                                Joining Pending
                            </span>

                            <strong>
                                {joiningPendingCount}
                            </strong>

                            <small>
                                Waiting to progress
                            </small>

                        </div>

                    </div>


                    <div className="onboarding-stat-card">

                        <div className="onboarding-stat-icon stat-purple">

                            <i className="bi bi-file-earmark-text"></i>

                        </div>

                        <div>

                            <span>
                                Documents Pending
                            </span>

                            <strong>
                                {documentsPendingCount}
                            </strong>

                            <small>
                                Documents required
                            </small>

                        </div>

                    </div>


                    <div className="onboarding-stat-card">

                        <div className="onboarding-stat-icon stat-green">

                            <i className="bi bi-person-check-fill"></i>

                        </div>

                        <div>

                            <span>
                                Ready / Joined
                            </span>

                            <strong>
                                {readyCount + joinedCount}
                            </strong>

                            <small>
                                Final onboarding stage
                            </small>

                        </div>

                    </div>

                </section>


                {/* =========================================
                    EDIT / MANAGE PANEL
                ========================================= */}

                {selectedOnboarding && (

                    <section className="onboarding-manage-card">


                        <div className="onboarding-manage-header">

                            <div>

                                <span>
                                    Manage Candidate
                                </span>

                                <h3>
                                    {selectedOnboarding.candidateName ||
                                        "Candidate"
                                    }
                                </h3>

                                <p>
                                    {selectedOnboarding.jobTitle ||
                                        "Job"
                                    }
                                </p>

                            </div>


                            <div className="onboarding-manage-header-right">

                                <span
                                    className={`onboarding-status-badge ${getStatusClass(
                                        selectedOnboarding.status
                                    )}`}
                                >

                                    {formatStatus(
                                        selectedOnboarding.status
                                    )}

                                </span>


                                <button
                                    type="button"
                                    className="onboarding-close-button"
                                    onClick={
                                        closeOnboarding
                                    }
                                >

                                    <i className="bi bi-x-lg"></i>

                                </button>

                            </div>

                        </div>


                        <div className="onboarding-manage-summary">

                            <div>

                                <small>
                                    Candidate
                                </small>

                                <strong>
                                    {selectedOnboarding.candidateEmail ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Joining Date
                                </small>

                                <strong>
                                    {formatDate(
                                        selectedOnboarding.joiningDate
                                    )}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Compensation
                                </small>

                                <strong>
                                    {formatMoney(
                                        selectedOnboarding.offeredSalary,
                                        selectedOnboarding.currency
                                    )}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    Reporting Time
                                </small>

                                <strong>
                                    {formatTime(
                                        selectedOnboarding.reportingTime
                                    )}
                                </strong>

                            </div>

                        </div>


                        {isCompleted && (

                            <div className="onboarding-completed-message">

                                <i className="bi bi-lock-fill"></i>

                                <div>

                                    <strong>
                                        Onboarding completed
                                    </strong>

                                    <span>
                                        Completed onboarding records
                                        can no longer be edited.
                                    </span>

                                </div>

                            </div>
                        )}


                        <form
                            onSubmit={
                                saveOnboarding
                            }
                        >

                            <div className="onboarding-form-grid">


                                <div className="onboarding-form-group">

                                    <label>
                                        Joining Date
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        name="joiningDate"
                                        value={
                                            formData.joiningDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            isCompleted
                                        }
                                    />

                                </div>


                                <div className="onboarding-form-group">

                                    <label>
                                        Reporting Time
                                    </label>

                                    <input
                                        type="time"
                                        className="form-control"
                                        name="reportingTime"
                                        value={
                                            formData.reportingTime
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            isCompleted
                                        }
                                    />

                                </div>


                                <div className="onboarding-form-group onboarding-full-field">

                                    <label>
                                        Reporting Location
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="reportingLocation"
                                        placeholder="Example: Kolkata Office - 5th Floor"
                                        value={
                                            formData.reportingLocation
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            isCompleted
                                        }
                                    />

                                </div>


                                <div className="onboarding-form-group">

                                    <label>
                                        HR Contact Name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="hrContactName"
                                        placeholder="HR Manager"
                                        value={
                                            formData.hrContactName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            isCompleted
                                        }
                                    />

                                </div>


                                <div className="onboarding-form-group">

                                    <label>
                                        HR Contact Email
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        name="hrContactEmail"
                                        placeholder="hr@company.com"
                                        value={
                                            formData.hrContactEmail
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            isCompleted
                                        }
                                    />

                                </div>


                                <div className="onboarding-form-group onboarding-full-field">

                                    <label>
                                        HR Contact Phone
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="hrContactPhone"
                                        placeholder="+91 9876543210"
                                        value={
                                            formData.hrContactPhone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            isCompleted
                                        }
                                    />

                                </div>


                                <div className="onboarding-form-group onboarding-full-field">

                                    <label>
                                        Documents Required
                                    </label>

                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        name="documentsRequired"
                                        placeholder="Aadhaar, PAN, degree certificates, bank details..."
                                        value={
                                            formData.documentsRequired
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            isCompleted
                                        }
                                    ></textarea>

                                </div>


                                <div className="onboarding-form-group onboarding-full-field">

                                    <label>
                                        Joining Instructions
                                    </label>

                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        name="instructions"
                                        placeholder="Add instructions for the candidate..."
                                        value={
                                            formData.instructions
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            isCompleted
                                        }
                                    ></textarea>

                                </div>

                            </div>


                            {!isCompleted && (

                                <div className="onboarding-form-actions">

                                    <button
                                        type="submit"
                                        className="onboarding-save-button"
                                        disabled={
                                            saving
                                        }
                                    >

                                        {saving ? (

                                            <>
                                                <span className="spinner-border spinner-border-sm"></span>
                                                Saving...
                                            </>

                                        ) : (

                                            <>
                                                <i className="bi bi-floppy"></i>
                                                Save Details
                                            </>
                                        )}

                                    </button>

                                </div>
                            )}

                        </form>


                        {!isCompleted &&
                        getNextStatuses(
                            selectedOnboarding.status
                        ).length > 0 && (

                            <div className="onboarding-status-actions">

                                <div>

                                    <span>
                                        Progress Onboarding
                                    </span>

                                    <p>
                                        Move the candidate to the
                                        appropriate next stage.
                                    </p>

                                </div>


                                <div className="onboarding-status-buttons">

                                    {getNextStatuses(
                                        selectedOnboarding.status
                                    ).map(
                                        (
                                            option
                                        ) => (

                                            <button
                                                key={
                                                    option.value
                                                }
                                                type="button"
                                                className={
                                                    option.value ===
                                                        "NO_SHOW"
                                                        ? "onboarding-no-show-button"
                                                        : "onboarding-progress-button"
                                                }
                                                disabled={
                                                    statusUpdating
                                                }
                                                onClick={
                                                    () =>
                                                        changeStatus(
                                                            option.value
                                                        )
                                                }
                                            >

                                                {statusUpdating
                                                    ? "Updating..."
                                                    : option.label
                                                }

                                            </button>
                                        )
                                    )}

                                </div>

                            </div>
                        )}

                    </section>
                )}


                {/* =========================================
                    FILTERS
                ========================================= */}

                <section className="onboarding-list-card">

                    <div className="onboarding-list-header">

                        <div>

                            <span>
                                Hiring Pipeline
                            </span>

                            <h3>
                                Accepted Candidates
                            </h3>

                            <p>
                                Manage post-offer onboarding records.
                            </p>

                        </div>


                        <div className="onboarding-filters">

                            <div className="onboarding-search">

                                <i className="bi bi-search"></i>

                                <input
                                    type="text"
                                    placeholder="Search candidate or job..."
                                    value={
                                        search
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setSearch(
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

                                <option value="JOINING_PENDING">
                                    Joining Pending
                                </option>

                                <option value="DOCUMENTS_PENDING">
                                    Documents Pending
                                </option>

                                <option value="READY_TO_JOIN">
                                    Ready To Join
                                </option>

                                <option value="JOINED">
                                    Joined
                                </option>

                                <option value="NO_SHOW">
                                    No Show
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* =====================================
                        EMPTY
                    ===================================== */}

                    {filteredOnboardings.length ===
                    0 ? (

                        <div className="onboarding-empty-state">

                            <div>

                                <i className="bi bi-person-check"></i>

                            </div>

                            <h4>
                                No onboarding records found
                            </h4>

                            <p>
                                Accepted job offers will appear
                                here automatically.
                            </p>

                        </div>

                    ) : (

                        <div className="onboarding-candidate-grid">

                            {filteredOnboardings.map(
                                (
                                    onboarding
                                ) => (

                                    <article
                                        className="onboarding-candidate-card"
                                        key={
                                            onboarding.id
                                        }
                                    >

                                        <div className="onboarding-candidate-card-top">

                                            <div className="onboarding-candidate-avatar">

                                                {(onboarding.candidateName ||
                                                    "C"
                                                )
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()
                                                }

                                            </div>


                                            <div className="onboarding-candidate-primary">

                                                <span>
                                                    Candidate
                                                </span>

                                                <h4>
                                                    {onboarding.candidateName ||
                                                        "Candidate"
                                                    }
                                                </h4>

                                                <p>
                                                    {onboarding.candidateEmail ||
                                                        "Email unavailable"
                                                    }
                                                </p>

                                            </div>


                                            <span
                                                className={`onboarding-status-badge ${getStatusClass(
                                                    onboarding.status
                                                )}`}
                                            >

                                                {formatStatus(
                                                    onboarding.status
                                                )}

                                            </span>

                                        </div>


                                        <div className="onboarding-job-info">

                                            <i className="bi bi-briefcase-fill"></i>

                                            <div>

                                                <small>
                                                    Position
                                                </small>

                                                <strong>
                                                    {onboarding.jobTitle ||
                                                        "Job"
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="onboarding-candidate-details">

                                            <div>

                                                <small>
                                                    Joining Date
                                                </small>

                                                <strong>
                                                    {formatDate(
                                                        onboarding.joiningDate
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <small>
                                                    Salary
                                                </small>

                                                <strong>
                                                    {formatMoney(
                                                        onboarding.offeredSalary,
                                                        onboarding.currency
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="onboarding-candidate-extra">

                                            <span>

                                                <i className="bi bi-clock"></i>

                                                {formatTime(
                                                    onboarding.reportingTime
                                                )}

                                            </span>


                                            <span>

                                                <i className="bi bi-geo-alt"></i>

                                                {onboarding.reportingLocation ||
                                                    "Location pending"
                                                }

                                            </span>

                                        </div>


                                        <button
                                            type="button"
                                            className="onboarding-manage-button"
                                            onClick={
                                                () =>
                                                    openOnboarding(
                                                        onboarding
                                                    )
                                            }
                                        >

                                            {onboarding.status ===
                                                "JOINED" ||
                                            onboarding.status ===
                                                "NO_SHOW"
                                                ? "View Details"
                                                : "Manage Onboarding"
                                            }

                                            <i className="bi bi-arrow-right"></i>

                                        </button>

                                    </article>
                                )
                            )}

                        </div>
                    )}

                </section>

            </div>

        </div>
    );
}


export default RecruiterOnboarding;