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

import "./Offers.css";


const FILTERS = [
    {
        value: "ALL",
        label: "All Offers"
    },
    {
        value: "SENT",
        label: "Pending"
    },
    {
        value: "ACCEPTED",
        label: "Accepted"
    },
    {
        value: "REJECTED",
        label: "Rejected"
    },
    {
        value: "EXPIRED",
        label: "Expired"
    },
    {
        value: "WITHDRAWN",
        label: "Withdrawn"
    }
];


// =====================================================
// BACKEND ERROR
// =====================================================

const getBackendErrorMessage = (
    error,
    fallback
) => {

    const data =
        error?.response?.data;

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
        !error?.response
    ) {
        return (
            error?.message ||
            "Unable to connect to the server."
        );
    }

    return fallback;
};


// =====================================================
// FORMAT STATUS
// =====================================================

const formatStatus = (
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
                letter.toUpperCase()
        );
};


// =====================================================
// FORMAT MONEY
// =====================================================

const formatMoney = (
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

        return `${currency || "INR"} ${numericAmount.toLocaleString("en-IN")}`;
    }
};


// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (
    value
) => {

    if (
        !value
    ) {
        return "Not specified";
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
        return "Not specified";
    }

    return date.toLocaleDateString(
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
// FORMAT DATE TIME
// =====================================================

const formatDateTime = (
    value
) => {

    if (
        !value
    ) {
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
        return "Not available";
    }

    return date.toLocaleString(
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
// STATUS CLASS
// =====================================================

const getStatusClass = (
    status
) => {

    switch (
        status
    ) {

        case "SENT":
            return "candidate-offer-status-sent";

        case "ACCEPTED":
            return "candidate-offer-status-accepted";

        case "REJECTED":
            return "candidate-offer-status-rejected";

        case "EXPIRED":
            return "candidate-offer-status-expired";

        case "WITHDRAWN":
            return "candidate-offer-status-withdrawn";

        default:
            return "candidate-offer-status-default";
    }
};


// =====================================================
// STATUS ICON
// =====================================================

const getStatusIcon = (
    status
) => {

    switch (
        status
    ) {

        case "SENT":
            return "bi-envelope-paper";

        case "ACCEPTED":
            return "bi-patch-check-fill";

        case "REJECTED":
            return "bi-x-circle-fill";

        case "EXPIRED":
            return "bi-clock-history";

        case "WITHDRAWN":
            return "bi-envelope-x";

        default:
            return "bi-envelope";
    }
};


function Offers() {

    const [
        offers,
        setOffers
    ] = useState([]);

    const [
        filter,
        setFilter
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
        actionId,
        setActionId
    ] = useState(null);

    const [
        letterId,
        setLetterId
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
    // LOAD OFFERS
    // =====================================================

    const loadOffers =
        useCallback(
            async (
                manualRefresh = false
            ) => {

                if (
                    manualRefresh
                ) {
                    setRefreshing(
                        true
                    );
                } else {
                    setLoading(
                        true
                    );
                }

                setError(
                    ""
                );

                try {

                    const response =
                        await axiosInstance.get(
                            "/api/candidate/offers"
                        );

                    setOffers(
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
                        "Candidate offers loading error:",
                        requestError
                    );

                    setOffers(
                        []
                    );

                    setError(
                        getBackendErrorMessage(
                            requestError,
                            "Unable to load your job offers."
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
            []
        );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(
        () => {

            loadOffers();

        },
        [
            loadOffers
        ]
    );


    // =====================================================
    // COUNTS
    // =====================================================

    const counts =
        useMemo(
            () => {

                const result = {
                    total:
                        offers.length,
                    pending:
                        0,
                    accepted:
                        0,
                    closed:
                        0
                };

                offers.forEach(
                    (
                        offer
                    ) => {

                        if (
                            offer?.status ===
                            "SENT"
                        ) {
                            result.pending++;
                        }

                        if (
                            offer?.status ===
                            "ACCEPTED"
                        ) {
                            result.accepted++;
                        }

                        if (
                            [
                                "REJECTED",
                                "EXPIRED",
                                "WITHDRAWN"
                            ].includes(
                                offer?.status
                            )
                        ) {
                            result.closed++;
                        }
                    }
                );

                return result;
            },
            [
                offers
            ]
        );


    // =====================================================
    // FILTERED OFFERS
    // =====================================================

    const filteredOffers =
        useMemo(
            () => {

                if (
                    filter ===
                    "ALL"
                ) {
                    return offers;
                }

                return offers.filter(
                    (
                        offer
                    ) =>
                        offer?.status ===
                        filter
                );
            },
            [
                offers,
                filter
            ]
        );


    // =====================================================
    // UPDATE ONE OFFER
    // =====================================================

    const updateOffer =
        (
            updatedOffer
        ) => {

            if (
                !updatedOffer?.id
            ) {
                return;
            }

            setOffers(
                (
                    previous
                ) =>
                    previous.map(
                        (
                            offer
                        ) =>
                            String(
                                offer.id
                            ) ===
                            String(
                                updatedOffer.id
                            )
                                ? updatedOffer
                                : offer
                    )
            );
        };


    // =====================================================
    // ACCEPT / REJECT
    // =====================================================

    const respondToOffer =
        async (
            offer,
            action
        ) => {

            if (
                !offer?.id ||
                offer.status !==
                "SENT"
            ) {
                return;
            }

            const actionLabel =
                action ===
                "accept"
                    ? "accept"
                    : "reject";

            const confirmed =
                window.confirm(
                    `Are you sure you want to ${actionLabel} the offer for ${offer.jobTitle || "this position"}?`
                );

            if (
                !confirmed
            ) {
                return;
            }

            setActionId(
                offer.id
            );

            setError(
                ""
            );

            setSuccess(
                ""
            );

            try {

                const response =
                    await axiosInstance.patch(
                        `/api/candidate/offers/${offer.id}/${action}`
                    );

                updateOffer(
                    response.data
                );

                setSuccess(
                    action ===
                    "accept"
                        ? `Offer accepted successfully. Hiring is confirmed for ${offer.jobTitle || "this position"}. Your onboarding portal is now available.`
                        : `You rejected the offer for ${offer.jobTitle || "this position"}.`
                );

            } catch (
                requestError
            ) {

                console.error(
                    `Offer ${action} error:`,
                    requestError
                );

                setError(
                    getBackendErrorMessage(
                        requestError,
                        `Unable to ${actionLabel} this offer.`
                    )
                );

            } finally {

                setActionId(
                    null
                );
            }
        };


    // =====================================================
    // DOWNLOAD OFFER LETTER PDF
    // =====================================================

    const downloadOfferLetter =
        async (
            offer
        ) => {

            if (
                !offer?.id
            ) {
                return;
            }

            setLetterId(
                offer.id
            );

            setError(
                ""
            );

            try {

                const response =
                    await axiosInstance.get(
                        `/api/candidate/offers/${offer.id}/letter`,
                        {
                            responseType:
                                "blob"
                        }
                    );

                const contentType =
                    response.headers?.[
                        "content-type"
                    ] ||
                    "application/pdf";

                const pdfBlob =
                    new Blob(
                        [
                            response.data
                        ],
                        {
                            type:
                                contentType
                        }
                    );

                const objectUrl =
                    URL.createObjectURL(
                        pdfBlob
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href =
                    objectUrl;

                link.download =
                    `HireFlow-Offer-Letter-${offer.id}.pdf`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                window.setTimeout(
                    () =>
                        URL.revokeObjectURL(
                            objectUrl
                        ),
                    1000
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Offer letter download error:",
                    requestError
                );

                let message =
                    "Unable to download the offer letter.";

                const blobData =
                    requestError?.response?.data;

                if (
                    blobData instanceof
                    Blob
                ) {

                    try {

                        const errorText =
                            await blobData.text();

                        if (
                            errorText
                        ) {

                            try {

                                const parsed =
                                    JSON.parse(
                                        errorText
                                    );

                                message =
                                    parsed?.message ||
                                    parsed?.error ||
                                    message;

                            } catch (
                                ignored
                            ) {

                                if (
                                    errorText.trim()
                                ) {
                                    message =
                                        errorText.trim();
                                }
                            }
                        }

                    } catch (
                        ignored
                    ) {
                        // Keep fallback.
                    }

                } else {

                    message =
                        getBackendErrorMessage(
                            requestError,
                            message
                        );
                }

                setError(
                    message
                );

            } finally {

                setLetterId(
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

            <div className="candidate-offers-loading">

                <div className="spinner-border text-primary"></div>

                <p>
                    Loading your job offers...
                </p>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="candidate-offers-page">

            <div className="container-fluid px-lg-5">


                {/* =========================================
                    HEADER
                ========================================= */}

                <section className="candidate-offers-header">

                    <div>

                        <span className="candidate-offers-eyebrow">
                            Career Opportunities
                        </span>

                        <h1>
                            My Job Offers
                        </h1>

                        <p>
                            Review offer details, download your
                            official offer letter and respond to
                            active offers.
                        </p>

                    </div>

                    <div className="candidate-offers-header-actions">

                        <button
                            type="button"
                            className="candidate-offers-refresh"
                            disabled={
                                refreshing
                            }
                            onClick={
                                () =>
                                    loadOffers(
                                        true
                                    )
                            }
                        >

                            <i
                                className={
                                    `bi bi-arrow-clockwise ${
                                        refreshing
                                            ? "candidate-offers-spin"
                                            : ""
                                    }`
                                }
                            ></i>

                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"
                            }

                        </button>

                        <Link
                            to="/candidate/jobs"
                            className="candidate-offers-browse"
                        >

                            <i className="bi bi-search"></i>

                            Browse Jobs

                        </Link>

                    </div>

                </section>


                {/* =========================================
                    ALERTS
                ========================================= */}

                {error && (

                    <div className="alert alert-danger candidate-offers-alert">

                        <i className="bi bi-exclamation-circle-fill"></i>

                        <span>
                            {error}
                        </span>

                    </div>
                )}

                {success && (

                    <div className="alert alert-success candidate-offers-alert">

                        <i className="bi bi-check-circle-fill"></i>

                        <span>
                            {success}
                        </span>

                    </div>
                )}


                {/* =========================================
                    STATS
                ========================================= */}

                <section className="candidate-offers-stats">

                    <OfferStatCard
                        icon="bi-envelope-paper"
                        label="Total Offers"
                        value={
                            counts.total
                        }
                        helper="All received offers"
                        className="offer-stat-blue"
                    />

                    <OfferStatCard
                        icon="bi-hourglass-split"
                        label="Pending"
                        value={
                            counts.pending
                        }
                        helper="Awaiting your response"
                        className="offer-stat-orange"
                    />

                    <OfferStatCard
                        icon="bi-patch-check"
                        label="Accepted"
                        value={
                            counts.accepted
                        }
                        helper="Offers you accepted"
                        className="offer-stat-green"
                    />

                    <OfferStatCard
                        icon="bi-archive"
                        label="Closed"
                        value={
                            counts.closed
                        }
                        helper="Rejected, expired or withdrawn"
                        className="offer-stat-slate"
                    />

                </section>


                {/* =========================================
                    FILTERS
                ========================================= */}

                <section className="candidate-offers-toolbar">

                    <div>

                        <i className="bi bi-funnel"></i>

                        <span>
                            Filter offers
                        </span>

                    </div>

                    <div className="candidate-offers-filter-list">

                        {FILTERS.map(
                            (
                                item
                            ) => (

                            <button
                                key={
                                    item.value
                                }
                                type="button"
                                className={
                                    filter ===
                                    item.value
                                        ? "active"
                                        : ""
                                }
                                onClick={
                                    () =>
                                        setFilter(
                                            item.value
                                        )
                                }
                            >

                                {item.label}

                                {item.value ===
                                    "SENT" &&
                                    counts.pending > 0 && (

                                    <span>
                                        {counts.pending}
                                    </span>
                                )}

                            </button>
                        ))}

                    </div>

                </section>


                {/* =========================================
                    CONTENT
                ========================================= */}

                {filteredOffers.length ===
                    0 ? (

                    <section className="candidate-offers-empty">

                        <div>

                            <i className="bi bi-envelope-open"></i>

                        </div>

                        <h3>
                            {offers.length ===
                            0
                                ? "No job offers yet"
                                : "No offers in this category"
                            }
                        </h3>

                        <p>
                            {offers.length ===
                            0
                                ? "When a recruiter sends you a job offer, it will appear here."
                                : "Choose another filter to view your other offers."
                            }
                        </p>

                        {offers.length ===
                            0 && (

                            <Link
                                to="/candidate/jobs"
                                className="candidate-offers-empty-button"
                            >
                                Browse Open Jobs
                            </Link>
                        )}

                    </section>

                ) : (

                    <section className="candidate-offers-grid">

                        {filteredOffers.map(
                            (
                                offer
                            ) => (

                            <OfferCard
                                key={
                                    offer.id
                                }
                                offer={
                                    offer
                                }
                                actionBusy={
                                    String(
                                        actionId
                                    ) ===
                                    String(
                                        offer.id
                                    )
                                }
                                letterBusy={
                                    String(
                                        letterId
                                    ) ===
                                    String(
                                        offer.id
                                    )
                                }
                                onAccept={
                                    () =>
                                        respondToOffer(
                                            offer,
                                            "accept"
                                        )
                                }
                                onReject={
                                    () =>
                                        respondToOffer(
                                            offer,
                                            "reject"
                                        )
                                }
                                onDownloadLetter={
                                    () =>
                                        downloadOfferLetter(
                                            offer
                                        )
                                }
                            />
                        ))}

                    </section>
                )}

            </div>

        </div>
    );
}


// =====================================================
// STAT CARD
// =====================================================

function OfferStatCard({
    icon,
    label,
    value,
    helper,
    className
}) {

    return (

        <div className="candidate-offers-stat-card">

            <div
                className={
                    `candidate-offers-stat-icon ${className}`
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

                <strong>
                    {value}
                </strong>

                <small>
                    {helper}
                </small>

            </div>

        </div>
    );
}


// =====================================================
// OFFER CARD
// =====================================================

function OfferCard({
    offer,
    actionBusy,
    letterBusy,
    onAccept,
    onReject,
    onDownloadLetter
}) {

    const active =
        offer?.status ===
        "SENT";

    const accepted =
        offer?.status ===
        "ACCEPTED";

    return (

        <article
            className={
                `candidate-offer-card ${
                    active
                        ? "candidate-offer-card-active"
                        : ""
                } ${
                    accepted
                        ? "candidate-offer-card-accepted"
                        : ""
                }`
            }
        >

            <div className="candidate-offer-card-top">

                <div className="candidate-offer-company-mark">

                    {(offer?.jobTitle ||
                        "J")
                        .charAt(
                            0
                        )
                        .toUpperCase()}

                </div>

                <div className="candidate-offer-heading">

                    <span>
                        Job Offer
                    </span>

                    <h3>
                        {offer?.jobTitle ||
                            "Offered Position"
                        }
                    </h3>

                    <small>
                        Offer #{offer?.id}
                    </small>

                </div>

                <span
                    className={
                        `candidate-offer-status ${getStatusClass(
                            offer?.status
                        )}`
                    }
                >

                    <i
                        className={
                            `bi ${getStatusIcon(
                                offer?.status
                            )}`
                        }
                    ></i>

                    {formatStatus(
                        offer?.status
                    )}

                </span>

            </div>


            {accepted && (

                <div className="candidate-offer-hire-confirmed">

                    <div className="candidate-offer-hire-confirmed-icon">
                        <i className="bi bi-patch-check-fill"></i>
                    </div>

                    <div className="candidate-offer-hire-confirmed-copy">

                        <span>
                            Hiring Confirmed
                        </span>

                        <strong>
                            Congratulations — you accepted this offer.
                        </strong>

                        <p>
                            Your joining date is{" "}
                            <b>
                                {formatDate(
                                    offer?.joiningDate
                                )}
                            </b>
                            . Keep your offer letter available for onboarding.
                        </p>

                    </div>

                    <div className="candidate-offer-hire-confirmed-actions">

                        <div className="candidate-offer-hire-confirmed-date">

                            <small>
                                Joining Date
                            </small>

                            <strong>
                                {formatDate(
                                    offer?.joiningDate
                                )}
                            </strong>

                        </div>

                        <Link
                            to="/candidate/onboarding"
                            className="candidate-offer-onboarding-link"
                        >
                            <i className="bi bi-person-workspace"></i>
                            View Onboarding
                        </Link>

                    </div>

                </div>
            )}


            <div className="candidate-offer-compensation">

                <span>
                    Annual Compensation
                </span>

                <strong>
                    {formatMoney(
                        offer?.offeredSalary,
                        offer?.currency
                    )}
                </strong>

            </div>


            <div className="candidate-offer-detail-grid">

                <OfferDetail
                    icon="bi-calendar-check"
                    label="Joining Date"
                    value={
                        formatDate(
                            offer?.joiningDate
                        )
                    }
                />

                <OfferDetail
                    icon="bi-clock"
                    label="Offer Expires"
                    value={
                        formatDateTime(
                            offer?.expiresAt
                        )
                    }
                />

                <OfferDetail
                    icon="bi-send-check"
                    label="Sent"
                    value={
                        formatDateTime(
                            offer?.sentAt
                        )
                    }
                />

                <OfferDetail
                    icon="bi-chat-square-text"
                    label="Response"
                    value={
                        offer?.respondedAt
                            ? formatDateTime(
                                offer.respondedAt
                            )
                            : active
                                ? "Awaiting your response"
                                : "No response recorded"
                    }
                />

            </div>


            {offer?.message && (

                <div className="candidate-offer-message">

                    <div>

                        <i className="bi bi-quote"></i>

                    </div>

                    <p>
                        {offer.message}
                    </p>

                </div>
            )}


            <div className="candidate-offer-letter-panel">

                <div>

                    <div className="candidate-offer-letter-icon">

                        <i className="bi bi-file-earmark-pdf"></i>

                    </div>

                    <div>

                        <strong>
                            Official Offer Letter
                        </strong>

                        <span>
                            Download the PDF generated from this offer.
                        </span>

                    </div>

                </div>

                <button
                    type="button"
                    disabled={
                        letterBusy ||
                        actionBusy
                    }
                    onClick={
                        onDownloadLetter
                    }
                >

                    {letterBusy ? (

                        <>
                            <span className="spinner-border spinner-border-sm"></span>
                            Preparing...
                        </>

                    ) : (

                        <>
                            <i className="bi bi-download"></i>
                            Download Offer Letter
                        </>
                    )}

                </button>

            </div>


            {active && (

                <div className="candidate-offer-response-box">

                    <div>

                        <strong>
                            Your response is required
                        </strong>

                        <span>
                            Review the full offer and offer letter before deciding.
                        </span>

                    </div>

                    <div>

                        <button
                            type="button"
                            className="candidate-offer-reject-button"
                            disabled={
                                actionBusy ||
                                letterBusy
                            }
                            onClick={
                                onReject
                            }
                        >

                            <i className="bi bi-x-lg"></i>

                            Reject

                        </button>

                        <button
                            type="button"
                            className="candidate-offer-accept-button"
                            disabled={
                                actionBusy ||
                                letterBusy
                            }
                            onClick={
                                onAccept
                            }
                        >

                            {actionBusy ? (

                                <>
                                    <span className="spinner-border spinner-border-sm"></span>
                                    Processing...
                                </>

                            ) : (

                                <>
                                    <i className="bi bi-check-lg"></i>
                                    Accept Offer
                                </>
                            )}

                        </button>

                    </div>

                </div>
            )}

        </article>
    );
}


// =====================================================
// DETAIL
// =====================================================

function OfferDetail({
    icon,
    label,
    value
}) {

    return (

        <div className="candidate-offer-detail">

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


export default Offers;
