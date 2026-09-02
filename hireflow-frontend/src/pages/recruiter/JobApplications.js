import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";

import "./JobApplications.css";


// =====================================================
// STATUS OPTIONS
// =====================================================

const FILTER_STATUS_OPTIONS = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED",
    "REJECTED",
    "WITHDRAWN"
];


// =====================================================
// APPLICATION WORKFLOW
// =====================================================

const STATUS_TRANSITIONS = {

    APPLIED: [
        "UNDER_REVIEW",
        "REJECTED"
    ],

    UNDER_REVIEW: [
        "SHORTLISTED",
        "REJECTED"
    ],

    SHORTLISTED: [
        "INTERVIEW",
        "REJECTED"
    ],

    INTERVIEW: [
        "SELECTED",
        "REJECTED"
    ],

    SELECTED: [],
    REJECTED: [],
    WITHDRAWN: []
};


// =====================================================
// INTERVIEW FORM
// =====================================================

const EMPTY_INTERVIEW_FORM = {
    roundName: "",
    scheduledAt: "",
    mode: "ONLINE",
    meetingLink: "",
    location: "",
    notes: ""
};


// =====================================================
// EVALUATION FORM
// =====================================================

const EMPTY_EVALUATION_FORM = {
    technicalSkills: 0,
    communication: 0,
    relevantExperience: 0,
    cultureFit: 0,
    interviewPerformance: 0,
    privateNotes: ""
};


// =====================================================
// JOB OFFER FORM
// =====================================================

const EMPTY_OFFER_FORM = {
    offeredSalary: "",
    currency: "INR",
    joiningDate: "",
    expiresAt: "",
    message: ""
};


// =====================================================
// ERROR HELPER
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
        typeof data?.message === "string" &&
        data.message.trim()
    ) {
        return data.message.trim();
    }

    if (
        typeof data?.details === "string" &&
        data.details.trim()
    ) {
        return data.details.trim();
    }

    if (
        typeof data?.error === "string" &&
        data.error.trim() &&
        data.error.toLowerCase() !==
        "bad request"
    ) {
        return data.error.trim();
    }

    if (
        Array.isArray(
            data?.errors
        )
    ) {

        const messages =
            data.errors
                .map(
                    (item) =>
                        item?.defaultMessage ||
                        item?.message ||
                        item?.error
                )
                .filter(Boolean);

        if (
            messages.length
        ) {
            return messages.join(", ");
        }
    }

    if (
        data?.fieldErrors &&
        typeof data.fieldErrors ===
        "object"
    ) {

        const messages =
            Object.entries(
                data.fieldErrors
            )
                .map(
                    ([field, message]) =>
                        `${field}: ${message}`
                )
                .filter(Boolean);

        if (
            messages.length
        ) {
            return messages.join(", ");
        }
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
// APPLICATION HELPERS
// =====================================================

const getApplicationId = (
    application
) =>
    application?.applicationId ??
    application?.id ??
    null;


const getCandidateId = (
    application
) =>
    application?.candidateId ??
    application?.candidate?.id ??
    null;


const getCandidateName = (
    application
) =>
    application?.candidateName ||
    application?.candidate?.name ||
    application?.name ||
    "Candidate";


const getCandidateEmail = (
    application
) =>
    application?.candidateEmail ||
    application?.candidate?.email ||
    application?.email ||
    "Email not available";


const getCandidatePhone = (
    application
) =>
    application?.candidatePhone ||
    application?.candidate?.phone ||
    application?.phone ||
    "";


const getCandidateLocation = (
    application
) =>
    application?.candidateLocation ||
    application?.candidate?.location ||
    "";


const getCandidateSkills = (
    application
) =>
    application?.candidateSkills ||
    application?.candidate?.skills ||
    "";


const getCandidateExperience = (
    application
) =>
    application?.candidateExperience ??
    application?.candidate?.experience ??
    null;


const getCandidateEducation = (
    application
) =>
    application?.candidateEducation ||
    application?.candidate?.education ||
    "";


const getResumeUrl = (
    application
) =>
    application?.resumeUrl ||
    application?.resumeURL ||
    "";


const getCoverLetter = (
    application
) =>
    application?.coverLetter ||
    "";


const getJobTitle = (
    application,
    jobId
) =>
    application?.jobTitle ||
    application?.job?.title ||
    application?.title ||
    `Job #${jobId}`;


// =====================================================
// SKILLS
// =====================================================

const getSkillList = (
    application
) => {

    const skills =
        getCandidateSkills(
            application
        );

    if (
        !skills
    ) {
        return [];
    }

    if (
        Array.isArray(
            skills
        )
    ) {

        return skills
            .map(
                (skill) =>
                    String(
                        skill
                    ).trim()
            )
            .filter(Boolean);
    }

    return String(
        skills
    )
        .split(
            /[,;|]/
        )
        .map(
            (skill) =>
                skill.trim()
        )
        .filter(Boolean);
};


// =====================================================
// FORMATTING
// =====================================================

const formatStatus = (
    value
) => {

    if (
        !value
    ) {
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
                character.toUpperCase()
        );
};


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
        return String(
            value
        );
    }

    return date.toLocaleString(
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


const toDateTimeLocalValue = (
    value
) => {

    if (
        !value
    ) {
        return "";
    }

    const stringValue =
        String(
            value
        );

    return stringValue.length >=
        16
        ? stringValue.substring(
            0,
            16
        )
        : stringValue;
};


const normalizeScheduledAt = (
    value
) => {

    if (
        !value
    ) {
        return null;
    }

    const normalized =
        String(
            value
        ).trim();

    return normalized.length ===
        16
        ? `${normalized}:00`
        : normalized;
};


const getMinimumInterviewDateTime =
    () => {

        const date =
            new Date(
                Date.now() +
                5 *
                60 *
                1000
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
// STATUS CLASSES
// =====================================================

const getStatusClass = (
    status
) => {

    switch (
        status
    ) {

        case "APPLIED":
            return "recruiter-status-applied";

        case "UNDER_REVIEW":
            return "recruiter-status-review";

        case "SHORTLISTED":
            return "recruiter-status-shortlisted";

        case "INTERVIEW":
            return "recruiter-status-interview";

        case "SELECTED":
            return "recruiter-status-selected";

        case "REJECTED":
            return "recruiter-status-rejected";

        case "WITHDRAWN":
            return "recruiter-status-withdrawn";

        default:
            return "recruiter-status-default";
    }
};


const getInterviewStatusClass = (
    status
) => {

    switch (
        status
    ) {

        case "SCHEDULED":
            return "recruiter-interview-status-scheduled";

        case "COMPLETED":
            return "recruiter-interview-status-completed";

        case "CANCELLED":
            return "recruiter-interview-status-cancelled";

        default:
            return "recruiter-interview-status-default";
    }
};


const getInterviewRoundLabel = (
    interview
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

    if (
        interview?.roundNumber !==
        null &&
        interview?.roundNumber !==
        undefined
    ) {

        return (
            `Interview Round ${interview.roundNumber}`
        );
    }

    return "Interview";
};


// =====================================================
// EXPERIENCE FILTER
// =====================================================

const matchesExperienceRange = (
    application,
    experienceFilter
) => {

    if (
        experienceFilter ===
        "ALL"
    ) {
        return true;
    }

    const rawExperience =
        getCandidateExperience(
            application
        );

    if (
        experienceFilter ===
        "NOT_SPECIFIED"
    ) {

        return (
            rawExperience === null ||
            rawExperience === undefined ||
            rawExperience === ""
        );
    }

    const experience =
        Number(
            rawExperience
        );

    if (
        !Number.isFinite(
            experience
        )
    ) {
        return false;
    }

    switch (
        experienceFilter
    ) {

        case "FRESHER":
            return experience === 0;

        case "ONE_TWO":
            return (
                experience >= 1 &&
                experience <= 2
            );

        case "THREE_FIVE":
            return (
                experience >= 3 &&
                experience <= 5
            );

        case "SIX_PLUS":
            return experience >= 6;

        default:
            return true;
    }
};


// =====================================================
// EVALUATION HELPERS
// =====================================================

const getEvaluationScore = (
    evaluation
) => {

    const score =
        Number(
            evaluation?.overallScore
        );

    return Number.isFinite(
        score
    )
        ? score
        : null;
};


const formatEvaluationScore = (
    evaluation
) => {

    const score =
        getEvaluationScore(
            evaluation
        );

    return score ===
        null
        ? "Not evaluated"
        : `${score.toFixed(1)} / 5`;
};


// =====================================================
// JOB OFFER HELPERS
// =====================================================

const formatDateOnly = (
    value
) => {

    if (
        !value
    ) {
        return "Not available";
    }

    const raw =
        String(
            value
        );

    const match =
        raw.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

    const date =
        match
            ? new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            )
            : new Date(
                value
            );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return raw;
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


const formatMoney = (
    amount,
    currency = "INR"
) => {

    const value =
        Number(
            amount
        );

    if (
        !Number.isFinite(
            value
        )
    ) {
        return `${currency || "INR"} ${amount || 0}`;
    }

    try {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency:
                    currency ||
                    "INR",
                maximumFractionDigits: 0
            }
        ).format(
            value
        );

    } catch {

        return `${currency || "INR"} ${value.toLocaleString("en-IN")}`;
    }
};


const getOfferStatusClass = (
    status
) => {

    switch (
        status
    ) {

        case "DRAFT":
            return "recruiter-offer-status-draft";

        case "SENT":
            return "recruiter-offer-status-sent";

        case "ACCEPTED":
            return "recruiter-offer-status-accepted";

        case "REJECTED":
            return "recruiter-offer-status-rejected";

        case "EXPIRED":
            return "recruiter-offer-status-expired";

        case "WITHDRAWN":
            return "recruiter-offer-status-withdrawn";

        default:
            return "recruiter-offer-status-default";
    }
};


// =====================================================
// MAIN COMPONENT
// =====================================================

function JobApplications() {

    const {
        jobId
    } = useParams();


    // =====================================================
    // MAIN DATA
    // =====================================================

    const [
        applications,
        setApplications
    ] = useState([]);

    const [
        interviews,
        setInterviews
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        interviewsLoading,
        setInterviewsLoading
    ] = useState(true);

    const [
        updatingId,
        setUpdatingId
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
    // FILTERS
    // =====================================================

    const [
        searchText,
        setSearchText
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter
    ] = useState("ALL");

    const [
        skillFilter,
        setSkillFilter
    ] = useState("");

    const [
        locationFilter,
        setLocationFilter
    ] = useState("ALL");

    const [
        educationFilter,
        setEducationFilter
    ] = useState("ALL");

    const [
        experienceFilter,
        setExperienceFilter
    ] = useState("ALL");

    const [
        sortOption,
        setSortOption
    ] = useState("NEWEST");


    // =====================================================
    // OFFER LETTER PDF
    // =====================================================

    const handleOfferLetter =
        async (
            offer,
            mode = "download"
        ) => {

            if (
                !offer?.id
            ) {

                setError(
                    "Save the job offer before generating an offer letter."
                );

                return;
            }

            let previewWindow =
                null;

            if (
                mode ===
                "preview"
            ) {

                previewWindow =
                    window.open(
                        "",
                        "_blank"
                    );

                if (
                    previewWindow
                ) {

                    previewWindow.document.title =
                        "Loading Offer Letter";

                    previewWindow.document.body.innerHTML =
                        "<p style='font-family:Arial,sans-serif;padding:24px'>Loading offer letter...</p>";
                }
            }

            setOfferLetterId(
                offer.id
            );

            setError(
                ""
            );

            try {

                const response =
                    await axiosInstance.get(
                        `/api/recruiter/offers/${offer.id}/letter`,
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

                if (
                    mode ===
                    "preview"
                ) {

                    if (
                        previewWindow
                    ) {

                        previewWindow.location.href =
                            objectUrl;

                    } else {

                        window.open(
                            objectUrl,
                            "_blank",
                            "noopener,noreferrer"
                        );
                    }

                    window.setTimeout(
                        () =>
                            URL.revokeObjectURL(
                                objectUrl
                            ),
                        60000
                    );

                } else {

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
                }

            } catch (
                requestError
            ) {

                if (
                    previewWindow &&
                    !previewWindow.closed
                ) {

                    previewWindow.close();
                }

                let message =
                    "Unable to generate offer letter.";

                const blobData =
                    requestError?.response?.data;

                if (
                    blobData instanceof Blob
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

                        // Keep fallback message.
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

                setOfferLetterId(
                    null
                );
            }
        };


    // =====================================================
    // COMPARISON
    // =====================================================

    const [
        selectedCandidateIds,
        setSelectedCandidateIds
    ] = useState([]);

    const [
        compareModalOpen,
        setCompareModalOpen
    ] = useState(false);


    // =====================================================
    // EVALUATIONS
    // =====================================================

    const [
        evaluations,
        setEvaluations
    ] = useState({});

    const [
        evaluationsLoading,
        setEvaluationsLoading
    ] = useState(false);

    const [
        evaluationApplication,
        setEvaluationApplication
    ] = useState(null);

    const [
        evaluationForm,
        setEvaluationForm
    ] = useState({
        ...EMPTY_EVALUATION_FORM
    });

    const [
        evaluationLoading,
        setEvaluationLoading
    ] = useState(false);

    const [
        evaluationSubmitting,
        setEvaluationSubmitting
    ] = useState(false);

    const [
        evaluationDeleting,
        setEvaluationDeleting
    ] = useState(false);


    // =====================================================
    // JOB OFFERS
    // =====================================================

    const [
        offers,
        setOffers
    ] = useState({});

    const [
        offersLoading,
        setOffersLoading
    ] = useState(false);

    const [
        offerApplication,
        setOfferApplication
    ] = useState(null);

    const [
        offerForm,
        setOfferForm
    ] = useState({
        ...EMPTY_OFFER_FORM
    });

    const [
        offerLoading,
        setOfferLoading
    ] = useState(false);

    const [
        offerSubmitting,
        setOfferSubmitting
    ] = useState(false);

    const [
        offerActionId,
        setOfferActionId
    ] = useState(null);

    const [
        offerLetterId,
        setOfferLetterId
    ] = useState(null);


    // =====================================================
    // HISTORY
    // =====================================================

    const [
        selectedApplication,
        setSelectedApplication
    ] = useState(null);

    const [
        history,
        setHistory
    ] = useState([]);

    const [
        historyLoading,
        setHistoryLoading
    ] = useState(false);


    // =====================================================
    // CANDIDATE DETAILS
    // =====================================================

    const [
        candidateDetailsApplication,
        setCandidateDetailsApplication
    ] = useState(null);

    const [
        candidateDetailsHistory,
        setCandidateDetailsHistory
    ] = useState([]);

    const [
        candidateDetailsLoading,
        setCandidateDetailsLoading
    ] = useState(false);

    const [
        candidateDetailsError,
        setCandidateDetailsError
    ] = useState("");


    // =====================================================
    // INTERVIEW MODAL
    // =====================================================

    const [
        interviewModalApplication,
        setInterviewModalApplication
    ] = useState(null);

    const [
        editingInterview,
        setEditingInterview
    ] = useState(null);

    const [
        interviewForm,
        setInterviewForm
    ] = useState({
        ...EMPTY_INTERVIEW_FORM
    });

    const [
        interviewSubmitting,
        setInterviewSubmitting
    ] = useState(false);

    const [
        interviewActionId,
        setInterviewActionId
    ] = useState(null);


    // =====================================================
    // BODY SCROLL
    // =====================================================

    useEffect(
        () => {

            const modalOpen =
                Boolean(
                    selectedApplication ||
                    candidateDetailsApplication ||
                    interviewModalApplication ||
                    compareModalOpen ||
                    evaluationApplication ||
                    offerApplication
                );

            if (
                !modalOpen
            ) {
                return undefined;
            }

            const previousOverflow =
                document.body.style.overflow;

            document.body.style.overflow =
                "hidden";

            return () => {
                document.body.style.overflow =
                    previousOverflow;
            };
        },
        [
            selectedApplication,
            candidateDetailsApplication,
            interviewModalApplication,
            compareModalOpen,
            evaluationApplication,
            offerApplication
        ]
    );


    // =====================================================
    // LOAD APPLICATIONS
    // =====================================================

    const loadApplications =
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
                            `/api/recruiter/jobs/${jobId}/applications`
                        );

                    setApplications(
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
                        "Recruiter applications error:",
                        requestError
                    );

                    setApplications(
                        []
                    );

                    setError(
                        getBackendErrorMessage(
                            requestError,
                            "Unable to load applications."
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
    // LOAD INTERVIEWS
    // =====================================================

    const loadInterviews =
        useCallback(
            async () => {

                setInterviewsLoading(
                    true
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
                        data.filter(
                            (interview) =>
                                String(
                                    interview?.jobId
                                ) ===
                                String(
                                    jobId
                                )
                        )
                    );

                } catch (
                    requestError
                ) {

                    console.error(
                        "Recruiter interviews error:",
                        requestError
                    );

                    setInterviews(
                        []
                    );

                    setError(
                        getBackendErrorMessage(
                            requestError,
                            "Unable to load interview information."
                        )
                    );

                } finally {

                    setInterviewsLoading(
                        false
                    );
                }
            },
            [
                jobId
            ]
        );


    // =====================================================
    // LOAD JOB OFFERS
    // =====================================================

    const loadOffers =
        useCallback(
            async () => {

                setOffersLoading(
                    true
                );

                try {

                    const response =
                        await axiosInstance.get(
                            "/api/recruiter/offers"
                        );

                    const values =
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : [];

                    const nextOffers =
                        {};

                    values.forEach(
                        (offer) => {

                            if (
                                offer?.applicationId &&
                                (
                                    !offer?.jobId ||
                                    String(
                                        offer.jobId
                                    ) ===
                                    String(
                                        jobId
                                    )
                                )
                            ) {

                                nextOffers[
                                    String(
                                        offer.applicationId
                                    )
                                ] =
                                    offer;
                            }
                        }
                    );

                    setOffers(
                        nextOffers
                    );

                } catch (
                    requestError
                ) {

                    console.error(
                        "Recruiter job offers error:",
                        requestError
                    );

                    setOffers(
                        {}
                    );

                    setError(
                        getBackendErrorMessage(
                            requestError,
                            "Unable to load job offers."
                        )
                    );

                } finally {

                    setOffersLoading(
                        false
                    );
                }
            },
            [
                jobId
            ]
        );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(
        () => {

            loadApplications();

            loadInterviews();

            loadOffers();

        },
        [
            loadApplications,
            loadInterviews,
            loadOffers
        ]
    );


    // =====================================================
    // LOAD EVALUATIONS
    // =====================================================

    useEffect(
        () => {

            let cancelled =
                false;

            const loadEvaluations =
                async () => {

                    if (
                        applications.length ===
                        0
                    ) {

                        setEvaluations(
                            {}
                        );

                        setEvaluationsLoading(
                            false
                        );

                        return;
                    }

                    setEvaluationsLoading(
                        true
                    );

                    try {

                        const results =
                            await Promise.allSettled(
                                applications.map(
                                    async (
                                        application
                                    ) => {

                                        const applicationId =
                                            getApplicationId(
                                                application
                                            );

                                        if (
                                            !applicationId
                                        ) {

                                            return null;
                                        }

                                        try {

                                            const response =
                                                await axiosInstance.get(
                                                    `/api/recruiter/evaluations/application/${applicationId}`
                                                );

                                            
                                            if (
                                                response.status ===
                                                204 ||
                                                !response.data
                                            ) {

                                                return {
                                                    applicationId,
                                                    evaluation:
                                                        null
                                                };
                                            }

                                            return {
                                                applicationId,
                                                evaluation:
                                                    response.data
                                            };

                                        } catch (
                                            requestError
                                        ) {

                                            
                                            if (
                                                requestError
                                                    ?.response
                                                    ?.status ===
                                                404
                                            ) {

                                                return {
                                                    applicationId,
                                                    evaluation:
                                                        null
                                                };
                                            }

                                            throw requestError;
                                        }
                                    }
                                )
                            );

                        if (
                            cancelled
                        ) {

                            return;
                        }

                        const nextEvaluations =
                            {};

                        results.forEach(
                            (
                                result
                            ) => {

                                if (
                                    result.status ===
                                    "fulfilled" &&
                                    result.value
                                        ?.applicationId &&
                                    result.value
                                        ?.evaluation
                                ) {

                                    nextEvaluations[
                                        String(
                                            result.value
                                                .applicationId
                                        )
                                    ] =
                                        result.value
                                            .evaluation;
                                }
                            }
                        );

                        setEvaluations(
                            nextEvaluations
                        );

                    } finally {

                        if (
                            !cancelled
                        ) {

                            setEvaluationsLoading(
                                false
                            );
                        }
                    }
                };

            loadEvaluations();

            return () => {

                cancelled =
                    true;
            };
        },
        [
            applications
        ]
    );


    // =====================================================
    // FILTER OPTIONS
    // =====================================================

    const locationOptions =
        useMemo(
            () => {

                return [
                    ...new Set(
                        applications
                            .map(
                                getCandidateLocation
                            )
                            .map(
                                (value) =>
                                    String(
                                        value ||
                                        ""
                                    ).trim()
                            )
                            .filter(Boolean)
                    )
                ].sort(
                    (
                        first,
                        second
                    ) =>
                        first.localeCompare(
                            second
                        )
                );
            },
            [
                applications
            ]
        );


    const educationOptions =
        useMemo(
            () => {

                return [
                    ...new Set(
                        applications
                            .map(
                                getCandidateEducation
                            )
                            .map(
                                (value) =>
                                    String(
                                        value ||
                                        ""
                                    ).trim()
                            )
                            .filter(Boolean)
                    )
                ].sort(
                    (
                        first,
                        second
                    ) =>
                        first.localeCompare(
                            second
                        )
                );
            },
            [
                applications
            ]
        );


    const skillOptions =
        useMemo(
            () => {

                return [
                    ...new Set(
                        applications.flatMap(
                            (
                                application
                            ) =>
                                getSkillList(
                                    application
                                )
                        )
                    )
                ].sort(
                    (
                        first,
                        second
                    ) =>
                        first.localeCompare(
                            second
                        )
                );
            },
            [
                applications
            ]
        );


    // =====================================================
    // ACTIVE FILTER COUNT
    // =====================================================

    const activeFilterCount =
        useMemo(
            () => {

                let count =
                    0;

                if (
                    searchText.trim()
                ) {
                    count++;
                }

                if (
                    statusFilter !==
                    "ALL"
                ) {
                    count++;
                }

                if (
                    skillFilter.trim()
                ) {
                    count++;
                }

                if (
                    locationFilter !==
                    "ALL"
                ) {
                    count++;
                }

                if (
                    educationFilter !==
                    "ALL"
                ) {
                    count++;
                }

                if (
                    experienceFilter !==
                    "ALL"
                ) {
                    count++;
                }

                if (
                    sortOption !==
                    "NEWEST"
                ) {
                    count++;
                }

                return count;
            },
            [
                searchText,
                statusFilter,
                skillFilter,
                locationFilter,
                educationFilter,
                experienceFilter,
                sortOption
            ]
        );


    const clearAllFilters =
        () => {

            setSearchText(
                ""
            );

            setStatusFilter(
                "ALL"
            );

            setSkillFilter(
                ""
            );

            setLocationFilter(
                "ALL"
            );

            setEducationFilter(
                "ALL"
            );

            setExperienceFilter(
                "ALL"
            );

            setSortOption(
                "NEWEST"
            );
        };


    // =====================================================
    // INTERVIEW HELPERS
    // =====================================================

    const getInterviewsForApplication =
        useCallback(
            (
                application
            ) => {

                const applicationId =
                    getApplicationId(
                        application
                    );

                if (
                    !applicationId
                ) {
                    return [];
                }

                return interviews
                    .filter(
                        (interview) =>
                            String(
                                interview?.applicationId
                            ) ===
                            String(
                                applicationId
                            )
                    )
                    .sort(
                        (
                            first,
                            second
                        ) => {

                            const firstRound =
                                Number(
                                    first?.roundNumber
                                );

                            const secondRound =
                                Number(
                                    second?.roundNumber
                                );

                            if (
                                Number.isFinite(
                                    firstRound
                                ) &&
                                Number.isFinite(
                                    secondRound
                                ) &&
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
                                ).getTime()
                                -
                                new Date(
                                    second?.scheduledAt ||
                                    0
                                ).getTime()
                            );
                        }
                    );
            },
            [
                interviews
            ]
        );


    const getActiveInterview =
        (
            application
        ) =>
            getInterviewsForApplication(
                application
            ).find(
                (interview) =>
                    interview?.status ===
                    "SCHEDULED"
            ) ||
            null;


    const getLatestInterview =
        (
            application
        ) => {

            const rounds =
                getInterviewsForApplication(
                    application
                );

            return (
                rounds[
                    rounds.length - 1
                ] ||
                null
            );
        };


    const getNextRoundNumber =
        (
            application
        ) => {

            const rounds =
                getInterviewsForApplication(
                    application
                );

            const roundNumbers =
                rounds
                    .map(
                        (interview) =>
                            Number(
                                interview?.roundNumber
                            )
                    )
                    .filter(
                        Number.isFinite
                    );

            if (
                roundNumbers.length
            ) {

                return (
                    Math.max(
                        ...roundNumbers
                    ) + 1
                );
            }

            return (
                rounds.length + 1
            );
        };


    const canScheduleNextRound =
        (
            application
        ) =>
            application?.status ===
            "INTERVIEW" &&
            !getActiveInterview(
                application
            );


    // =====================================================
    // FILTER + SORT APPLICATIONS
    // =====================================================

    const filteredApplications =
        useMemo(
            () => {

                const search =
                    searchText
                        .trim()
                        .toLowerCase();

                const skillSearch =
                    skillFilter
                        .trim()
                        .toLowerCase();

                const filtered =
                    applications.filter(
                        (
                            application
                        ) => {

                            const searchableText = [
                                getCandidateName(
                                    application
                                ),
                                getCandidateEmail(
                                    application
                                ),
                                getCandidatePhone(
                                    application
                                ),
                                getCandidateLocation(
                                    application
                                ),
                                getCandidateEducation(
                                    application
                                ),
                                getCandidateSkills(
                                    application
                                ),
                                getJobTitle(
                                    application,
                                    jobId
                                ),
                                application?.status,
                                getApplicationId(
                                    application
                                )
                            ]
                                .filter(
                                    (
                                        value
                                    ) =>
                                        value !==
                                        null &&
                                        value !==
                                        undefined
                                )
                                .join(" ")
                                .toLowerCase();

                            const matchesSearch =
                                !search ||
                                searchableText.includes(
                                    search
                                );

                            const matchesStatus =
                                statusFilter ===
                                "ALL" ||
                                application?.status ===
                                statusFilter;

                            const candidateSkills =
                                getSkillList(
                                    application
                                )
                                    .map(
                                        (skill) =>
                                            skill.toLowerCase()
                                    );

                            const matchesSkill =
                                !skillSearch ||
                                candidateSkills.some(
                                    (skill) =>
                                        skill.includes(
                                            skillSearch
                                        )
                                );

                            const matchesLocation =
                                locationFilter ===
                                "ALL" ||
                                getCandidateLocation(
                                    application
                                ) ===
                                locationFilter;

                            const matchesEducation =
                                educationFilter ===
                                "ALL" ||
                                getCandidateEducation(
                                    application
                                ) ===
                                educationFilter;

                            const matchesExperience =
                                matchesExperienceRange(
                                    application,
                                    experienceFilter
                                );

                            return (
                                matchesSearch &&
                                matchesStatus &&
                                matchesSkill &&
                                matchesLocation &&
                                matchesEducation &&
                                matchesExperience
                            );
                        }
                    );

                return [
                    ...filtered
                ].sort(
                    (
                        first,
                        second
                    ) => {

                        switch (
                            sortOption
                        ) {

                            case "OLDEST":

                                return (
                                    new Date(
                                        first?.appliedAt ||
                                        0
                                    ).getTime()
                                    -
                                    new Date(
                                        second?.appliedAt ||
                                        0
                                    ).getTime()
                                );


                            case "EXPERIENCE_HIGH":

                                return (
                                    Number(
                                        getCandidateExperience(
                                            second
                                        ) ??
                                        -1
                                    )
                                    -
                                    Number(
                                        getCandidateExperience(
                                            first
                                        ) ??
                                        -1
                                    )
                                );


                            case "EXPERIENCE_LOW":

                                return (
                                    Number(
                                        getCandidateExperience(
                                            first
                                        ) ??
                                        999
                                    )
                                    -
                                    Number(
                                        getCandidateExperience(
                                            second
                                        ) ??
                                        999
                                    )
                                );


                            case "NAME_AZ":

                                return getCandidateName(
                                    first
                                )
                                    .localeCompare(
                                        getCandidateName(
                                            second
                                        )
                                    );


                            case "SCORE_HIGH": {

                                const firstScore =
                                    getEvaluationScore(
                                        evaluations[
                                            String(
                                                getApplicationId(
                                                    first
                                                )
                                            )
                                        ]
                                    ) ??
                                    -1;

                                const secondScore =
                                    getEvaluationScore(
                                        evaluations[
                                            String(
                                                getApplicationId(
                                                    second
                                                )
                                            )
                                        ]
                                    ) ??
                                    -1;

                                return (
                                    secondScore -
                                    firstScore
                                );
                            }


                            case "NEWEST":

                                return (
                                    new Date(
                                        second?.appliedAt ||
                                        0
                                    ).getTime()
                                    -
                                    new Date(
                                        first?.appliedAt ||
                                        0
                                    ).getTime()
                                );


                            default:

                                return (
                                    new Date(
                                        second?.appliedAt ||
                                        0
                                    ).getTime()
                                    -
                                    new Date(
                                        first?.appliedAt ||
                                        0
                                    ).getTime()
                                );
                        }
                    }
                );
            },
            [
                applications,
                searchText,
                statusFilter,
                skillFilter,
                locationFilter,
                educationFilter,
                experienceFilter,
                sortOption,
                evaluations,
                jobId
            ]
        );


    // =====================================================
    // STATS
    // =====================================================

    const stats =
        useMemo(
            () => ({

                total:
                    applications.length,

                shortlisted:
                    applications.filter(
                        (application) =>
                            application?.status ===
                            "SHORTLISTED"
                    ).length,

                interview:
                    applications.filter(
                        (application) =>
                            application?.status ===
                            "INTERVIEW"
                    ).length,

                selected:
                    applications.filter(
                        (application) =>
                            application?.status ===
                            "SELECTED"
                    ).length

            }),
            [
                applications
            ]
        );


    // =====================================================
    // STATUS CHANGE
    // =====================================================

    const handleStatusChange =
        async (
            application,
            newStatus
        ) => {

            const applicationId =
                getApplicationId(
                    application
                );

            if (
                !applicationId ||
                !newStatus ||
                application?.status ===
                newStatus
            ) {
                return;
            }

            const allowedStatuses =
                STATUS_TRANSITIONS[
                    application.status
                ] ||
                [];

            if (
                !allowedStatuses.includes(
                    newStatus
                )
            ) {

                setError(
                    `Invalid transition from ${formatStatus(
                        application.status
                    )} to ${formatStatus(
                        newStatus
                    )}.`
                );

                return;
            }

            const confirmed =
                window.confirm(
                    `Move ${getCandidateName(
                        application
                    )} to ${formatStatus(
                        newStatus
                    )}?`
                );

            if (
                !confirmed
            ) {
                return;
            }

            setUpdatingId(
                applicationId
            );

            setError(
                ""
            );

            setSuccess(
                ""
            );

            try {

                await axiosInstance.put(
                    `/api/recruiter/applications/${applicationId}/status`,
                    null,
                    {
                        params: {
                            status:
                                newStatus
                        }
                    }
                );

                setApplications(
                    (
                        previous
                    ) =>
                        previous.map(
                            (
                                item
                            ) =>
                                getApplicationId(
                                    item
                                ) ===
                                applicationId
                                    ? {
                                        ...item,
                                        status:
                                            newStatus
                                    }
                                    : item
                        )
                );

                setSuccess(
                    `Application moved to ${formatStatus(
                        newStatus
                    )}.`
                );

                await loadInterviews();

            } catch (
                requestError
            ) {

                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to update application status."
                    )
                );

            } finally {

                setUpdatingId(
                    null
                );
            }
        };


    // =====================================================
    // HISTORY
    // =====================================================

    const loadApplicationHistory =
        async (
            applicationId
        ) => {

            const response =
                await axiosInstance.get(
                    `/api/applications/${applicationId}/history`
                );

            return Array.isArray(
                response.data
            )
                ? response.data
                : [];
        };


    const handleViewHistory =
        async (
            application
        ) => {

            const applicationId =
                getApplicationId(
                    application
                );

            if (
                !applicationId
            ) {

                setError(
                    "Application ID is missing."
                );

                return;
            }

            setSelectedApplication(
                application
            );

            setHistory(
                []
            );

            setHistoryLoading(
                true
            );

            setError(
                ""
            );

            try {

                const result =
                    await loadApplicationHistory(
                        applicationId
                    );

                setHistory(
                    result
                );

            } catch (
                requestError
            ) {

                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to load status history."
                    )
                );

            } finally {

                setHistoryLoading(
                    false
                );
            }
        };


    const closeHistory =
        () => {

            setSelectedApplication(
                null
            );

            setHistory(
                []
            );
        };


    // =====================================================
    // CANDIDATE DETAILS
    // =====================================================

    const openCandidateDetails =
        async (
            application
        ) => {

            const applicationId =
                getApplicationId(
                    application
                );

            if (
                !applicationId
            ) {

                setError(
                    "Application ID is missing."
                );

                return;
            }

            setCandidateDetailsApplication(
                application
            );

            setCandidateDetailsHistory(
                []
            );

            setCandidateDetailsError(
                ""
            );

            setCandidateDetailsLoading(
                true
            );

            try {

                const result =
                    await loadApplicationHistory(
                        applicationId
                    );

                setCandidateDetailsHistory(
                    result
                );

            } catch (
                requestError
            ) {

                setCandidateDetailsError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to load complete application history."
                    )
                );

            } finally {

                setCandidateDetailsLoading(
                    false
                );
            }
        };


    const closeCandidateDetails =
        () => {

            setCandidateDetailsApplication(
                null
            );

            setCandidateDetailsHistory(
                []
            );

            setCandidateDetailsError(
                ""
            );
        };


    // =====================================================
    // SCHEDULE INTERVIEW
    // =====================================================

    const openScheduleInterview =
        (
            application
        ) => {

            if (
                application?.status !==
                "INTERVIEW"
            ) {

                setError(
                    "Application must be in Interview status."
                );

                return;
            }

            const activeInterview =
                getActiveInterview(
                    application
                );

            if (
                activeInterview
            ) {

                setError(
                    `${getInterviewRoundLabel(
                        activeInterview
                    )} is still scheduled. Complete or cancel it first.`
                );

                return;
            }

            setInterviewModalApplication(
                application
            );

            setEditingInterview(
                null
            );

            setInterviewForm({
                ...EMPTY_INTERVIEW_FORM
            });

            setError(
                ""
            );

            setSuccess(
                ""
            );
        };


    const openRescheduleInterview =
        (
            application,
            interview
        ) => {

            if (
                !interview?.id ||
                interview?.status !==
                "SCHEDULED"
            ) {

                setError(
                    "Only scheduled interviews can be rescheduled."
                );

                return;
            }

            setInterviewModalApplication(
                application
            );

            setEditingInterview(
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


    const closeInterviewModal =
        () => {

            if (
                interviewSubmitting
            ) {
                return;
            }

            setInterviewModalApplication(
                null
            );

            setEditingInterview(
                null
            );

            setInterviewForm({
                ...EMPTY_INTERVIEW_FORM
            });
        };


    const handleInterviewFormChange =
        (
            event
        ) => {

            const {
                name,
                value
            } = event.target;

            setInterviewForm(
                (
                    previous
                ) => {

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


    const validateInterviewForm =
        () => {

            if (
                interviewForm
                    .roundName
                    .trim()
                    .length >
                150
            ) {

                return (
                    "Round name cannot exceed 150 characters."
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
                ) ||
                date.getTime() <=
                Date.now()
            ) {

                return (
                    "Interview date and time must be in the future."
                );
            }

            if (
                interviewForm.mode ===
                "ONLINE" &&
                !interviewForm
                    .meetingLink
                    .trim()
            ) {

                return (
                    "Meeting link is required."
                );
            }

            if (
                interviewForm.mode ===
                "OFFLINE" &&
                !interviewForm
                    .location
                    .trim()
            ) {

                return (
                    "Interview location is required."
                );
            }

            return "";
        };


    const handleInterviewSubmit =
        async (
            event
        ) => {

            event.preventDefault();

            const applicationId =
                getApplicationId(
                    interviewModalApplication
                );

            if (
                !applicationId
            ) {

                setError(
                    "Application ID is missing."
                );

                return;
            }

            const validationError =
                validateInterviewForm();

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

            setInterviewSubmitting(
                true
            );

            setError(
                ""
            );

            setSuccess(
                ""
            );

            try {

                if (
                    editingInterview?.id
                ) {

                    await axiosInstance.put(
                        `/api/recruiter/interviews/${editingInterview.id}`,
                        payload
                    );

                    setSuccess(
                        "Interview updated successfully."
                    );

                } else {

                    await axiosInstance.post(
                        `/api/recruiter/interviews/application/${applicationId}`,
                        payload
                    );

                    setSuccess(
                        "Next interview round scheduled successfully."
                    );
                }

                await loadInterviews();

                setInterviewModalApplication(
                    null
                );

                setEditingInterview(
                    null
                );

                setInterviewForm({
                    ...EMPTY_INTERVIEW_FORM
                });

            } catch (
                requestError
            ) {

                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to save interview."
                    )
                );

            } finally {

                setInterviewSubmitting(
                    false
                );
            }
        };


    const handleCancelInterview =
        async (
            application,
            interview
        ) => {

            if (
                !interview?.id
            ) {
                return;
            }

            if (
                !window.confirm(
                    `Cancel ${getInterviewRoundLabel(
                        interview
                    )} for ${getCandidateName(
                        application
                    )}?`
                )
            ) {
                return;
            }

            setInterviewActionId(
                interview.id
            );

            setError(
                ""
            );

            try {

                await axiosInstance.patch(
                    `/api/recruiter/interviews/${interview.id}/cancel`
                );

                await loadInterviews();

                setSuccess(
                    `${getInterviewRoundLabel(
                        interview
                    )} cancelled.`
                );

            } catch (
                requestError
            ) {

                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to cancel interview."
                    )
                );

            } finally {

                setInterviewActionId(
                    null
                );
            }
        };


    const handleCompleteInterview =
        async (
            application,
            interview
        ) => {

            if (
                !interview?.id
            ) {
                return;
            }

            if (
                !window.confirm(
                    `Mark ${getInterviewRoundLabel(
                        interview
                    )} for ${getCandidateName(
                        application
                    )} as completed?`
                )
            ) {
                return;
            }

            setInterviewActionId(
                interview.id
            );

            setError(
                ""
            );

            try {

                await axiosInstance.patch(
                    `/api/recruiter/interviews/${interview.id}/complete`
                );

                await loadInterviews();

                setSuccess(
                    `${getInterviewRoundLabel(
                        interview
                    )} completed.`
                );

            } catch (
                requestError
            ) {

                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to complete interview."
                    )
                );

            } finally {

                setInterviewActionId(
                    null
                );
            }
        };


    // =====================================================
    // EVALUATION
    // =====================================================

    const openCandidateEvaluation =
        async (
            application
        ) => {

            const applicationId =
                getApplicationId(
                    application
                );

            if (
                !applicationId
            ) {

                setError(
                    "Application ID is missing."
                );

                return;
            }

            setEvaluationApplication(
                application
            );

            setEvaluationLoading(
                true
            );

            setEvaluationForm({
                ...EMPTY_EVALUATION_FORM
            });

            setError(
                ""
            );

            try {

                const response =
                    await axiosInstance.get(
                        `/api/recruiter/evaluations/application/${applicationId}`
                    );

                
                if (
                    response.status ===
                    204 ||
                    !response.data
                ) {

                    setEvaluations(
                        (
                            previous
                        ) => {

                            const next = {
                                ...previous
                            };

                            delete next[
                                String(
                                    applicationId
                                )
                            ];

                            return next;
                        }
                    );

                    setEvaluationForm({
                        ...EMPTY_EVALUATION_FORM
                    });

                    return;
                }

                const evaluation =
                    response.data;

                setEvaluations(
                    (
                        previous
                    ) => ({
                        ...previous,

                        [
                            String(
                                applicationId
                            )
                        ]:
                            evaluation
                    })
                );

                setEvaluationForm({

                    technicalSkills:
                        Number(
                            evaluation
                                ?.technicalSkills
                        ) ||
                        0,

                    communication:
                        Number(
                            evaluation
                                ?.communication
                        ) ||
                        0,

                    relevantExperience:
                        Number(
                            evaluation
                                ?.relevantExperience
                        ) ||
                        0,

                    cultureFit:
                        Number(
                            evaluation
                                ?.cultureFit
                        ) ||
                        0,

                    interviewPerformance:
                        Number(
                            evaluation
                                ?.interviewPerformance
                        ) ||
                        0,

                    privateNotes:
                        evaluation
                            ?.privateNotes ||
                        ""
                });

            } catch (
                requestError
            ) {

                const message =
                    getBackendErrorMessage(
                        requestError,
                        "Unable to load candidate evaluation."
                    );

                const lowerMessage =
                    String(
                        message ||
                        ""
                    ).toLowerCase();

                
                if (
                    requestError
                        ?.response
                        ?.status ===
                    404 ||
                    lowerMessage.includes(
                        "evaluation not found"
                    )
                ) {

                    setEvaluations(
                        (
                            previous
                        ) => {

                            const next = {
                                ...previous
                            };

                            delete next[
                                String(
                                    applicationId
                                )
                            ];

                            return next;
                        }
                    );

                    setEvaluationForm({
                        ...EMPTY_EVALUATION_FORM
                    });

                } else {

                    setError(
                        message
                    );
                }

            } finally {

                setEvaluationLoading(
                    false
                );
            }
        };


    const closeCandidateEvaluation =
        () => {

            if (
                evaluationSubmitting ||
                evaluationDeleting
            ) {
                return;
            }

            setEvaluationApplication(
                null
            );

            setEvaluationForm({
                ...EMPTY_EVALUATION_FORM
            });
        };


    const handleEvaluationRatingChange =
        (
            field,
            value
        ) => {

            setEvaluationForm(
                (
                    previous
                ) => ({
                    ...previous,
                    [field]:
                        value
                })
            );
        };


    const handleEvaluationNotesChange =
        (
            event
        ) => {

            setEvaluationForm(
                (
                    previous
                ) => ({
                    ...previous,

                    privateNotes:
                        event.target.value
                })
            );
        };


    const handleEvaluationSubmit =
        async (
            event
        ) => {

            event.preventDefault();

            const applicationId =
                getApplicationId(
                    evaluationApplication
                );

            if (
                !applicationId
            ) {

                setError(
                    "Application ID is missing."
                );

                return;
            }

            const scoreFields = [
                evaluationForm.technicalSkills,
                evaluationForm.communication,
                evaluationForm.relevantExperience,
                evaluationForm.cultureFit,
                evaluationForm.interviewPerformance
            ];

            const invalid =
                scoreFields.some(
                    (
                        score
                    ) => {

                        const number =
                            Number(
                                score
                            );

                        return (
                            !Number.isFinite(
                                number
                            ) ||
                            number < 1 ||
                            number > 5
                        );
                    }
                );

            if (
                invalid
            ) {

                setError(
                    "Please rate every evaluation category from 1 to 5."
                );

                return;
            }

            const payload = {

                technicalSkills:
                    Number(
                        evaluationForm
                            .technicalSkills
                    ),

                communication:
                    Number(
                        evaluationForm
                            .communication
                    ),

                relevantExperience:
                    Number(
                        evaluationForm
                            .relevantExperience
                    ),

                cultureFit:
                    Number(
                        evaluationForm
                            .cultureFit
                    ),

                interviewPerformance:
                    Number(
                        evaluationForm
                            .interviewPerformance
                    ),

                privateNotes:
                    evaluationForm
                        .privateNotes
                        .trim() ||
                    null
            };

            setEvaluationSubmitting(
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
                        `/api/recruiter/evaluations/application/${applicationId}`,
                        payload
                    );

                setEvaluations(
                    (
                        previous
                    ) => ({
                        ...previous,

                        [
                            String(
                                applicationId
                            )
                        ]:
                            response.data
                    })
                );

                setSuccess(
                    `Evaluation saved for ${getCandidateName(
                        evaluationApplication
                    )}.`
                );

                setEvaluationApplication(
                    null
                );

                setEvaluationForm({
                    ...EMPTY_EVALUATION_FORM
                });

            } catch (
                requestError
            ) {

                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to save candidate evaluation."
                    )
                );

            } finally {

                setEvaluationSubmitting(
                    false
                );
            }
        };


    const handleDeleteEvaluation =
        async () => {

            const applicationId =
                getApplicationId(
                    evaluationApplication
                );

            const existingEvaluation =
                evaluations[
                    String(
                        applicationId
                    )
                ];

            if (
                !applicationId ||
                !existingEvaluation
            ) {
                return;
            }

            if (
                !window.confirm(
                    `Delete the evaluation for ${getCandidateName(
                        evaluationApplication
                    )}?`
                )
            ) {
                return;
            }

            setEvaluationDeleting(
                true
            );

            setError(
                ""
            );

            try {

                await axiosInstance.delete(
                    `/api/recruiter/evaluations/application/${applicationId}`
                );

                setEvaluations(
                    (
                        previous
                    ) => {

                        const next = {
                            ...previous
                        };

                        delete next[
                            String(
                                applicationId
                            )
                        ];

                        return next;
                    }
                );

                setSuccess(
                    `Evaluation deleted for ${getCandidateName(
                        evaluationApplication
                    )}.`
                );

                setEvaluationApplication(
                    null
                );

                setEvaluationForm({
                    ...EMPTY_EVALUATION_FORM
                });

            } catch (
                requestError
            ) {

                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to delete candidate evaluation."
                    )
                );

            } finally {

                setEvaluationDeleting(
                    false
                );
            }
        };


    // =====================================================
    // JOB OFFER MANAGEMENT
    // =====================================================

    const updateOfferInState =
        (
            offer
        ) => {

            if (
                !offer?.applicationId
            ) {
                return;
            }

            setOffers(
                (
                    previous
                ) => ({
                    ...previous,
                    [
                        String(
                            offer.applicationId
                        )
                    ]:
                        offer
                })
            );
        };


    const fillOfferForm =
        (
            offer
        ) => {

            setOfferForm({
                offeredSalary:
                    offer?.offeredSalary ??
                    "",
                currency:
                    offer?.currency ||
                    "INR",
                joiningDate:
                    offer?.joiningDate ||
                    "",
                expiresAt:
                    toDateTimeLocalValue(
                        offer?.expiresAt
                    ),
                message:
                    offer?.message ||
                    ""
            });
        };


    const openCandidateOffer =
        async (
            application
        ) => {

            const applicationId =
                getApplicationId(
                    application
                );

            if (
                !applicationId
            ) {

                setError(
                    "Application ID is missing."
                );

                return;
            }

            if (
                application?.status !==
                "SELECTED" &&
                !offers[
                    String(
                        applicationId
                    )
                ]
            ) {

                setError(
                    "Only selected candidates can receive job offers."
                );

                return;
            }

            setOfferApplication(
                application
            );

            setOfferLoading(
                true
            );

            fillOfferForm(
                offers[
                    String(
                        applicationId
                    )
                ] ||
                null
            );

            setError(
                ""
            );

            try {

                const response =
                    await axiosInstance.get(
                        `/api/recruiter/offers/application/${applicationId}`
                    );

                updateOfferInState(
                    response.data
                );

                fillOfferForm(
                    response.data
                );

            } catch (
                requestError
            ) {

                const message =
                    getBackendErrorMessage(
                        requestError,
                        "Unable to load job offer."
                    );

                const lowerMessage =
                    message.toLowerCase();

                if (
                    requestError?.response?.status ===
                    404 ||
                    lowerMessage.includes(
                        "offer not found"
                    ) ||
                    lowerMessage.includes(
                        "job offer not found"
                    ) ||
                    lowerMessage.includes(
                        "not found"
                    )
                ) {

                    fillOfferForm(
                        null
                    );

                } else {

                    setError(
                        message
                    );
                }

            } finally {

                setOfferLoading(
                    false
                );
            }
        };


    const closeOfferModal =
        () => {

            if (
                offerSubmitting ||
                offerActionId !==
                null
            ) {
                return;
            }

            setOfferApplication(
                null
            );

            setOfferForm({
                ...EMPTY_OFFER_FORM
            });
        };


    const handleOfferFormChange =
        (
            event
        ) => {

            const {
                name,
                value
            } =
                event.target;

            setOfferForm(
                (
                    previous
                ) => ({
                    ...previous,
                    [name]:
                        value
                })
            );
        };


    const validateOfferForm =
        () => {

            const salary =
                Number(
                    offerForm.offeredSalary
                );

            if (
                !Number.isFinite(
                    salary
                ) ||
                salary <= 0
            ) {
                return "Offered salary must be greater than zero.";
            }

            if (
                !offerForm.currency.trim()
            ) {
                return "Currency is required.";
            }

            if (
                !offerForm.joiningDate
            ) {
                return "Joining date is required.";
            }

            const joiningDate =
                new Date(
                    `${offerForm.joiningDate}T00:00:00`
                );

            if (
                Number.isNaN(
                    joiningDate.getTime()
                )
            ) {
                return "Joining date is invalid.";
            }

            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );

            if (
                joiningDate <
                today
            ) {
                return "Joining date cannot be in the past.";
            }

            if (
                !offerForm.expiresAt
            ) {
                return "Offer expiry date and time are required.";
            }

            const expiryDate =
                new Date(
                    offerForm.expiresAt
                );

            if (
                Number.isNaN(
                    expiryDate.getTime()
                ) ||
                expiryDate.getTime() <=
                Date.now()
            ) {
                return "Offer expiry date and time must be in the future.";
            }

            if (
                offerForm.message.length >
                5000
            ) {
                return "Offer message cannot exceed 5000 characters.";
            }

            return "";
        };


    const handleSaveOfferDraft =
        async (
            event
        ) => {

            event.preventDefault();

            const applicationId =
                getApplicationId(
                    offerApplication
                );

            if (
                !applicationId
            ) {

                setError(
                    "Application ID is missing."
                );

                return;
            }

            const currentOffer =
                offers[
                    String(
                        applicationId
                    )
                ] ||
                null;

            if (
                currentOffer &&
                currentOffer.status !==
                "DRAFT"
            ) {

                setError(
                    "Only draft offers can be edited."
                );

                return;
            }

            const validationError =
                validateOfferForm();

            if (
                validationError
            ) {

                setError(
                    validationError
                );

                return;
            }

            const payload = {
                offeredSalary:
                    Number(
                        offerForm.offeredSalary
                    ),
                currency:
                    offerForm.currency
                        .trim()
                        .toUpperCase(),
                joiningDate:
                    offerForm.joiningDate,
                expiresAt:
                    normalizeScheduledAt(
                        offerForm.expiresAt
                    ),
                message:
                    offerForm.message
                        .trim() ||
                    null
            };

            setOfferSubmitting(
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
                        `/api/recruiter/offers/application/${applicationId}`,
                        payload
                    );

                updateOfferInState(
                    response.data
                );

                fillOfferForm(
                    response.data
                );

                setSuccess(
                    `Offer draft saved for ${getCandidateName(
                        offerApplication
                    )}.`
                );

            } catch (
                requestError
            ) {

                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to save job offer draft."
                    )
                );

            } finally {

                setOfferSubmitting(
                    false
                );
            }
        };


    const handleSendOffer =
        async () => {

            const applicationId =
                getApplicationId(
                    offerApplication
                );

            const offer =
                offers[
                    String(
                        applicationId
                    )
                ] ||
                null;

            if (
                !offer?.id
            ) {

                setError(
                    "Save the offer as a draft before sending it."
                );

                return;
            }

            if (
                offer.status !==
                "DRAFT"
            ) {

                setError(
                    "Only draft offers can be sent."
                );

                return;
            }

            const confirmed =
                window.confirm(
                    `Send this offer to ${getCandidateName(
                        offerApplication
                    )}?`
                );

            if (
                !confirmed
            ) {
                return;
            }

            setOfferActionId(
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
                        `/api/recruiter/offers/${offer.id}/send`
                    );

                updateOfferInState(
                    response.data
                );

                fillOfferForm(
                    response.data
                );

                setSuccess(
                    `Offer sent to ${getCandidateName(
                        offerApplication
                    )}.`
                );

            } catch (
                requestError
            ) {

                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to send job offer."
                    )
                );

            } finally {

                setOfferActionId(
                    null
                );
            }
        };


    const handleWithdrawOffer =
        async () => {

            const applicationId =
                getApplicationId(
                    offerApplication
                );

            const offer =
                offers[
                    String(
                        applicationId
                    )
                ] ||
                null;

            if (
                !offer?.id ||
                offer.status !==
                "SENT"
            ) {

                setError(
                    "Only sent offers can be withdrawn."
                );

                return;
            }

            const confirmed =
                window.confirm(
                    `Withdraw the offer sent to ${getCandidateName(
                        offerApplication
                    )}?`
                );

            if (
                !confirmed
            ) {
                return;
            }

            setOfferActionId(
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
                        `/api/recruiter/offers/${offer.id}/withdraw`
                    );

                updateOfferInState(
                    response.data
                );

                fillOfferForm(
                    response.data
                );

                setSuccess(
                    `Offer withdrawn for ${getCandidateName(
                        offerApplication
                    )}.`
                );

            } catch (
                requestError
            ) {

                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to withdraw job offer."
                    )
                );

            } finally {

                setOfferActionId(
                    null
                );
            }
        };


    // =====================================================
    // COMPARISON
    // =====================================================

    const selectedCandidates =
        useMemo(
            () =>
                applications.filter(
                    (
                        application
                    ) => {

                        const applicationId =
                            getApplicationId(
                                application
                            );

                        return selectedCandidateIds.some(
                            (
                                selectedId
                            ) =>
                                String(
                                    selectedId
                                ) ===
                                String(
                                    applicationId
                                )
                        );
                    }
                ),
            [
                applications,
                selectedCandidateIds
            ]
        );


    useEffect(
        () => {

            const validIds =
                new Set(
                    applications
                        .map(
                            (
                                application
                            ) =>
                                getApplicationId(
                                    application
                                )
                        )
                        .filter(
                            (
                                value
                            ) =>
                                value !==
                                null &&
                                value !==
                                undefined
                        )
                        .map(
                            (
                                value
                            ) =>
                                String(
                                    value
                                )
                        )
                );

            setSelectedCandidateIds(
                (
                    previous
                ) => {

                    const next =
                        previous.filter(
                            (
                                selectedId
                            ) =>
                                validIds.has(
                                    String(
                                        selectedId
                                    )
                                )
                        );

                    return next.length ===
                        previous.length
                        ? previous
                        : next;
                }
            );
        },
        [
            applications
        ]
    );


    const isCandidateSelected =
        (
            application
        ) => {

            const applicationId =
                getApplicationId(
                    application
                );

            if (
                applicationId ===
                null ||
                applicationId ===
                undefined
            ) {
                return false;
            }

            return selectedCandidateIds.some(
                (
                    selectedId
                ) =>
                    String(
                        selectedId
                    ) ===
                    String(
                        applicationId
                    )
            );
        };


    const toggleCandidateSelection =
        (
            application
        ) => {

            const applicationId =
                getApplicationId(
                    application
                );

            if (
                applicationId ===
                null ||
                applicationId ===
                undefined
            ) {

                setError(
                    "Application ID is missing."
                );

                return;
            }

            if (
                isCandidateSelected(
                    application
                )
            ) {

                setSelectedCandidateIds(
                    (
                        previous
                    ) =>
                        previous.filter(
                            (
                                selectedId
                            ) =>
                                String(
                                    selectedId
                                ) !==
                                String(
                                    applicationId
                                )
                        )
                );

                setError(
                    ""
                );

                return;
            }

            if (
                selectedCandidateIds.length >=
                4
            ) {

                setError(
                    "You can compare a maximum of 4 candidates at a time."
                );

                return;
            }

            setSelectedCandidateIds(
                (
                    previous
                ) => [
                    ...previous,
                    applicationId
                ]
            );

            setError(
                ""
            );
        };


    const clearCandidateComparison =
        () => {

            setSelectedCandidateIds(
                []
            );

            setCompareModalOpen(
                false
            );

            setError(
                ""
            );
        };


    const openCandidateComparison =
        () => {

            if (
                selectedCandidates.length <
                2
            ) {

                setError(
                    "Select at least 2 candidates to compare."
                );

                return;
            }

            setError(
                ""
            );

            setCompareModalOpen(
                true
            );
        };


    const getCompletedInterviewRounds =
        (
            application
        ) =>
            getInterviewsForApplication(
                application
            )
                .filter(
                    (
                        interview
                    ) =>
                        interview?.status ===
                        "COMPLETED"
                ).length;


    const getScheduledInterviewRounds =
        (
            application
        ) =>
            getInterviewsForApplication(
                application
            )
                .filter(
                    (
                        interview
                    ) =>
                        interview?.status ===
                        "SCHEDULED"
                ).length;


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loading
    ) {

        return (

            <div className="job-applications-loading">

                <div className="spinner-border text-primary"></div>

                <p>
                    Loading applications...
                </p>

            </div>
        );
    }


    const candidateModalRounds =
        candidateDetailsApplication
            ? getInterviewsForApplication(
                candidateDetailsApplication
            )
            : [];


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="job-applications-page">

            <div className="container-fluid px-lg-5">


                <Link
                    to="/recruiter/jobs"
                    className="job-applications-back"
                >

                    <i className="bi bi-arrow-left"></i>

                    Back to My Jobs

                </Link>


                <div className="job-applications-header">

                    <div>

                        <span className="job-applications-eyebrow">
                            Candidate Pipeline
                        </span>

                        <h1>
                            Job Applications
                        </h1>

                        <p>
                            Search, compare, evaluate and manage candidates for this role.
                        </p>

                    </div>

                    <div className="job-applications-header-icon">

                        <i className="bi bi-people"></i>

                    </div>

                </div>


                {success && (

                    <div className="alert alert-success recruiter-application-alert">

                        <i className="bi bi-check-circle-fill me-2"></i>

                        {success}

                    </div>

                )}


                {error && (

                    <div className="alert alert-danger recruiter-application-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                <div className="recruiter-application-stats">

                    <StatCard
                        icon="bi-people"
                        className="application-stat-total-icon"
                        label="Applications"
                        value={
                            stats.total
                        }
                    />

                    <StatCard
                        icon="bi-star"
                        className="application-stat-shortlist-icon"
                        label="Shortlisted"
                        value={
                            stats.shortlisted
                        }
                    />

                    <StatCard
                        icon="bi-camera-video"
                        className="application-stat-interview-icon"
                        label="Interview"
                        value={
                            stats.interview
                        }
                    />

                    <StatCard
                        icon="bi-trophy"
                        className="application-stat-selected-icon"
                        label="Selected"
                        value={
                            stats.selected
                        }
                    />

                </div>


                {applications.length >
                    0 && (

                    <div className="job-applications-filter-panel">

                        <div className="job-applications-filter-panel-header">

                            <div>

                                <span>
                                    Candidate Search
                                </span>

                                <h4>
                                    Advanced Filters
                                </h4>

                            </div>

                            <div className="job-applications-filter-header-actions">

                                {evaluationsLoading && (

                                    <span className="job-applications-loading-evaluations">

                                        <span className="spinner-border spinner-border-sm"></span>

                                        Scores

                                    </span>

                                )}

                                {offersLoading && (

                                    <span className="job-applications-loading-evaluations">

                                        <span className="spinner-border spinner-border-sm"></span>

                                        Offers

                                    </span>

                                )}

                                {activeFilterCount >
                                    0 && (

                                    <span className="job-applications-active-filter-count">

                                        {activeFilterCount} active

                                    </span>

                                )}

                                {activeFilterCount >
                                    0 && (

                                    <button
                                        type="button"
                                        className="job-applications-clear-all"
                                        onClick={
                                            clearAllFilters
                                        }
                                    >

                                        <i className="bi bi-x-circle"></i>

                                        Clear All

                                    </button>

                                )}

                            </div>

                        </div>


                        <div className="job-applications-main-search">

                            <i className="bi bi-search"></i>

                            <input
                                type="text"
                                value={
                                    searchText
                                }
                                placeholder="Search name, email, skills, location, education..."
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
                                >

                                    <i className="bi bi-x-lg"></i>

                                </button>

                            )}

                        </div>


                        <div className="job-applications-filter-grid">


                            <FilterGroup
                                label="Application Stage"
                                icon="bi-diagram-3"
                            >

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
                                        All Stages
                                    </option>

                                    {FILTER_STATUS_OPTIONS.map(
                                        (
                                            status
                                        ) => (

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

                                    ))}

                                </select>

                            </FilterGroup>


                            <FilterGroup
                                label="Skill"
                                icon="bi-tools"
                            >

                                <input
                                    type="text"
                                    list="candidate-skill-options"
                                    value={
                                        skillFilter
                                    }
                                    placeholder="Java, React..."
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setSkillFilter(
                                                event.target.value
                                            )
                                    }
                                />

                                <datalist id="candidate-skill-options">

                                    {skillOptions.map(
                                        (
                                            skill
                                        ) => (

                                        <option
                                            key={
                                                skill
                                            }
                                            value={
                                                skill
                                            }
                                        />

                                    ))}

                                </datalist>

                            </FilterGroup>


                            <FilterGroup
                                label="Experience"
                                icon="bi-person-workspace"
                            >

                                <select
                                    value={
                                        experienceFilter
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setExperienceFilter(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="ALL">
                                        Any Experience
                                    </option>

                                    <option value="FRESHER">
                                        Fresher / 0 Years
                                    </option>

                                    <option value="ONE_TWO">
                                        1 - 2 Years
                                    </option>

                                    <option value="THREE_FIVE">
                                        3 - 5 Years
                                    </option>

                                    <option value="SIX_PLUS">
                                        6+ Years
                                    </option>

                                    <option value="NOT_SPECIFIED">
                                        Not Specified
                                    </option>

                                </select>

                            </FilterGroup>


                            <FilterGroup
                                label="Location"
                                icon="bi-geo-alt"
                            >

                                <select
                                    value={
                                        locationFilter
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setLocationFilter(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="ALL">
                                        All Locations
                                    </option>

                                    {locationOptions.map(
                                        (
                                            location
                                        ) => (

                                        <option
                                            key={
                                                location
                                            }
                                            value={
                                                location
                                            }
                                        >
                                            {location}
                                        </option>

                                    ))}

                                </select>

                            </FilterGroup>


                            <FilterGroup
                                label="Education"
                                icon="bi-mortarboard"
                            >

                                <select
                                    value={
                                        educationFilter
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setEducationFilter(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="ALL">
                                        All Education
                                    </option>

                                    {educationOptions.map(
                                        (
                                            education
                                        ) => (

                                        <option
                                            key={
                                                education
                                            }
                                            value={
                                                education
                                            }
                                        >
                                            {education}
                                        </option>

                                    ))}

                                </select>

                            </FilterGroup>


                            <FilterGroup
                                label="Sort By"
                                icon="bi-sort-down"
                            >

                                <select
                                    value={
                                        sortOption
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setSortOption(
                                                event.target.value
                                            )
                                    }
                                >

                                    <option value="NEWEST">
                                        Newest Application
                                    </option>

                                    <option value="OLDEST">
                                        Oldest Application
                                    </option>

                                    <option value="EXPERIENCE_HIGH">
                                        Experience: High to Low
                                    </option>

                                    <option value="EXPERIENCE_LOW">
                                        Experience: Low to High
                                    </option>

                                    <option value="NAME_AZ">
                                        Candidate Name A-Z
                                    </option>

                                    <option value="SCORE_HIGH">
                                        Evaluation Score: High to Low
                                    </option>

                                </select>

                            </FilterGroup>

                        </div>


                        <div className="job-applications-result-summary">

                            <div>

                                <i className="bi bi-people"></i>

                                Showing{" "}

                                <strong>
                                    {filteredApplications.length}
                                </strong>

                                {" "}of{" "}

                                <strong>
                                    {applications.length}
                                </strong>

                                {" "}candidates

                            </div>

                            {skillFilter && (

                                <span>

                                    Skill:{" "}

                                    <strong>
                                        {skillFilter}
                                    </strong>

                                </span>

                            )}

                        </div>

                    </div>

                )}


                {applications.length ===
                    0 ? (

                    <EmptyApplications />

                ) : filteredApplications.length ===
                    0 ? (

                    <div className="job-applications-empty">

                        <div>

                            <i className="bi bi-funnel"></i>

                        </div>

                        <h3>
                            No candidates match these filters
                        </h3>

                        <p>
                            Change the current candidate filters and try again.
                        </p>

                        <button
                            type="button"
                            className="btn job-applications-empty-button"
                            onClick={
                                clearAllFilters
                            }
                        >
                            Clear All Filters
                        </button>

                    </div>

                ) : (

                    <div className="recruiter-applicant-list">

                        {filteredApplications.map(
                            (
                                application
                            ) => {

                                const applicationId =
                                    getApplicationId(
                                        application
                                    );

                                const resumeUrl =
                                    getResumeUrl(
                                        application
                                    );

                                const coverLetter =
                                    getCoverLetter(
                                        application
                                    );

                                const rounds =
                                    getInterviewsForApplication(
                                        application
                                    );

                                const activeInterview =
                                    getActiveInterview(
                                        application
                                    );

                                const latestInterview =
                                    getLatestInterview(
                                        application
                                    );

                                const allowedStatuses =
                                    STATUS_TRANSITIONS[
                                        application.status
                                    ] ||
                                    [];

                                const evaluation =
                                    evaluations[
                                        String(
                                            applicationId
                                        )
                                    ] ||
                                    null;

                                const offer =
                                    offers[
                                        String(
                                            applicationId
                                        )
                                    ] ||
                                    null;

                                const candidateSelected =
                                    isCandidateSelected(
                                        application
                                    );

                                const hireConfirmed =
                                    offer?.status ===
                                    "ACCEPTED";

                                return (

                                    <article
                                        className={
                                            `recruiter-applicant-card ${
                                                candidateSelected
                                                    ? "recruiter-applicant-card-selected"
                                                    : ""
                                            } ${
                                                hireConfirmed
                                                    ? "recruiter-applicant-card-hired"
                                                    : ""
                                            }`
                                        }
                                        key={
                                            applicationId
                                        }
                                    >


                                        <div className="recruiter-candidate-avatar">

                                            {getCandidateName(
                                                application
                                            )
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase()}

                                        </div>


                                        <div className="recruiter-candidate-main">


                                            <div className="recruiter-candidate-header">

                                                <div>

                                                    <span className="candidate-id-text">

                                                        Application #{applicationId}

                                                    </span>

                                                    <h3>

                                                        {getCandidateName(
                                                            application
                                                        )}

                                                    </h3>

                                                    <p>

                                                        <i className="bi bi-envelope"></i>

                                                        {getCandidateEmail(
                                                            application
                                                        )}

                                                    </p>

                                                </div>


                                                <div className="recruiter-candidate-header-right">

                                                    <label
                                                        className={
                                                            `recruiter-candidate-select ${
                                                                candidateSelected
                                                                    ? "selected"
                                                                    : ""
                                                            }`
                                                        }
                                                    >

                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                candidateSelected
                                                            }
                                                            onChange={
                                                                () =>
                                                                    toggleCandidateSelection(
                                                                        application
                                                                    )
                                                            }
                                                        />

                                                        <span>

                                                            <i className="bi bi-columns-gap"></i>

                                                            {candidateSelected
                                                                ? "Selected"
                                                                : "Compare"
                                                            }

                                                        </span>

                                                    </label>


                                                    {evaluation && (

                                                        <EvaluationScoreBadge
                                                            evaluation={
                                                                evaluation
                                                            }
                                                        />

                                                    )}


                                                    {offer && (

                                                        <OfferStatusBadge
                                                            offer={
                                                                offer
                                                            }
                                                        />

                                                    )}


                                                    <span
                                                        className={
                                                            `recruiter-application-status ${getStatusClass(
                                                                application.status
                                                            )}`
                                                        }
                                                    >

                                                        {formatStatus(
                                                            application.status
                                                        )}

                                                    </span>

                                                </div>

                                            </div>


                                            <div className="recruiter-candidate-meta">

                                                <span>

                                                    <i className="bi bi-briefcase"></i>

                                                    {getJobTitle(
                                                        application,
                                                        jobId
                                                    )}

                                                </span>

                                                <span>

                                                    <i className="bi bi-calendar-check"></i>

                                                    {formatDateTime(
                                                        application.appliedAt
                                                    )}

                                                </span>

                                                {getCandidateLocation(
                                                    application
                                                ) && (

                                                    <span>

                                                        <i className="bi bi-geo-alt"></i>

                                                        {getCandidateLocation(
                                                            application
                                                        )}

                                                    </span>

                                                )}

                                                {getCandidateExperience(
                                                    application
                                                ) !==
                                                    null && (

                                                    <span>

                                                        <i className="bi bi-person-workspace"></i>

                                                        {getCandidateExperience(
                                                            application
                                                        )}{" "}
                                                        year(s)

                                                    </span>

                                                )}

                                                {getCandidateEducation(
                                                    application
                                                ) && (

                                                    <span>

                                                        <i className="bi bi-mortarboard"></i>

                                                        {getCandidateEducation(
                                                            application
                                                        )}

                                                    </span>

                                                )}

                                            </div>


                                            {getSkillList(
                                                application
                                            ).length >
                                                0 && (

                                                <div className="recruiter-card-skills">

                                                    {getSkillList(
                                                        application
                                                    )
                                                        .slice(
                                                            0,
                                                            8
                                                        )
                                                        .map(
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

                                            )}


                                            {coverLetter && (

                                                <div className="recruiter-cover-letter">

                                                    <div>

                                                        <i className="bi bi-chat-left-text"></i>

                                                        <strong>
                                                            Cover Letter
                                                        </strong>

                                                    </div>

                                                    <p>

                                                        {coverLetter.length >
                                                        280
                                                            ? `${coverLetter.substring(
                                                                0,
                                                                280
                                                            )}...`
                                                            : coverLetter
                                                        }

                                                    </p>

                                                </div>

                                            )}


                                            {(application.status ===
                                                "INTERVIEW" ||
                                                rounds.length >
                                                0) && (

                                                <div className="recruiter-interview-section">

                                                    <div className="recruiter-interview-section-header">

                                                        <div>

                                                            <i className="bi bi-diagram-3"></i>

                                                            <div>

                                                                <span>
                                                                    Interview Process
                                                                </span>

                                                                <strong>

                                                                    {rounds.length}{" "}

                                                                    {rounds.length ===
                                                                    1
                                                                        ? "Round"
                                                                        : "Rounds"
                                                                    }

                                                                </strong>

                                                            </div>

                                                        </div>

                                                    </div>


                                                    {interviewsLoading ? (

                                                        <div className="recruiter-interview-inline-loading">

                                                            <span className="spinner-border spinner-border-sm"></span>

                                                            Loading interview rounds...

                                                        </div>

                                                    ) : (

                                                        <>

                                                            {rounds.map(
                                                                (
                                                                    interview,
                                                                    index
                                                                ) => (

                                                                <InterviewRoundCard
                                                                    key={
                                                                        interview.id ||
                                                                        index
                                                                    }
                                                                    application={
                                                                        application
                                                                    }
                                                                    interview={
                                                                        interview
                                                                    }
                                                                    busy={
                                                                        interviewActionId ===
                                                                        interview.id
                                                                    }
                                                                    onReschedule={
                                                                        openRescheduleInterview
                                                                    }
                                                                    onCancel={
                                                                        handleCancelInterview
                                                                    }
                                                                    onComplete={
                                                                        handleCompleteInterview
                                                                    }
                                                                />

                                                            ))}


                                                            {canScheduleNextRound(
                                                                application
                                                            ) && (

                                                                <div className="recruiter-interview-empty">

                                                                    <div>

                                                                        <p>
                                                                            Ready for another interview stage?
                                                                        </p>

                                                                        <small>

                                                                            Schedule Round{" "}

                                                                            {getNextRoundNumber(
                                                                                application
                                                                            )}

                                                                        </small>

                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        className="recruiter-schedule-interview-button"
                                                                        onClick={
                                                                            () =>
                                                                                openScheduleInterview(
                                                                                    application
                                                                                )
                                                                        }
                                                                    >

                                                                        <i className="bi bi-plus-circle"></i>

                                                                        Schedule Next Round

                                                                    </button>

                                                                </div>

                                                            )}


                                                            {activeInterview &&
                                                                application.status ===
                                                                "INTERVIEW" && (

                                                                <div className="alert alert-info recruiter-round-message">

                                                                    <i className="bi bi-info-circle me-2"></i>

                                                                    Complete or cancel{" "}

                                                                    {getInterviewRoundLabel(
                                                                        activeInterview
                                                                    )}

                                                                    {" "}before adding another round.

                                                                </div>

                                                            )}


                                                            {application.status !==
                                                                "INTERVIEW" &&
                                                                latestInterview && (

                                                                <div className="alert alert-secondary recruiter-round-message">

                                                                    <i className="bi bi-lock me-2"></i>

                                                                    Interview history is read-only.

                                                                </div>

                                                            )}

                                                        </>

                                                    )}

                                                </div>

                                            )}


                                            {(
                                                application.status ===
                                                "SELECTED" ||
                                                offer
                                            ) && (

                                                <div className="recruiter-offer-card-summary">

                                                    <div className="recruiter-offer-card-summary-header">

                                                        <div>

                                                            <i className="bi bi-envelope-paper"></i>

                                                            <div>

                                                                <span>
                                                                    Job Offer
                                                                </span>

                                                                <strong>

                                                                    {offer
                                                                        ? formatStatus(
                                                                            offer.status
                                                                        )
                                                                        : "Not Created"
                                                                    }

                                                                </strong>

                                                            </div>

                                                        </div>

                                                        {offer && (

                                                            <OfferStatusBadge
                                                                offer={
                                                                    offer
                                                                }
                                                            />

                                                        )}

                                                    </div>


                                                    {offer?.status ===
                                                        "ACCEPTED" && (

                                                        <div className="recruiter-hire-confirmed-banner">

                                                            <div>
                                                                <i className="bi bi-patch-check-fill"></i>
                                                            </div>

                                                            <span>
                                                                <small>
                                                                    Hiring Confirmed
                                                                </small>

                                                                <strong>
                                                                    Offer accepted • Joining {formatDateOnly(
                                                                        offer.joiningDate
                                                                    )}
                                                                </strong>
                                                            </span>

                                                        </div>
                                                    )}


                                                    {offer ? (

                                                        <div className="recruiter-offer-card-details">

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

                                                            <div>

                                                                <small>
                                                                    Joining Date
                                                                </small>

                                                                <strong>

                                                                    {formatDateOnly(
                                                                        offer.joiningDate
                                                                    )}

                                                                </strong>

                                                            </div>

                                                            <div>

                                                                <small>
                                                                    Expires
                                                                </small>

                                                                <strong>

                                                                    {formatDateTime(
                                                                        offer.expiresAt
                                                                    )}

                                                                </strong>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <p className="recruiter-offer-card-empty">
                                                            This candidate is selected. Create a job offer when you are ready.
                                                        </p>

                                                    )}

                                                </div>

                                            )}


                                            <div className="recruiter-applicant-actions">


                                                <button
                                                    type="button"
                                                    className="btn recruiter-candidate-details-button"
                                                    onClick={
                                                        () =>
                                                            openCandidateDetails(
                                                                application
                                                            )
                                                    }
                                                >

                                                    <i className="bi bi-person-vcard me-2"></i>

                                                    View Candidate

                                                </button>


                                                <button
                                                    type="button"
                                                    className="btn recruiter-evaluate-button"
                                                    onClick={
                                                        () =>
                                                            openCandidateEvaluation(
                                                                application
                                                            )
                                                    }
                                                >

                                                    <i className="bi bi-star me-2"></i>

                                                    {evaluation
                                                        ? "Edit Evaluation"
                                                        : "Evaluate Candidate"
                                                    }

                                                </button>


                                                {(
                                                    application.status ===
                                                    "SELECTED" ||
                                                    offer
                                                ) && (

                                                    <button
                                                        type="button"
                                                        className="btn recruiter-offer-button"
                                                        onClick={
                                                            () =>
                                                                openCandidateOffer(
                                                                    application
                                                                )
                                                        }
                                                    >

                                                        <i className="bi bi-envelope-paper me-2"></i>

                                                        {!offer
                                                            ? "Create Offer"
                                                            : offer.status ===
                                                                "DRAFT"
                                                                ? "Edit Offer"
                                                                : offer.status ===
                                                                    "ACCEPTED"
                                                                    ? "View Hire Details"
                                                                    : "View Offer"
                                                        }

                                                    </button>

                                                )}


                                                {hireConfirmed && (

                                                    <Link
                                                        to="/recruiter/onboarding"
                                                        className="btn recruiter-onboarding-button"
                                                    >

                                                        <i className="bi bi-person-workspace me-2"></i>

                                                        Manage Onboarding

                                                    </Link>

                                                )}


                                                {resumeUrl ? (

                                                    <a
                                                        href={
                                                            resumeUrl
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn recruiter-resume-button"
                                                    >

                                                        <i className="bi bi-file-earmark-pdf me-2"></i>

                                                        View Resume

                                                    </a>

                                                ) : (

                                                    <button
                                                        type="button"
                                                        className="btn recruiter-resume-button"
                                                        disabled
                                                    >

                                                        <i className="bi bi-file-earmark-x me-2"></i>

                                                        No Resume

                                                    </button>

                                                )}


                                                <button
                                                    type="button"
                                                    className="btn recruiter-history-button"
                                                    onClick={
                                                        () =>
                                                            handleViewHistory(
                                                                application
                                                            )
                                                    }
                                                >

                                                    <i className="bi bi-clock-history me-2"></i>

                                                    History

                                                </button>


                                                <div className="recruiter-status-control">

                                                    <label>
                                                        Status
                                                    </label>

                                                    {allowedStatuses.length >
                                                        0 ? (

                                                        <select
                                                            value=""
                                                            disabled={
                                                                updatingId ===
                                                                applicationId
                                                            }
                                                            onChange={
                                                                (
                                                                    event
                                                                ) => {

                                                                    const value =
                                                                        event.target.value;

                                                                    if (
                                                                        value
                                                                    ) {

                                                                        handleStatusChange(
                                                                            application,
                                                                            value
                                                                        );
                                                                    }
                                                                }
                                                            }
                                                        >

                                                            <option value="">
                                                                Change status...
                                                            </option>

                                                            {allowedStatuses.map(
                                                                (
                                                                    status
                                                                ) => (

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

                                                            ))}

                                                        </select>

                                                    ) : (

                                                        <span className="application-terminal-status">

                                                            <i className="bi bi-lock"></i>

                                                            Final status

                                                        </span>

                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>

                )}

            </div>


            {selectedCandidates.length >
                0 && (

                <div className="recruiter-candidate-compare-bar">

                    <div className="recruiter-compare-summary">

                        <div className="recruiter-compare-icon">

                            <i className="bi bi-columns-gap"></i>

                        </div>

                        <div>

                            <strong>

                                {selectedCandidates.length}{" "}

                                candidate

                                {selectedCandidates.length ===
                                1
                                    ? ""
                                    : "s"
                                }

                                {" "}selected

                            </strong>

                            <span>
                                Select 2–4 candidates for comparison.
                            </span>

                        </div>

                    </div>


                    <div className="recruiter-compare-selected-avatars">

                        {selectedCandidates.map(
                            (
                                application
                            ) => (

                            <div
                                key={
                                    getApplicationId(
                                        application
                                    )
                                }
                                title={
                                    getCandidateName(
                                        application
                                    )
                                }
                            >

                                {getCandidateName(
                                    application
                                )
                                    .charAt(
                                        0
                                    )
                                    .toUpperCase()}

                            </div>

                        ))}

                    </div>


                    <div className="recruiter-compare-actions">

                        <button
                            type="button"
                            className="recruiter-compare-clear"
                            onClick={
                                clearCandidateComparison
                            }
                        >
                            Clear
                        </button>

                        <button
                            type="button"
                            className="recruiter-compare-open"
                            disabled={
                                selectedCandidates.length <
                                2
                            }
                            onClick={
                                openCandidateComparison
                            }
                        >

                            <i className="bi bi-columns-gap"></i>

                            Compare Candidates

                        </button>

                    </div>

                </div>

            )}


            {interviewModalApplication && (

                <InterviewModal
                    application={
                        interviewModalApplication
                    }
                    editingInterview={
                        editingInterview
                    }
                    interviewForm={
                        interviewForm
                    }
                    submitting={
                        interviewSubmitting
                    }
                    minimumDateTime={
                        getMinimumInterviewDateTime()
                    }
                    nextRoundNumber={
                        getNextRoundNumber(
                            interviewModalApplication
                        )
                    }
                    onChange={
                        handleInterviewFormChange
                    }
                    onClose={
                        closeInterviewModal
                    }
                    onSubmit={
                        handleInterviewSubmit
                    }
                />

            )}


            {candidateDetailsApplication && (

                <CandidateDetailsModal
                    application={
                        candidateDetailsApplication
                    }
                    history={
                        candidateDetailsHistory
                    }
                    historyLoading={
                        candidateDetailsLoading
                    }
                    historyError={
                        candidateDetailsError
                    }
                    interviews={
                        candidateModalRounds
                    }
                    interviewsLoading={
                        interviewsLoading
                    }
                    jobId={
                        jobId
                    }
                    evaluation={
                        evaluations[
                            String(
                                getApplicationId(
                                    candidateDetailsApplication
                                )
                            )
                        ] ||
                        null
                    }
                    onEvaluate={
                        () => {

                            const application =
                                candidateDetailsApplication;

                            closeCandidateDetails();

                            openCandidateEvaluation(
                                application
                            );
                        }
                    }
                    offer={
                        offers[
                            String(
                                getApplicationId(
                                    candidateDetailsApplication
                                )
                            )
                        ] ||
                        null
                    }
                    onOffer={
                        () => {

                            const application =
                                candidateDetailsApplication;

                            closeCandidateDetails();

                            openCandidateOffer(
                                application
                            );
                        }
                    }
                    onClose={
                        closeCandidateDetails
                    }
                />

            )}


            {compareModalOpen && (

                <CandidateComparisonModal
                    candidates={
                        selectedCandidates
                    }
                    getInterviewsForApplication={
                        getInterviewsForApplication
                    }
                    getCompletedInterviewRounds={
                        getCompletedInterviewRounds
                    }
                    getScheduledInterviewRounds={
                        getScheduledInterviewRounds
                    }
                    evaluations={
                        evaluations
                    }
                    evaluationsLoading={
                        evaluationsLoading
                    }
                    offers={
                        offers
                    }
                    onClose={
                        () =>
                            setCompareModalOpen(
                                false
                            )
                    }
                    onClear={
                        clearCandidateComparison
                    }
                />

            )}


            {evaluationApplication && (

                <CandidateEvaluationModal
                    application={
                        evaluationApplication
                    }
                    evaluation={
                        evaluations[
                            String(
                                getApplicationId(
                                    evaluationApplication
                                )
                            )
                        ] ||
                        null
                    }
                    form={
                        evaluationForm
                    }
                    loading={
                        evaluationLoading
                    }
                    submitting={
                        evaluationSubmitting
                    }
                    deleting={
                        evaluationDeleting
                    }
                    onRatingChange={
                        handleEvaluationRatingChange
                    }
                    onNotesChange={
                        handleEvaluationNotesChange
                    }
                    onSubmit={
                        handleEvaluationSubmit
                    }
                    onDelete={
                        handleDeleteEvaluation
                    }
                    onClose={
                        closeCandidateEvaluation
                    }
                />

            )}


            {offerApplication && (

                <JobOfferModal
                    application={
                        offerApplication
                    }
                    offer={
                        offers[
                            String(
                                getApplicationId(
                                    offerApplication
                                )
                            )
                        ] ||
                        null
                    }
                    form={
                        offerForm
                    }
                    loading={
                        offerLoading
                    }
                    submitting={
                        offerSubmitting
                    }
                    actionBusy={
                        offerActionId !==
                        null
                    }
                    onChange={
                        handleOfferFormChange
                    }
                    onSubmit={
                        handleSaveOfferDraft
                    }
                    onSend={
                        handleSendOffer
                    }
                    onWithdraw={
                        handleWithdrawOffer
                    }
                    onPreviewLetter={
                        (
                            offer
                        ) =>
                            handleOfferLetter(
                                offer,
                                "preview"
                            )
                    }
                    onDownloadLetter={
                        (
                            offer
                        ) =>
                            handleOfferLetter(
                                offer,
                                "download"
                            )
                    }
                    letterBusy={
                        offerLetterId !==
                        null
                    }
                    onClose={
                        closeOfferModal
                    }
                />

            )}


            {selectedApplication && (

                <HistoryModal
                    application={
                        selectedApplication
                    }
                    history={
                        history
                    }
                    loading={
                        historyLoading
                    }
                    onClose={
                        closeHistory
                    }
                />

            )}

        </div>
    );
}


// =====================================================
// FILTER GROUP
// =====================================================

function FilterGroup({
    icon,
    label,
    children
}) {

    return (

        <div className="job-applications-filter-group">

            <label>

                <i
                    className={
                        `bi ${icon}`
                    }
                ></i>

                {label}

            </label>

            {children}

        </div>
    );
}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
    icon,
    className,
    label,
    value
}) {

    return (

        <div className="recruiter-application-stat">

            <div
                className={
                    className
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

            </div>

        </div>
    );
}


// =====================================================
// EMPTY APPLICATIONS
// =====================================================

function EmptyApplications() {

    return (

        <div className="job-applications-empty">

            <div>

                <i className="bi bi-people"></i>

            </div>

            <h3>
                No applications yet
            </h3>

            <p>
                Candidates who apply to this job will appear here.
            </p>

        </div>
    );
}


// =====================================================
// INTERVIEW ROUND CARD
// =====================================================

function InterviewRoundCard({
    interview,
    application,
    busy,
    onReschedule,
    onCancel,
    onComplete
}) {

    return (

        <div className="recruiter-interview-details recruiter-interview-round-card">

            <div className="recruiter-round-heading">

                <div>

                    <span>

                        Round{" "}

                        {interview.roundNumber ||
                            "—"}

                    </span>

                    <strong>

                        {getInterviewRoundLabel(
                            interview
                        )}

                    </strong>

                </div>

                <span
                    className={
                        `recruiter-interview-status ${getInterviewStatusClass(
                            interview.status
                        )}`
                    }
                >

                    {formatStatus(
                        interview.status
                    )}

                </span>

            </div>


            <div className="recruiter-interview-detail-grid">

                <ProfileItem
                    icon="bi-calendar3"
                    label="Schedule"
                    value={
                        formatDateTime(
                            interview.scheduledAt
                        )
                    }
                />

                <ProfileItem
                    icon={
                        interview.mode ===
                        "ONLINE"
                            ? "bi-camera-video"
                            : "bi-geo-alt"
                    }
                    label="Mode"
                    value={
                        formatStatus(
                            interview.mode
                        )
                    }
                />

                <ProfileItem
                    icon="bi-hash"
                    label="Round"
                    value={
                        interview.roundNumber ||
                        "—"
                    }
                />

            </div>


            {interview.mode ===
                "ONLINE" &&
                interview.meetingLink && (

                <div className="recruiter-interview-contact">

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


            {interview.mode ===
                "OFFLINE" &&
                interview.location && (

                <div className="recruiter-interview-contact">

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


            {interview.notes && (

                <div className="recruiter-interview-notes">

                    <i className="bi bi-info-circle"></i>

                    <p>
                        {interview.notes}
                    </p>

                </div>

            )}


            {interview.status ===
                "SCHEDULED" ? (

                <div className="recruiter-interview-actions">

                    <button
                        type="button"
                        className="recruiter-interview-reschedule-button"
                        disabled={
                            busy
                        }
                        onClick={
                            () =>
                                onReschedule(
                                    application,
                                    interview
                                )
                        }
                    >
                        Reschedule
                    </button>

                    <button
                        type="button"
                        className="recruiter-interview-complete-button"
                        disabled={
                            busy
                        }
                        onClick={
                            () =>
                                onComplete(
                                    application,
                                    interview
                                )
                        }
                    >
                        Complete
                    </button>

                    <button
                        type="button"
                        className="recruiter-interview-cancel-button"
                        disabled={
                            busy
                        }
                        onClick={
                            () =>
                                onCancel(
                                    application,
                                    interview
                                )
                        }
                    >
                        Cancel
                    </button>

                </div>

            ) : (

                <div className="recruiter-interview-final">

                    <i className="bi bi-lock"></i>

                    This round is read-only.

                </div>

            )}

        </div>
    );
}


// =====================================================
// INTERVIEW MODAL
// =====================================================

function InterviewModal({
    application,
    editingInterview,
    interviewForm,
    submitting,
    minimumDateTime,
    nextRoundNumber,
    onChange,
    onClose,
    onSubmit
}) {

    const roundNumber =
        editingInterview?.roundNumber ||
        nextRoundNumber;

    return (

        <div
            className="recruiter-interview-overlay"
            onMouseDown={
                onClose
            }
        >

            <div
                className="recruiter-interview-modal"
                onMouseDown={
                    (
                        event
                    ) =>
                        event.stopPropagation()
                }
            >

                <div className="recruiter-interview-modal-header">

                    <div>

                        <span>

                            {editingInterview
                                ? `Update Round ${roundNumber}`
                                : `Schedule Round ${roundNumber}`
                            }

                        </span>

                        <h4>

                            {getCandidateName(
                                application
                            )}

                        </h4>

                        <p>

                            {getCandidateEmail(
                                application
                            )}

                        </p>

                    </div>

                    <button
                        type="button"
                        disabled={
                            submitting
                        }
                        onClick={
                            onClose
                        }
                    >

                        <i className="bi bi-x-lg"></i>

                    </button>

                </div>


                <form
                    onSubmit={
                        onSubmit
                    }
                >

                    <div className="recruiter-interview-modal-body">

                        <div className="recruiter-interview-form-group">

                            <label>
                                Round Number
                            </label>

                            <input
                                type="text"
                                value={
                                    `Round ${roundNumber}`
                                }
                                disabled
                                readOnly
                            />

                        </div>


                        <div className="recruiter-interview-form-group">

                            <label>
                                Round Name
                            </label>

                            <input
                                type="text"
                                name="roundName"
                                maxLength="150"
                                value={
                                    interviewForm.roundName
                                }
                                onChange={
                                    onChange
                                }
                                placeholder="Technical Round, HR Round..."
                            />

                        </div>


                        <div className="recruiter-interview-form-group recruiter-interview-form-full">

                            <label>
                                Date & Time *
                            </label>

                            <input
                                type="datetime-local"
                                name="scheduledAt"
                                min={
                                    minimumDateTime
                                }
                                value={
                                    interviewForm.scheduledAt
                                }
                                onChange={
                                    onChange
                                }
                                required
                            />

                        </div>


                        <div className="recruiter-interview-form-group">

                            <label>
                                Mode
                            </label>

                            <select
                                name="mode"
                                value={
                                    interviewForm.mode
                                }
                                onChange={
                                    onChange
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


                        {interviewForm.mode ===
                            "ONLINE" ? (

                            <div className="recruiter-interview-form-group">

                                <label>
                                    Meeting Link *
                                </label>

                                <input
                                    type="url"
                                    name="meetingLink"
                                    value={
                                        interviewForm.meetingLink
                                    }
                                    onChange={
                                        onChange
                                    }
                                    required
                                />

                            </div>

                        ) : (

                            <div className="recruiter-interview-form-group">

                                <label>
                                    Location *
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        interviewForm.location
                                    }
                                    onChange={
                                        onChange
                                    }
                                    required
                                />

                            </div>

                        )}


                        <div className="recruiter-interview-form-group recruiter-interview-form-full">

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
                                    onChange
                                }
                            />

                        </div>

                    </div>


                    <div className="recruiter-interview-modal-footer">

                        <button
                            type="button"
                            className="recruiter-interview-modal-cancel"
                            disabled={
                                submitting
                            }
                            onClick={
                                onClose
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="recruiter-interview-modal-submit"
                            disabled={
                                submitting
                            }
                        >

                            {submitting
                                ? "Saving..."
                                : editingInterview
                                    ? "Update Interview"
                                    : "Schedule Interview"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


// =====================================================
// CANDIDATE DETAILS MODAL
// =====================================================

function CandidateDetailsModal({
    application,
    history,
    historyLoading,
    historyError,
    interviews,
    interviewsLoading,
    jobId,
    evaluation,
    onEvaluate,
    offer,
    onOffer,
    onClose
}) {

    const skills =
        getSkillList(
            application
        );

    const experience =
        getCandidateExperience(
            application
        );

    return (

        <div
            className="recruiter-candidate-details-overlay"
            onMouseDown={
                onClose
            }
        >

            <div
                className="recruiter-candidate-details-modal"
                onMouseDown={
                    (
                        event
                    ) =>
                        event.stopPropagation()
                }
            >

                <div className="recruiter-candidate-details-header">

                    <div className="recruiter-candidate-details-heading">

                        <div className="recruiter-candidate-details-avatar">

                            {getCandidateName(
                                application
                            )
                                .charAt(
                                    0
                                )
                                .toUpperCase()}

                        </div>

                        <div>

                            <span>
                                Candidate Profile
                            </span>

                            <h3>

                                {getCandidateName(
                                    application
                                )}

                            </h3>

                            <p>

                                <i className="bi bi-envelope"></i>

                                {getCandidateEmail(
                                    application
                                )}

                            </p>

                        </div>

                    </div>


                    <div className="recruiter-candidate-details-header-actions">

                        <span
                            className={
                                `recruiter-application-status ${getStatusClass(
                                    application.status
                                )}`
                            }
                        >

                            {formatStatus(
                                application.status
                            )}

                        </span>

                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                        >

                            <i className="bi bi-x-lg"></i>

                        </button>

                    </div>

                </div>


                <div className="recruiter-candidate-details-body">

                    {historyError && (

                        <div className="alert alert-warning">

                            {historyError}

                        </div>

                    )}


                    <DetailsSection
                        icon="bi-person-lines-fill"
                        eyebrow="Candidate"
                        title="Profile Information"
                    >

                        <div className="recruiter-candidate-profile-grid">

                            <ProfileItem
                                icon="bi-telephone"
                                label="Phone"
                                value={
                                    getCandidatePhone(
                                        application
                                    ) ||
                                    "Not provided"
                                }
                            />

                            <ProfileItem
                                icon="bi-geo-alt"
                                label="Location"
                                value={
                                    getCandidateLocation(
                                        application
                                    ) ||
                                    "Not provided"
                                }
                            />

                            <ProfileItem
                                icon="bi-person-workspace"
                                label="Experience"
                                value={
                                    experience !==
                                    null
                                        ? `${experience} year(s)`
                                        : "Not provided"
                                }
                            />

                            <ProfileItem
                                icon="bi-mortarboard"
                                label="Education"
                                value={
                                    getCandidateEducation(
                                        application
                                    ) ||
                                    "Not provided"
                                }
                            />

                        </div>


                        <div className="recruiter-candidate-skills-block">

                            <span>
                                Skills
                            </span>

                            {skills.length ? (

                                <div className="recruiter-candidate-skill-list">

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

                                    ))}

                                </div>

                            ) : (

                                <p>
                                    No skills provided.
                                </p>

                            )}

                        </div>

                    </DetailsSection>


                    <DetailsSection
                        icon="bi-star"
                        eyebrow="Recruiter Scorecard"
                        title="Candidate Evaluation"
                    >

                        {evaluation ? (

                            <div className="recruiter-candidate-evaluation-summary">

                                <div className="recruiter-candidate-evaluation-overall">

                                    <span>
                                        Overall Score
                                    </span>

                                    <strong>

                                        {formatEvaluationScore(
                                            evaluation
                                        )}

                                    </strong>

                                    <StarDisplay
                                        value={
                                            Math.round(
                                                getEvaluationScore(
                                                    evaluation
                                                ) ||
                                                0
                                            )
                                        }
                                    />

                                </div>


                                <div className="recruiter-candidate-evaluation-breakdown">

                                    <EvaluationMetric
                                        label="Technical Skills"
                                        value={
                                            evaluation.technicalSkills
                                        }
                                    />

                                    <EvaluationMetric
                                        label="Communication"
                                        value={
                                            evaluation.communication
                                        }
                                    />

                                    <EvaluationMetric
                                        label="Relevant Experience"
                                        value={
                                            evaluation.relevantExperience
                                        }
                                    />

                                    <EvaluationMetric
                                        label="Culture Fit"
                                        value={
                                            evaluation.cultureFit
                                        }
                                    />

                                    <EvaluationMetric
                                        label="Interview Performance"
                                        value={
                                            evaluation.interviewPerformance
                                        }
                                    />

                                </div>


                                {evaluation.privateNotes && (

                                    <div className="recruiter-candidate-evaluation-notes">

                                        <span>
                                            Private Recruiter Notes
                                        </span>

                                        <p>
                                            {evaluation.privateNotes}
                                        </p>

                                    </div>

                                )}

                            </div>

                        ) : (

                            <div className="recruiter-candidate-no-evaluation">

                                <i className="bi bi-star"></i>

                                <div>

                                    <strong>
                                        Candidate not evaluated yet
                                    </strong>

                                    <span>
                                        Add a recruiter scorecard for this candidate.
                                    </span>

                                </div>

                            </div>

                        )}


                        <button
                            type="button"
                            className="recruiter-candidate-evaluate-from-details"
                            onClick={
                                onEvaluate
                            }
                        >

                            <i className="bi bi-star"></i>

                            {evaluation
                                ? "Edit Evaluation"
                                : "Evaluate Candidate"
                            }

                        </button>

                    </DetailsSection>


                    {(
                        application.status ===
                        "SELECTED" ||
                        offer
                    ) && (

                        <DetailsSection
                            icon="bi-envelope-paper"
                            eyebrow="Offer Management"
                            title="Job Offer"
                        >

                            {offer ? (

                                <div className="recruiter-candidate-offer-summary">

                                    <div className="recruiter-candidate-offer-top">

                                        <div>

                                            <small>
                                                Offered Compensation
                                            </small>

                                            <strong>

                                                {formatMoney(
                                                    offer.offeredSalary,
                                                    offer.currency
                                                )}

                                            </strong>

                                        </div>

                                        <OfferStatusBadge
                                            offer={
                                                offer
                                            }
                                        />

                                    </div>

                                    {offer.status ===
                                        "ACCEPTED" && (

                                        <div className="recruiter-candidate-hire-confirmed">

                                            <i className="bi bi-patch-check-fill"></i>

                                            <div>
                                                <span>
                                                    Hiring Confirmed
                                                </span>

                                                <strong>
                                                    Candidate accepted the offer
                                                </strong>

                                                <p>
                                                    Planned joining date:{" "}
                                                    {formatDateOnly(
                                                        offer.joiningDate
                                                    )}
                                                </p>
                                            </div>

                                        </div>
                                    )}


                                    <div className="recruiter-candidate-offer-grid">

                                        <InfoBox
                                            label="Joining Date"
                                            value={
                                                formatDateOnly(
                                                    offer.joiningDate
                                                )
                                            }
                                        />

                                        <InfoBox
                                            label="Offer Expires"
                                            value={
                                                formatDateTime(
                                                    offer.expiresAt
                                                )
                                            }
                                        />

                                        <InfoBox
                                            label="Sent At"
                                            value={
                                                offer.sentAt
                                                    ? formatDateTime(
                                                        offer.sentAt
                                                    )
                                                    : "Not sent yet"
                                            }
                                        />

                                        <InfoBox
                                            label="Responded At"
                                            value={
                                                offer.respondedAt
                                                    ? formatDateTime(
                                                        offer.respondedAt
                                                    )
                                                    : "No response yet"
                                            }
                                        />

                                    </div>

                                    {offer.message && (

                                        <div className="recruiter-candidate-offer-message">

                                            <span>
                                                Offer Message
                                            </span>

                                            <p>
                                                {offer.message}
                                            </p>

                                        </div>

                                    )}

                                </div>

                            ) : (

                                <div className="recruiter-candidate-no-offer">

                                    <i className="bi bi-envelope-plus"></i>

                                    <div>

                                        <strong>
                                            No job offer created yet
                                        </strong>

                                        <span>
                                            Create an offer for this selected candidate.
                                        </span>

                                    </div>

                                </div>

                            )}

                            <div className="recruiter-candidate-offer-detail-actions">

                                <button
                                    type="button"
                                    className="recruiter-candidate-offer-from-details"
                                    onClick={
                                        onOffer
                                    }
                                >

                                    <i className="bi bi-envelope-paper"></i>

                                    {!offer
                                        ? "Create Offer"
                                        : offer.status ===
                                            "DRAFT"
                                            ? "Edit Offer"
                                            : offer.status ===
                                                "ACCEPTED"
                                                ? "View Hire Details"
                                                : "View Offer"
                                    }

                                </button>


                                {offer?.status ===
                                    "ACCEPTED" && (

                                    <Link
                                        to="/recruiter/onboarding"
                                        className="recruiter-candidate-onboarding-link"
                                    >

                                        <i className="bi bi-person-workspace"></i>

                                        Manage Onboarding

                                    </Link>

                                )}

                            </div>

                        </DetailsSection>

                    )}


                    <DetailsSection
                        icon="bi-file-earmark-check"
                        eyebrow="Application"
                        title="Application Details"
                    >

                        <div className="recruiter-candidate-application-grid">

                            <InfoBox
                                label="Application ID"
                                value={
                                    `#${getApplicationId(
                                        application
                                    )}`
                                }
                            />

                            <InfoBox
                                label="Candidate ID"
                                value={
                                    getCandidateId(
                                        application
                                    )
                                        ? `#${getCandidateId(
                                            application
                                        )}`
                                        : "Not available"
                                }
                            />

                            <InfoBox
                                label="Position"
                                value={
                                    getJobTitle(
                                        application,
                                        jobId
                                    )
                                }
                            />

                            <InfoBox
                                label="Applied"
                                value={
                                    formatDateTime(
                                        application.appliedAt
                                    )
                                }
                            />

                        </div>


                        <div className="recruiter-candidate-cover-letter-full">

                            <strong>
                                Cover Letter
                            </strong>

                            <p>

                                {getCoverLetter(
                                    application
                                ) ||
                                    "No cover letter submitted."
                                }

                            </p>

                        </div>


                        <div className="recruiter-candidate-resume-row">

                            <span>
                                Submitted Resume
                            </span>

                            {getResumeUrl(
                                application
                            ) ? (

                                <a
                                    href={
                                        getResumeUrl(
                                            application
                                        )
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                >

                                    <i className="bi bi-file-earmark-pdf"></i>

                                    View Resume

                                </a>

                            ) : (

                                <span className="recruiter-candidate-no-resume">
                                    No Resume
                                </span>

                            )}

                        </div>

                    </DetailsSection>


                    <DetailsSection
                        icon="bi-clock-history"
                        eyebrow="Timeline"
                        title="Application History"
                    >

                        {historyLoading ? (

                            <InlineLoading
                                text="Loading history..."
                            />

                        ) : history.length ===
                            0 ? (

                            <DetailsEmpty
                                icon="bi-clock-history"
                                text="No history found."
                            />

                        ) : (

                            <StatusTimeline
                                history={
                                    history
                                }
                            />

                        )}

                    </DetailsSection>


                    <DetailsSection
                        icon="bi-diagram-3"
                        eyebrow="Interview"
                        title="Interview Rounds"
                    >

                        {interviewsLoading ? (

                            <InlineLoading
                                text="Loading interview rounds..."
                            />

                        ) : interviews.length ===
                            0 ? (

                            <DetailsEmpty
                                icon="bi-calendar2"
                                text="No interview rounds."
                            />

                        ) : (

                            <div className="recruiter-candidate-round-list">

                                {interviews.map(
                                    (
                                        interview,
                                        index
                                    ) => (

                                    <div
                                        className="recruiter-candidate-round-card"
                                        key={
                                            interview.id ||
                                            index
                                        }
                                    >

                                        <div className="recruiter-candidate-round-header">

                                            <div>

                                                <span>

                                                    Round{" "}

                                                    {interview.roundNumber ||
                                                        index + 1
                                                    }

                                                </span>

                                                <strong>

                                                    {getInterviewRoundLabel(
                                                        interview
                                                    )}

                                                </strong>

                                            </div>

                                            <span
                                                className={
                                                    `recruiter-interview-status ${getInterviewStatusClass(
                                                        interview.status
                                                    )}`
                                                }
                                            >

                                                {formatStatus(
                                                    interview.status
                                                )}

                                            </span>

                                        </div>

                                        <div className="recruiter-candidate-round-grid">

                                            <ProfileItem
                                                icon="bi-calendar3"
                                                label="Schedule"
                                                value={
                                                    formatDateTime(
                                                        interview.scheduledAt
                                                    )
                                                }
                                            />

                                            <ProfileItem
                                                icon={
                                                    interview.mode ===
                                                    "ONLINE"
                                                        ? "bi-camera-video"
                                                        : "bi-geo-alt"
                                                }
                                                label="Mode"
                                                value={
                                                    formatStatus(
                                                        interview.mode
                                                    )
                                                }
                                            />

                                        </div>

                                        {interview.meetingLink && (

                                            <div className="recruiter-candidate-round-contact">

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

                                        )}

                                        {interview.location && (

                                            <div className="recruiter-candidate-round-contact">

                                                <strong>
                                                    {interview.location}
                                                </strong>

                                            </div>

                                        )}

                                        {interview.notes && (

                                            <div className="recruiter-candidate-round-notes">

                                                {interview.notes}

                                            </div>

                                        )}

                                    </div>

                                ))}

                            </div>

                        )}

                    </DetailsSection>

                </div>


                <div className="recruiter-candidate-details-footer">

                    <button
                        type="button"
                        className="recruiter-candidate-details-close-button"
                        onClick={
                            onClose
                        }
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
}


// =====================================================
// COMPARISON MODAL
// =====================================================

function CandidateComparisonModal({
    candidates,
    getInterviewsForApplication,
    getCompletedInterviewRounds,
    getScheduledInterviewRounds,
    evaluations,
    evaluationsLoading,
    offers,
    onClose,
    onClear
}) {

    const rankedCandidates =
        useMemo(
            () =>
                [
                    ...candidates
                ].sort(
                    (
                        first,
                        second
                    ) => {

                        const firstScore =
                            getEvaluationScore(
                                evaluations[
                                    String(
                                        getApplicationId(
                                            first
                                        )
                                    )
                                ]
                            ) ??
                            -1;

                        const secondScore =
                            getEvaluationScore(
                                evaluations[
                                    String(
                                        getApplicationId(
                                            second
                                        )
                                    )
                                ]
                            ) ??
                            -1;

                        return (
                            secondScore -
                            firstScore
                        );
                    }
                ),
            [
                candidates,
                evaluations
            ]
        );

    return (

        <div
            className="recruiter-comparison-overlay"
            onMouseDown={
                onClose
            }
        >

            <div
                className="recruiter-comparison-modal"
                onMouseDown={
                    (
                        event
                    ) =>
                        event.stopPropagation()
                }
            >

                <div className="recruiter-comparison-header">

                    <div>

                        <span>
                            Candidate Evaluation
                        </span>

                        <h3>
                            Compare Candidates
                        </h3>

                        <p>
                            Candidates with recruiter evaluations are ranked by overall score.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                    >

                        <i className="bi bi-x-lg"></i>

                    </button>

                </div>


                <div className="recruiter-comparison-body">

                    <div className="recruiter-comparison-scroll">

                        <div
                            className="recruiter-comparison-grid"
                            style={{
                                gridTemplateColumns:
                                    `repeat(${rankedCandidates.length}, minmax(255px, 1fr))`
                            }}
                        >

                            {rankedCandidates.map(
                                (
                                    application,
                                    candidateIndex
                                ) => {

                                    const applicationId =
                                        getApplicationId(
                                            application
                                        );

                                    const evaluation =
                                        evaluations[
                                            String(
                                                applicationId
                                            )
                                        ] ||
                                        null;

                                    const offer =
                                        offers[
                                            String(
                                                applicationId
                                            )
                                        ] ||
                                        null;

                                    const rounds =
                                        getInterviewsForApplication(
                                            application
                                        );

                                    const latestRound =
                                        rounds[
                                            rounds.length - 1
                                        ] ||
                                        null;

                                    const completedRounds =
                                        getCompletedInterviewRounds(
                                            application
                                        );

                                    const scheduledRounds =
                                        getScheduledInterviewRounds(
                                            application
                                        );

                                    const experience =
                                        getCandidateExperience(
                                            application
                                        );

                                    const skills =
                                        getSkillList(
                                            application
                                        );

                                    return (

                                        <article
                                            className="recruiter-comparison-column"
                                            key={
                                                applicationId
                                            }
                                        >

                                            <div className="recruiter-comparison-candidate">

                                                <div className="recruiter-comparison-avatar">

                                                    {getCandidateName(
                                                        application
                                                    )
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}

                                                </div>

                                                <small className="recruiter-comparison-application-id">

                                                    Application #{applicationId}

                                                </small>

                                                <h4>

                                                    {getCandidateName(
                                                        application
                                                    )}

                                                </h4>

                                                <p>

                                                    {getCandidateEmail(
                                                        application
                                                    )}

                                                </p>

                                                <span
                                                    className={
                                                        `recruiter-application-status ${getStatusClass(
                                                            application.status
                                                        )}`
                                                    }
                                                >

                                                    {formatStatus(
                                                        application.status
                                                    )}

                                                </span>

                                                <span className="recruiter-comparison-rank">

                                                    Rank #{candidateIndex + 1}

                                                </span>

                                            </div>


                                            <div className="recruiter-comparison-section recruiter-comparison-evaluation-section">

                                                <label>

                                                    <i className="bi bi-star"></i>

                                                    Recruiter Evaluation

                                                </label>

                                                {evaluationsLoading ? (

                                                    <span className="recruiter-comparison-empty-value">
                                                        Loading score...
                                                    </span>

                                                ) : evaluation ? (

                                                    <>

                                                        <div className="recruiter-comparison-overall-score">

                                                            <strong>

                                                                {formatEvaluationScore(
                                                                    evaluation
                                                                )}

                                                            </strong>

                                                            <StarDisplay
                                                                value={
                                                                    Math.round(
                                                                        getEvaluationScore(
                                                                            evaluation
                                                                        ) ||
                                                                        0
                                                                    )
                                                                }
                                                            />

                                                        </div>

                                                        <div className="recruiter-comparison-score-grid">

                                                            <EvaluationCompactMetric
                                                                label="Technical"
                                                                value={
                                                                    evaluation.technicalSkills
                                                                }
                                                            />

                                                            <EvaluationCompactMetric
                                                                label="Communication"
                                                                value={
                                                                    evaluation.communication
                                                                }
                                                            />

                                                            <EvaluationCompactMetric
                                                                label="Experience"
                                                                value={
                                                                    evaluation.relevantExperience
                                                                }
                                                            />

                                                            <EvaluationCompactMetric
                                                                label="Culture"
                                                                value={
                                                                    evaluation.cultureFit
                                                                }
                                                            />

                                                            <EvaluationCompactMetric
                                                                label="Interview"
                                                                value={
                                                                    evaluation.interviewPerformance
                                                                }
                                                            />

                                                        </div>

                                                    </>

                                                ) : (

                                                    <span className="recruiter-comparison-empty-value">
                                                        Not evaluated
                                                    </span>

                                                )}

                                            </div>


                                            <ComparisonItem
                                                icon="bi-envelope-paper"
                                                label="Job Offer"
                                                value={
                                                    offer
                                                        ? `${formatStatus(offer.status)} • ${formatMoney(
                                                            offer.offeredSalary,
                                                            offer.currency
                                                        )}`
                                                        : "Not created"
                                                }
                                            />

                                            <ComparisonItem
                                                icon="bi-person-workspace"
                                                label="Experience"
                                                value={
                                                    experience !==
                                                    null
                                                        ? `${experience} year(s)`
                                                        : "Not provided"
                                                }
                                            />

                                            <ComparisonItem
                                                icon="bi-geo-alt"
                                                label="Location"
                                                value={
                                                    getCandidateLocation(
                                                        application
                                                    ) ||
                                                    "Not provided"
                                                }
                                            />

                                            <ComparisonItem
                                                icon="bi-mortarboard"
                                                label="Education"
                                                value={
                                                    getCandidateEducation(
                                                        application
                                                    ) ||
                                                    "Not provided"
                                                }
                                            />

                                            <ComparisonItem
                                                icon="bi-telephone"
                                                label="Phone"
                                                value={
                                                    getCandidatePhone(
                                                        application
                                                    ) ||
                                                    "Not provided"
                                                }
                                            />

                                            <ComparisonItem
                                                icon="bi-calendar-check"
                                                label="Applied"
                                                value={
                                                    formatDateTime(
                                                        application.appliedAt
                                                    )
                                                }
                                            />


                                            <div className="recruiter-comparison-section">

                                                <label>

                                                    <i className="bi bi-tools"></i>

                                                    Skills

                                                </label>

                                                {skills.length ? (

                                                    <div className="recruiter-comparison-skills">

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

                                                        ))}

                                                    </div>

                                                ) : (

                                                    <span className="recruiter-comparison-empty-value">
                                                        Not provided
                                                    </span>

                                                )}

                                            </div>


                                            <div className="recruiter-comparison-section">

                                                <label>

                                                    <i className="bi bi-diagram-3"></i>

                                                    Interview Progress

                                                </label>

                                                <div className="recruiter-comparison-interview-stats">

                                                    <div>

                                                        <strong>
                                                            {rounds.length}
                                                        </strong>

                                                        <span>
                                                            Total
                                                        </span>

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {completedRounds}
                                                        </strong>

                                                        <span>
                                                            Completed
                                                        </span>

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {scheduledRounds}
                                                        </strong>

                                                        <span>
                                                            Scheduled
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>


                                            <div className="recruiter-comparison-section">

                                                <label>
                                                    Latest Interview
                                                </label>

                                                {latestRound ? (

                                                    <div className="recruiter-comparison-latest-round">

                                                        <strong>

                                                            Round{" "}

                                                            {latestRound.roundNumber ||
                                                                rounds.length
                                                            }

                                                            {" — "}

                                                            {getInterviewRoundLabel(
                                                                latestRound
                                                            )}

                                                        </strong>

                                                        <span
                                                            className={
                                                                `recruiter-interview-status ${getInterviewStatusClass(
                                                                    latestRound.status
                                                                )}`
                                                            }
                                                        >

                                                            {formatStatus(
                                                                latestRound.status
                                                            )}

                                                        </span>

                                                    </div>

                                                ) : (

                                                    <span className="recruiter-comparison-empty-value">
                                                        No interview yet
                                                    </span>

                                                )}

                                            </div>


                                            <div className="recruiter-comparison-section">

                                                <label>
                                                    Cover Letter
                                                </label>

                                                <p className="recruiter-comparison-cover-letter">

                                                    {getCoverLetter(
                                                        application
                                                    )
                                                        ? getCoverLetter(
                                                            application
                                                        ).length >
                                                        180
                                                            ? `${getCoverLetter(
                                                                application
                                                            ).substring(
                                                                0,
                                                                180
                                                            )}...`
                                                            : getCoverLetter(
                                                                application
                                                            )
                                                        : "Not submitted"
                                                    }

                                                </p>

                                            </div>


                                            <div className="recruiter-comparison-resume">

                                                {getResumeUrl(
                                                    application
                                                ) ? (

                                                    <a
                                                        href={
                                                            getResumeUrl(
                                                                application
                                                            )
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >

                                                        <i className="bi bi-file-earmark-pdf"></i>

                                                        View Resume

                                                    </a>

                                                ) : (

                                                    <span>
                                                        No Resume
                                                    </span>

                                                )}

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </div>


                <div className="recruiter-comparison-footer">

                    <span>
                        Comparing {rankedCandidates.length} candidates
                    </span>

                    <div>

                        <button
                            type="button"
                            className="recruiter-comparison-clear-button"
                            onClick={
                                onClear
                            }
                        >
                            Clear Selection
                        </button>

                        <button
                            type="button"
                            className="recruiter-comparison-close-button"
                            onClick={
                                onClose
                            }
                        >
                            Done
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}


// =====================================================
// EVALUATION MODAL
// =====================================================

function CandidateEvaluationModal({
    application,
    evaluation,
    form,
    loading,
    submitting,
    deleting,
    onRatingChange,
    onNotesChange,
    onSubmit,
    onDelete,
    onClose
}) {

    const scoreValues = [
        Number(
            form.technicalSkills
        ),
        Number(
            form.communication
        ),
        Number(
            form.relevantExperience
        ),
        Number(
            form.cultureFit
        ),
        Number(
            form.interviewPerformance
        )
    ];

    const validScores =
        scoreValues.filter(
            (
                score
            ) =>
                Number.isFinite(
                    score
                ) &&
                score >= 1 &&
                score <= 5
        );

    const previewScore =
        validScores.length ===
        5
            ? validScores.reduce(
                (
                    total,
                    score
                ) =>
                    total + score,
                0
            ) / 5
            : null;

    return (

        <div
            className="recruiter-evaluation-overlay"
            onMouseDown={
                onClose
            }
        >

            <div
                className="recruiter-evaluation-modal"
                onMouseDown={
                    (
                        event
                    ) =>
                        event.stopPropagation()
                }
            >

                <div className="recruiter-evaluation-header">

                    <div>

                        <span>
                            Recruiter Scorecard
                        </span>

                        <h3>

                            Evaluate{" "}

                            {getCandidateName(
                                application
                            )}

                        </h3>

                        <p>
                            Rate each category from 1 to 5. Notes are private to the recruiter.
                        </p>

                    </div>

                    <button
                        type="button"
                        disabled={
                            submitting ||
                            deleting
                        }
                        onClick={
                            onClose
                        }
                    >

                        <i className="bi bi-x-lg"></i>

                    </button>

                </div>


                {loading ? (

                    <div className="recruiter-evaluation-loading">

                        <span className="spinner-border text-primary"></span>

                        <p>
                            Loading candidate evaluation...
                        </p>

                    </div>

                ) : (

                    <form
                        onSubmit={
                            onSubmit
                        }
                    >

                        <div className="recruiter-evaluation-body">

                            <div className="recruiter-evaluation-candidate-summary">

                                <div className="recruiter-evaluation-avatar">

                                    {getCandidateName(
                                        application
                                    )
                                        .charAt(
                                            0
                                        )
                                        .toUpperCase()}

                                </div>

                                <div className="recruiter-evaluation-candidate-info">

                                    <strong>

                                        {getCandidateName(
                                            application
                                        )}

                                    </strong>

                                    <span>

                                        {getCandidateEmail(
                                            application
                                        )}

                                    </span>

                                </div>


                                <div className="recruiter-evaluation-preview-score">

                                    <small>
                                        Overall Score
                                    </small>

                                    <strong>

                                        {previewScore ===
                                        null
                                            ? "—"
                                            : previewScore.toFixed(
                                                1
                                            )
                                        }

                                    </strong>

                                    <span>
                                        / 5
                                    </span>

                                </div>

                            </div>


                            <div className="recruiter-evaluation-rating-list">

                                <RatingField
                                    label="Technical Skills"
                                    description="Programming, architecture and technical problem solving."
                                    field="technicalSkills"
                                    value={
                                        form.technicalSkills
                                    }
                                    onChange={
                                        onRatingChange
                                    }
                                />

                                <RatingField
                                    label="Communication"
                                    description="Clarity, listening and ability to explain ideas."
                                    field="communication"
                                    value={
                                        form.communication
                                    }
                                    onChange={
                                        onRatingChange
                                    }
                                />

                                <RatingField
                                    label="Relevant Experience"
                                    description="Depth and relevance of prior professional experience."
                                    field="relevantExperience"
                                    value={
                                        form.relevantExperience
                                    }
                                    onChange={
                                        onRatingChange
                                    }
                                />

                                <RatingField
                                    label="Culture Fit"
                                    description="Team alignment, attitude and collaboration."
                                    field="cultureFit"
                                    value={
                                        form.cultureFit
                                    }
                                    onChange={
                                        onRatingChange
                                    }
                                />

                                <RatingField
                                    label="Interview Performance"
                                    description="Performance across interview rounds."
                                    field="interviewPerformance"
                                    value={
                                        form.interviewPerformance
                                    }
                                    onChange={
                                        onRatingChange
                                    }
                                />

                            </div>


                            <div className="recruiter-evaluation-notes-field">

                                <label>
                                    Private Recruiter Notes
                                </label>

                                <textarea
                                    rows="5"
                                    maxLength="4000"
                                    value={
                                        form.privateNotes
                                    }
                                    onChange={
                                        onNotesChange
                                    }
                                    placeholder="Strengths, concerns, observations and recommendation..."
                                />

                                <small>
                                    {form.privateNotes.length} / 4000
                                </small>

                            </div>

                        </div>


                        <div className="recruiter-evaluation-footer">

                            <div>

                                {evaluation && (

                                    <button
                                        type="button"
                                        className="recruiter-evaluation-delete"
                                        disabled={
                                            submitting ||
                                            deleting
                                        }
                                        onClick={
                                            onDelete
                                        }
                                    >

                                        {deleting
                                            ? "Deleting..."
                                            : "Delete Evaluation"
                                        }

                                    </button>

                                )}

                            </div>


                            <div>

                                <button
                                    type="button"
                                    className="recruiter-evaluation-cancel"
                                    disabled={
                                        submitting ||
                                        deleting
                                    }
                                    onClick={
                                        onClose
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="recruiter-evaluation-save"
                                    disabled={
                                        submitting ||
                                        deleting
                                    }
                                >

                                    {submitting
                                        ? "Saving..."
                                        : evaluation
                                            ? "Update Evaluation"
                                            : "Save Evaluation"
                                    }

                                </button>

                            </div>

                        </div>

                    </form>

                )}

            </div>

        </div>
    );
}


// =====================================================
// JOB OFFER MODAL
// =====================================================

function JobOfferModal({
    application,
    offer,
    form,
    loading,
    submitting,
    actionBusy,
    onChange,
    onSubmit,
    onSend,
    onWithdraw,
    onPreviewLetter,
    onDownloadLetter,
    letterBusy,
    onClose
}) {

    const editable =
        !offer ||
        offer.status ===
        "DRAFT";

    return (

        <div
            className="recruiter-offer-overlay"
            onMouseDown={
                onClose
            }
        >

            <div
                className="recruiter-offer-modal"
                onMouseDown={
                    (
                        event
                    ) =>
                        event.stopPropagation()
                }
            >

                <div className="recruiter-offer-modal-header">

                    <div>

                        <span>
                            Job Offer Management
                        </span>

                        <h3>

                            {getCandidateName(
                                application
                            )}

                        </h3>

                        <p>

                            {offer
                                ? `Offer #${offer.id} • ${formatStatus(offer.status)}`
                                : "Create a new job offer for this selected candidate."
                            }

                        </p>

                    </div>

                    <button
                        type="button"
                        disabled={
                            submitting ||
                            actionBusy
                        }
                        onClick={
                            onClose
                        }
                    >

                        <i className="bi bi-x-lg"></i>

                    </button>

                </div>


                {loading ? (

                    <div className="recruiter-offer-loading">

                        <span className="spinner-border text-primary"></span>

                        <p>
                            Loading job offer...
                        </p>

                    </div>

                ) : (

                    <form
                        onSubmit={
                            onSubmit
                        }
                    >

                        <div className="recruiter-offer-modal-body">

                            <div className="recruiter-offer-candidate-banner">

                                <div className="recruiter-offer-candidate-avatar">

                                    {getCandidateName(
                                        application
                                    )
                                        .charAt(
                                            0
                                        )
                                        .toUpperCase()}

                                </div>

                                <div>

                                    <strong>

                                        {getCandidateName(
                                            application
                                        )}

                                    </strong>

                                    <span>

                                        {getCandidateEmail(
                                            application
                                        )}

                                    </span>

                                </div>

                                {offer && (

                                    <OfferStatusBadge
                                        offer={
                                            offer
                                        }
                                    />

                                )}

                            </div>


                            {offer?.status ===
                                "ACCEPTED" && (

                                <div className="recruiter-offer-hire-confirmed-modal">

                                    <div>
                                        <i className="bi bi-patch-check-fill"></i>
                                    </div>

                                    <span>
                                        <small>
                                            Hiring Confirmed
                                        </small>

                                        <strong>
                                            Candidate accepted this job offer.
                                        </strong>

                                        <p>
                                            Joining date:{" "}
                                            {formatDateOnly(
                                                offer.joiningDate
                                            )}
                                            {offer.respondedAt
                                                ? ` • Accepted ${formatDateTime(
                                                    offer.respondedAt
                                                )}`
                                                : ""
                                            }
                                        </p>
                                    </span>

                                </div>
                            )}


                            {!editable && (

                                <div className="recruiter-offer-readonly-notice">

                                    <i className="bi bi-lock"></i>

                                    <span>
                                        {offer?.status ===
                                            "ACCEPTED"
                                            ? "This hire is confirmed. The accepted offer is read-only."
                                            : `This offer is no longer editable because its status is ${formatStatus(
                                                offer.status
                                            )}.`
                                        }
                                    </span>

                                </div>

                            )}


                            <div className="recruiter-offer-form-grid">

                                <div className="recruiter-offer-form-group">

                                    <label>
                                        Annual Compensation *
                                    </label>

                                    <input
                                        type="number"
                                        name="offeredSalary"
                                        min="1"
                                        step="1"
                                        value={
                                            form.offeredSalary
                                        }
                                        disabled={
                                            !editable
                                        }
                                        onChange={
                                            onChange
                                        }
                                        placeholder="650000"
                                        required
                                    />

                                </div>


                                <div className="recruiter-offer-form-group">

                                    <label>
                                        Currency *
                                    </label>

                                    <select
                                        name="currency"
                                        value={
                                            form.currency
                                        }
                                        disabled={
                                            !editable
                                        }
                                        onChange={
                                            onChange
                                        }
                                    >

                                        <option value="INR">
                                            INR — Indian Rupee
                                        </option>

                                        <option value="USD">
                                            USD — US Dollar
                                        </option>

                                        <option value="EUR">
                                            EUR — Euro
                                        </option>

                                        <option value="GBP">
                                            GBP — British Pound
                                        </option>

                                    </select>

                                </div>


                                <div className="recruiter-offer-form-group">

                                    <label>
                                        Joining Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={
                                            form.joiningDate
                                        }
                                        disabled={
                                            !editable
                                        }
                                        onChange={
                                            onChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="recruiter-offer-form-group">

                                    <label>
                                        Offer Expires *
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="expiresAt"
                                        value={
                                            form.expiresAt
                                        }
                                        disabled={
                                            !editable
                                        }
                                        onChange={
                                            onChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="recruiter-offer-form-group recruiter-offer-form-full">

                                    <label>
                                        Offer Message
                                    </label>

                                    <textarea
                                        name="message"
                                        rows="5"
                                        maxLength="5000"
                                        value={
                                            form.message
                                        }
                                        disabled={
                                            !editable
                                        }
                                        onChange={
                                            onChange
                                        }
                                        placeholder="We are pleased to offer you this position..."
                                    />

                                    <small>
                                        {form.message.length} / 5000
                                    </small>

                                </div>

                            </div>


                            {offer && (

                                <div className="recruiter-offer-audit-grid">

                                    <InfoBox
                                        label="Created"
                                        value={
                                            formatDateTime(
                                                offer.createdAt
                                            )
                                        }
                                    />

                                    <InfoBox
                                        label="Last Updated"
                                        value={
                                            formatDateTime(
                                                offer.updatedAt
                                            )
                                        }
                                    />

                                    <InfoBox
                                        label="Sent"
                                        value={
                                            offer.sentAt
                                                ? formatDateTime(
                                                    offer.sentAt
                                                )
                                                : "Not sent"
                                        }
                                    />

                                    <InfoBox
                                        label="Candidate Response"
                                        value={
                                            offer.respondedAt
                                                ? formatDateTime(
                                                    offer.respondedAt
                                                )
                                                : "No response"
                                        }
                                    />

                                </div>

                            )}

                        </div>


                        <div className="recruiter-offer-modal-footer">

                            <div className="recruiter-offer-footer-left">

                                {offer && (

                                    <div className="recruiter-offer-letter-actions">

                                        <button
                                            type="button"
                                            className="recruiter-offer-preview-letter-button"
                                            disabled={
                                                submitting ||
                                                actionBusy ||
                                                letterBusy
                                            }
                                            onClick={
                                                () =>
                                                    onPreviewLetter(
                                                        offer
                                                    )
                                            }
                                        >

                                            <i className="bi bi-eye"></i>

                                            {letterBusy
                                                ? "Preparing..."
                                                : offer.status ===
                                                    "DRAFT"
                                                    ? "Preview Draft Letter"
                                                    : "Preview Letter"
                                            }

                                        </button>

                                        <button
                                            type="button"
                                            className="recruiter-offer-download-letter-button"
                                            disabled={
                                                submitting ||
                                                actionBusy ||
                                                letterBusy
                                            }
                                            onClick={
                                                () =>
                                                    onDownloadLetter(
                                                        offer
                                                    )
                                            }
                                        >

                                            <i className="bi bi-file-earmark-pdf"></i>

                                            Download PDF

                                        </button>

                                    </div>

                                )}

                                {offer?.status ===
                                    "SENT" && (

                                    <button
                                        type="button"
                                        className="recruiter-offer-withdraw-button"
                                        disabled={
                                            submitting ||
                                            actionBusy ||
                                            letterBusy
                                        }
                                        onClick={
                                            onWithdraw
                                        }
                                    >

                                        <i className="bi bi-slash-circle"></i>

                                        {actionBusy
                                            ? "Processing..."
                                            : "Withdraw Offer"
                                        }

                                    </button>

                                )}


                                {offer?.status ===
                                    "ACCEPTED" && (

                                    <Link
                                        to="/recruiter/onboarding"
                                        className="recruiter-offer-onboarding-link"
                                    >

                                        <i className="bi bi-person-workspace"></i>

                                        Manage Onboarding

                                    </Link>

                                )}

                            </div>


                            <div>

                                <button
                                    type="button"
                                    className="recruiter-offer-close-button"
                                    disabled={
                                        submitting ||
                                        actionBusy
                                    }
                                    onClick={
                                        onClose
                                    }
                                >
                                    Close
                                </button>

                                {editable && (

                                    <button
                                        type="submit"
                                        className="recruiter-offer-save-button"
                                        disabled={
                                            submitting ||
                                            actionBusy
                                        }
                                    >

                                        {submitting
                                            ? "Saving..."
                                            : offer
                                                ? "Update Draft"
                                                : "Save Draft"
                                        }

                                    </button>

                                )}

                                {offer?.status ===
                                    "DRAFT" && (

                                    <button
                                        type="button"
                                        className="recruiter-offer-send-button"
                                        disabled={
                                            submitting ||
                                            actionBusy
                                        }
                                        onClick={
                                            onSend
                                        }
                                    >

                                        <i className="bi bi-send"></i>

                                        {actionBusy
                                            ? "Sending..."
                                            : "Send Offer"
                                        }

                                    </button>

                                )}

                            </div>

                        </div>

                    </form>

                )}

            </div>

        </div>
    );
}


// =====================================================
// OFFER STATUS BADGE
// =====================================================

function OfferStatusBadge({
    offer
}) {

    return (

        <span
            className={
                `recruiter-offer-status-badge ${getOfferStatusClass(
                    offer?.status
                )}`
            }
        >

            <i className="bi bi-envelope-paper"></i>

            {formatStatus(
                offer?.status
            )}

        </span>
    );
}


// =====================================================
// RATING FIELD
// =====================================================

function RatingField({
    label,
    description,
    field,
    value,
    onChange
}) {

    return (

        <div className="recruiter-rating-field">

            <div>

                <strong>
                    {label}
                </strong>

                <span>
                    {description}
                </span>

            </div>

            <div className="recruiter-star-rating">

                {[
                    1,
                    2,
                    3,
                    4,
                    5
                ].map(
                    (
                        star
                    ) => (

                    <button
                        key={
                            star
                        }
                        type="button"
                        className={
                            Number(
                                value
                            ) >=
                            star
                                ? "active"
                                : ""
                        }
                        title={`${star} out of 5`}
                        onClick={
                            () =>
                                onChange(
                                    field,
                                    star
                                )
                        }
                    >

                        <i
                            className={
                                Number(
                                    value
                                ) >=
                                star
                                    ? "bi bi-star-fill"
                                    : "bi bi-star"
                            }
                        ></i>

                    </button>

                ))}

                <strong>

                    {Number(
                        value
                    ) || 0}
                    /5

                </strong>

            </div>

        </div>
    );
}


// =====================================================
// SCORE / STAR COMPONENTS
// =====================================================

function EvaluationScoreBadge({
    evaluation
}) {

    return (

        <span className="recruiter-evaluation-score-badge">

            <i className="bi bi-star-fill"></i>

            {getEvaluationScore(
                evaluation
            )?.toFixed(
                1
            )}

        </span>
    );
}


function StarDisplay({
    value
}) {

    const normalized =
        Math.max(
            0,
            Math.min(
                5,
                Number(
                    value
                ) ||
                0
            )
        );

    return (

        <span className="recruiter-star-display">

            {[
                1,
                2,
                3,
                4,
                5
            ].map(
                (
                    star
                ) => (

                <i
                    key={
                        star
                    }
                    className={
                        star <=
                        normalized
                            ? "bi bi-star-fill"
                            : "bi bi-star"
                    }
                ></i>

            ))}

        </span>
    );
}


function EvaluationMetric({
    label,
    value
}) {

    return (

        <div className="recruiter-evaluation-metric">

            <span>
                {label}
            </span>

            <div>

                <StarDisplay
                    value={
                        value
                    }
                />

                <strong>
                    {value}/5
                </strong>

            </div>

        </div>
    );
}


function EvaluationCompactMetric({
    label,
    value
}) {

    return (

        <div>

            <span>
                {label}
            </span>

            <strong>
                {value}/5
            </strong>

        </div>
    );
}


// =====================================================
// COMMON COMPONENTS
// =====================================================

function ComparisonItem({
    icon,
    label,
    value
}) {

    return (

        <div className="recruiter-comparison-section">

            <label>

                <i
                    className={
                        `bi ${icon}`
                    }
                ></i>

                {label}

            </label>

            <strong className="recruiter-comparison-value">
                {value}
            </strong>

        </div>
    );
}


function DetailsSection({
    icon,
    eyebrow,
    title,
    children
}) {

    return (

        <section className="recruiter-candidate-details-section">

            <div className="recruiter-candidate-details-section-title">

                <div>

                    <i
                        className={
                            `bi ${icon}`
                        }
                    ></i>

                </div>

                <span>

                    <small>
                        {eyebrow}
                    </small>

                    <strong>
                        {title}
                    </strong>

                </span>

            </div>

            {children}

        </section>
    );
}


function ProfileItem({
    icon,
    label,
    value
}) {

    return (

        <div className="recruiter-profile-item">

            <i
                className={
                    `bi ${icon}`
                }
            ></i>

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


function InfoBox({
    label,
    value
}) {

    return (

        <div className="recruiter-info-box">

            <small>
                {label}
            </small>

            <strong>
                {value}
            </strong>

        </div>
    );
}


function InlineLoading({
    text
}) {

    return (

        <div className="recruiter-candidate-details-inline-loading">

            <span className="spinner-border spinner-border-sm text-primary"></span>

            {text}

        </div>
    );
}


function DetailsEmpty({
    icon,
    text
}) {

    return (

        <div className="recruiter-candidate-details-empty">

            <i
                className={
                    `bi ${icon}`
                }
            ></i>

            <span>
                {text}
            </span>

        </div>
    );
}


// =====================================================
// STATUS TIMELINE
// =====================================================

function StatusTimeline({
    history
}) {

    return (

        <div className="recruiter-candidate-history-timeline">

            {history.map(
                (
                    item,
                    index
                ) => (

                <div
                    className="recruiter-candidate-history-item"
                    key={
                        item.id ||
                        index
                    }
                >

                    <div className="recruiter-candidate-history-axis">

                        <div className="recruiter-candidate-history-dot">

                            <i className="bi bi-check"></i>

                        </div>

                        {index <
                            history.length -
                            1 && (

                            <div className="recruiter-candidate-history-line"></div>

                        )}

                    </div>

                    <div className="recruiter-candidate-history-content">

                        <div>

                            <strong>

                                {formatStatus(
                                    item.newStatus
                                )}

                            </strong>

                            <span>

                                {formatDateTime(
                                    item.changedAt ||
                                    item.createdAt
                                )}

                            </span>

                        </div>

                        <p>

                            {item.oldStatus
                                ? `${formatStatus(
                                    item.oldStatus
                                )} → ${formatStatus(
                                    item.newStatus
                                )}`
                                : "Application submitted."
                            }

                        </p>

                        {item.changedByName && (

                            <small>

                                Updated by{" "}

                                <strong>
                                    {item.changedByName}
                                </strong>

                            </small>

                        )}

                    </div>

                </div>

            ))}

        </div>
    );
}


// =====================================================
// HISTORY MODAL
// =====================================================

function HistoryModal({
    application,
    history,
    loading,
    onClose
}) {

    return (

        <div
            className="recruiter-history-overlay"
            onMouseDown={
                onClose
            }
        >

            <div
                className="recruiter-history-modal"
                onMouseDown={
                    (
                        event
                    ) =>
                        event.stopPropagation()
                }
            >

                <div className="recruiter-history-header">

                    <div>

                        <span>
                            Candidate Progress
                        </span>

                        <h4>

                            {getCandidateName(
                                application
                            )}

                        </h4>

                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                    >

                        <i className="bi bi-x-lg"></i>

                    </button>

                </div>


                <div className="recruiter-history-body">

                    {loading ? (

                        <InlineLoading
                            text="Loading status history..."
                        />

                    ) : history.length ===
                        0 ? (

                        <DetailsEmpty
                            icon="bi-clock-history"
                            text="No status history found."
                        />

                    ) : (

                        <StatusTimeline
                            history={
                                history
                            }
                        />

                    )}

                </div>

            </div>

        </div>
    );
}


export default JobApplications;