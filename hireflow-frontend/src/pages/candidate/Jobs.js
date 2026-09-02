import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

import axiosInstance
    from "../../api/axiosInstance";

import "./Jobs.css";


function Jobs() {

    const navigate =
        useNavigate();


    const [
        searchParams,
        setSearchParams
    ] = useSearchParams();


    // =====================================================
    // JOB STATE
    // =====================================================

    const [
        jobs,
        setJobs
    ] = useState([]);


    // =====================================================
    // FILTER STATE
    //
    // Example:
    //
    // /candidate/jobs?keyword=Java&location=Kolkata
    //
    // These values automatically appear in the form.
    // =====================================================

    const [
        filters,
        setFilters
    ] = useState(
        () => ({

            keyword:
                searchParams.get(
                    "keyword"
                ) || "",

            location:
                searchParams.get(
                    "location"
                ) || "",

            employmentType:
                searchParams.get(
                    "employmentType"
                ) || "",

            minExperience:
                searchParams.get(
                    "minExperience"
                ) || "",

            maxSalary:
                searchParams.get(
                    "maxSalary"
                ) || "",

            skill:
                searchParams.get(
                    "skill"
                ) || ""
        })
    );


    const [
        loading,
        setLoading
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
        savingJobId,
        setSavingJobId
    ] = useState(null);


    // =====================================================
    // CURRENT URL QUERY
    // =====================================================

    const currentSearchQuery =
        searchParams.toString();


    // =====================================================
    // LOAD JOBS FROM URL FILTERS
    // =====================================================

    const fetchJobs =
        useCallback(
            async () => {

                setLoading(
                    true
                );

                setError(
                    ""
                );


                try {

                    const params = {};


                    const currentParams =
                        new URLSearchParams(
                            currentSearchQuery
                        );


                    // =========================================
                    // KEYWORD
                    // =========================================

                    const keyword =
                        currentParams
                            .get(
                                "keyword"
                            )
                            ?.trim();


                    if (
                        keyword
                    ) {

                        params.keyword =
                            keyword;
                    }


                    // =========================================
                    // LOCATION
                    // =========================================

                    const location =
                        currentParams
                            .get(
                                "location"
                            )
                            ?.trim();


                    if (
                        location
                    ) {

                        params.location =
                            location;
                    }


                    // =========================================
                    // EMPLOYMENT TYPE
                    // =========================================

                    const employmentType =
                        currentParams
                            .get(
                                "employmentType"
                            )
                            ?.trim();


                    if (
                        employmentType
                    ) {

                        params.employmentType =
                            employmentType;
                    }


                    // =========================================
                    // MIN EXPERIENCE
                    // =========================================

                    const minExperience =
                        currentParams
                            .get(
                                "minExperience"
                            );


                    if (
                        minExperience !==
                            null &&
                        minExperience !==
                            ""
                    ) {

                        params.minExperience =
                            minExperience;
                    }


                    // =========================================
                    // MAX SALARY
                    // =========================================

                    const maxSalary =
                        currentParams
                            .get(
                                "maxSalary"
                            );


                    if (
                        maxSalary !==
                            null &&
                        maxSalary !==
                            ""
                    ) {

                        params.maxSalary =
                            maxSalary;
                    }


                    // =========================================
                    // SKILL
                    // =========================================

                    const skill =
                        currentParams
                            .get(
                                "skill"
                            )
                            ?.trim();


                    if (
                        skill
                    ) {

                        params.skill =
                            skill;
                    }


                    // =========================================
                    // REQUEST
                    // =========================================

                    const response =
                        await axiosInstance.get(
                            "/api/jobs",
                            {
                                params
                            }
                        );


                    setJobs(
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : []
                    );

                } catch (requestError) {

                    console.error(
                        "Error loading jobs:",
                        requestError
                    );


                    console.error(
                        "Backend response:",
                        requestError
                            ?.response
                            ?.data
                    );


                    setJobs(
                        []
                    );


                    setError(
                        requestError
                            ?.response
                            ?.data
                            ?.message ||
                        "Unable to load jobs."
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            },
            [
                currentSearchQuery
            ]
        );


    // =====================================================
    // SYNC URL -> FILTER FORM
    //
    // Handles:
    //
    // Home search
    // Browser refresh
    // Browser Back
    // Browser Forward
    // =====================================================

    useEffect(
        () => {

            const currentParams =
                new URLSearchParams(
                    currentSearchQuery
                );


            setFilters({

                keyword:
                    currentParams.get(
                        "keyword"
                    ) || "",

                location:
                    currentParams.get(
                        "location"
                    ) || "",

                employmentType:
                    currentParams.get(
                        "employmentType"
                    ) || "",

                minExperience:
                    currentParams.get(
                        "minExperience"
                    ) || "",

                maxSalary:
                    currentParams.get(
                        "maxSalary"
                    ) || "",

                skill:
                    currentParams.get(
                        "skill"
                    ) || ""
            });

        },
        [
            currentSearchQuery
        ]
    );


    // =====================================================
    // LOAD WHEN URL FILTERS CHANGE
    // =====================================================

    useEffect(
        () => {

            fetchJobs();

        },
        [
            fetchJobs
        ]
    );


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setFilters(
            (previous) => ({

                ...previous,

                [name]:
                    value
            })
        );
    };


    // =====================================================
    // BUILD URL SEARCH PARAMS
    // =====================================================

    const buildSearchParams =
        () => {

            const params =
                new URLSearchParams();


            // =============================================
            // KEYWORD
            // =============================================

            if (
                filters
                    .keyword
                    .trim()
            ) {

                params.set(
                    "keyword",
                    filters
                        .keyword
                        .trim()
                );
            }


            // =============================================
            // LOCATION
            // =============================================

            if (
                filters
                    .location
                    .trim()
            ) {

                params.set(
                    "location",
                    filters
                        .location
                        .trim()
                );
            }


            // =============================================
            // EMPLOYMENT TYPE
            // =============================================

            if (
                filters
                    .employmentType
            ) {

                params.set(
                    "employmentType",
                    filters
                        .employmentType
                );
            }


            // =============================================
            // MIN EXPERIENCE
            // =============================================

            if (
                filters
                    .minExperience !==
                ""
            ) {

                params.set(
                    "minExperience",
                    filters
                        .minExperience
                );
            }


            // =============================================
            // MAX SALARY
            // =============================================

            if (
                filters
                    .maxSalary !==
                ""
            ) {

                params.set(
                    "maxSalary",
                    filters
                        .maxSalary
                );
            }


            // =============================================
            // SKILL
            // =============================================

            if (
                filters
                    .skill
                    .trim()
            ) {

                params.set(
                    "skill",
                    filters
                        .skill
                        .trim()
                );
            }


            return params;
        };


    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = (
        event
    ) => {

        event.preventDefault();


        setError(
            ""
        );

        setSuccess(
            ""
        );


        const params =
            buildSearchParams();


        const nextSearchQuery =
            params.toString();


        // =================================================
        // SAME SEARCH
        //
        // If URL is already the same, manually reload.
        // =================================================

        if (
            nextSearchQuery ===
            currentSearchQuery
        ) {

            fetchJobs();

            return;
        }


        // =================================================
        // UPDATE URL
        //
        // Example:
        //
        // /candidate/jobs
        //      ↓
        // /candidate/jobs?keyword=Java&location=Kolkata
        //
        // Updating the URL automatically triggers fetchJobs.
        // =================================================

        setSearchParams(
            params
        );
    };


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const handleClearFilters =
        () => {

            const clearedFilters = {

                keyword: "",

                location: "",

                employmentType: "",

                minExperience: "",

                maxSalary: "",

                skill: ""
            };


            setFilters(
                clearedFilters
            );


            setError(
                ""
            );


            setSuccess(
                ""
            );


            // =================================================
            // URL ALREADY HAS NO FILTERS
            // =================================================

            if (
                !currentSearchQuery
            ) {

                fetchJobs();

                return;
            }


            // =================================================
            // CLEAR URL
            //
            // Automatically reloads all jobs.
            // =================================================

            setSearchParams(
                new URLSearchParams()
            );
        };


    // =====================================================
    // SAVE JOB
    // =====================================================

    const handleSaveJob =
        async (
            jobId
        ) => {

            setSavingJobId(
                jobId
            );


            setError(
                ""
            );


            setSuccess(
                ""
            );


            try {

                await axiosInstance.post(
                    `/api/candidate/saved-jobs/${jobId}`
                );


                setSuccess(
                    "Job saved successfully."
                );

            } catch (requestError) {

                console.error(
                    "Save job error:",
                    requestError
                );


                console.error(
                    "Backend response:",
                    requestError
                        ?.response
                        ?.data
                );


                const message =
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    "Unable to save this job.";


                setError(
                    message
                );

            } finally {

                setSavingJobId(
                    null
                );
            }
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

            return (
                "Not disclosed"
            );
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
    // FORMAT EMPLOYMENT TYPE
    // =====================================================

    const formatEmploymentType = (
        type
    ) => {

        if (
            !type
        ) {

            return (
                ""
            );
        }


        return type
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
    // VIEW PUBLIC JOB DETAILS
    // =====================================================

    const handleViewJob = (
        jobId
    ) => {

        if (
            jobId === null ||
            jobId === undefined
        ) {

            return;
        }


        navigate(
            `/jobs/${jobId}`
        );
    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="candidate-jobs-page">

            <div className="container-fluid px-lg-5">


                {/* =========================================
                    PAGE HEADER
                ========================================= */}

                <div className="jobs-page-header">

                    <div>

                        <span className="jobs-eyebrow">

                            Job Marketplace

                        </span>


                        <h1>

                            Find Your Next Opportunity

                        </h1>


                        <p>

                            Search jobs that match your
                            skills, experience and career goals.

                        </p>

                    </div>


                    <div className="jobs-header-icon">

                        <i className="bi bi-briefcase-fill"></i>

                    </div>

                </div>


                {/* =========================================
                    SEARCH / FILTER AREA
                ========================================= */}

                <div className="job-filter-card">

                    <form
                        onSubmit={
                            handleSearch
                        }
                    >

                        <div className="row g-3">


                            {/* =================================
                                KEYWORD
                            ================================= */}

                            <div className="col-lg-4 col-md-6">

                                <label className="job-filter-label">

                                    Job title or keyword

                                </label>


                                <div className="job-search-input">

                                    <i className="bi bi-search"></i>


                                    <input
                                        type="text"
                                        name="keyword"
                                        value={
                                            filters.keyword
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Java Developer, React..."
                                    />

                                </div>

                            </div>


                            {/* =================================
                                LOCATION
                            ================================= */}

                            <div className="col-lg-4 col-md-6">

                                <label className="job-filter-label">

                                    Location

                                </label>


                                <div className="job-search-input">

                                    <i className="bi bi-geo-alt"></i>


                                    <input
                                        type="text"
                                        name="location"
                                        value={
                                            filters.location
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Kolkata, Bangalore..."
                                    />

                                </div>

                            </div>


                            {/* =================================
                                SKILL
                            ================================= */}

                            <div className="col-lg-4 col-md-6">

                                <label className="job-filter-label">

                                    Skill

                                </label>


                                <div className="job-search-input">

                                    <i className="bi bi-code-slash"></i>


                                    <input
                                        type="text"
                                        name="skill"
                                        value={
                                            filters.skill
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Java, Spring Boot..."
                                    />

                                </div>

                            </div>


                            {/* =================================
                                EMPLOYMENT TYPE
                            ================================= */}

                            <div className="col-lg-4 col-md-6">

                                <label className="job-filter-label">

                                    Employment Type

                                </label>


                                <select
                                    className="form-select job-select"
                                    name="employmentType"
                                    value={
                                        filters.employmentType
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">

                                        All Types

                                    </option>


                                    <option value="FULL_TIME">

                                        Full Time

                                    </option>


                                    <option value="PART_TIME">

                                        Part Time

                                    </option>


                                    <option value="CONTRACT">

                                        Contract

                                    </option>


                                    <option value="INTERNSHIP">

                                        Internship

                                    </option>

                                </select>

                            </div>


                            {/* =================================
                                EXPERIENCE
                            ================================= */}

                            <div className="col-lg-4 col-md-6">

                                <label className="job-filter-label">

                                    Minimum Experience

                                </label>


                                <select
                                    className="form-select job-select"
                                    name="minExperience"
                                    value={
                                        filters.minExperience
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">

                                        Any Experience

                                    </option>


                                    <option value="0">

                                        Fresher

                                    </option>


                                    <option value="1">

                                        1+ Years

                                    </option>


                                    <option value="2">

                                        2+ Years

                                    </option>


                                    <option value="3">

                                        3+ Years

                                    </option>


                                    <option value="5">

                                        5+ Years

                                    </option>

                                </select>

                            </div>


                            {/* =================================
                                MAX SALARY
                            ================================= */}

                            <div className="col-lg-4 col-md-6">

                                <label className="job-filter-label">

                                    Maximum Salary

                                </label>


                                <select
                                    className="form-select job-select"
                                    name="maxSalary"
                                    value={
                                        filters.maxSalary
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">

                                        Any Salary

                                    </option>


                                    <option value="300000">

                                        Up to ₹3 LPA

                                    </option>


                                    <option value="500000">

                                        Up to ₹5 LPA

                                    </option>


                                    <option value="700000">

                                        Up to ₹7 LPA

                                    </option>


                                    <option value="1000000">

                                        Up to ₹10 LPA

                                    </option>


                                    <option value="1500000">

                                        Up to ₹15 LPA

                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* =====================================
                            FILTER BUTTONS
                        ===================================== */}

                        <div className="job-filter-actions">

                            <button
                                type="button"
                                className="btn clear-filter-btn"
                                onClick={
                                    handleClearFilters
                                }
                            >

                                <i className="bi bi-arrow-counterclockwise me-2"></i>

                                Clear Filters

                            </button>


                            <button
                                type="submit"
                                className="btn search-jobs-btn"
                                disabled={
                                    loading
                                }
                            >

                                {loading ? (

                                    <>

                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                        ></span>

                                        Searching...

                                    </>

                                ) : (

                                    <>

                                        <i className="bi bi-search me-2"></i>

                                        Search Jobs

                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </div>


                {/* =========================================
                    ALERTS
                ========================================= */}

                {success && (

                    <div className="alert alert-success job-alert">

                        <i className="bi bi-check-circle-fill me-2"></i>

                        {success}

                    </div>

                )}


                {error && (

                    <div className="alert alert-danger job-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                {/* =========================================
                    RESULTS HEADER
                ========================================= */}

                <div className="jobs-results-header">

                    <div>

                        <h4>

                            Available Jobs

                        </h4>


                        <span>

                            {jobs.length}
                            {" "}

                            {jobs.length === 1

                                ? "opportunity"

                                : "opportunities"
                            }

                            {" "}found

                        </span>

                    </div>

                </div>


                {/* =========================================
                    LOADING
                ========================================= */}

                {loading && (

                    <div className="jobs-loading">

                        <div
                            className="spinner-border text-primary"
                            role="status"
                        ></div>


                        <p>

                            Finding opportunities for you...

                        </p>

                    </div>

                )}


                {/* =========================================
                    NO JOBS
                ========================================= */}

                {!loading &&
                    !error &&
                    jobs.length ===
                    0 && (

                    <div className="no-jobs-found">

                        <div className="no-jobs-icon">

                            <i className="bi bi-search"></i>

                        </div>


                        <h4>

                            No jobs found

                        </h4>


                        <p>

                            Try changing your filters or
                            search terms.

                        </p>


                        <button
                            type="button"
                            className="btn search-jobs-btn"
                            onClick={
                                handleClearFilters
                            }
                        >

                            View All Jobs

                        </button>

                    </div>

                )}


                {/* =========================================
                    JOB CARDS
                ========================================= */}

                {!loading &&
                    jobs.length >
                    0 && (

                    <div className="row g-4 pb-5">

                        {jobs.map(
                            (job) => (

                            <div
                                className="col-xl-4 col-lg-6"
                                key={
                                    job.id
                                }
                            >

                                <div className="candidate-job-card">


                                    {/* =========================
                                        CARD TOP
                                    ========================= */}

                                    <div className="job-card-top">

                                        <div className="company-logo-placeholder">

                                            {job.companyName

                                                ? job
                                                    .companyName
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()

                                                : "H"
                                            }

                                        </div>


                                        <button
                                            type="button"
                                            className="save-job-button"
                                            onClick={() =>
                                                handleSaveJob(
                                                    job.id
                                                )
                                            }
                                            disabled={
                                                savingJobId ===
                                                job.id
                                            }
                                            title="Save job"
                                        >

                                            {savingJobId ===
                                            job.id ? (

                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                ></span>

                                            ) : (

                                                <i className="bi bi-bookmark"></i>

                                            )}

                                        </button>

                                    </div>


                                    {/* =========================
                                        COMPANY
                                    ========================= */}

                                    <div className="job-company-name">

                                        {job.companyName ||
                                            "Company"}

                                    </div>


                                    {/* =========================
                                        TITLE
                                    ========================= */}

                                    <h3 className="job-title">

                                        {job.title}

                                    </h3>


                                    {/* =========================
                                        META
                                    ========================= */}

                                    <div className="job-meta">

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

                                    </div>


                                    {/* =========================
                                        EXPERIENCE + SALARY
                                    ========================= */}

                                    <div className="job-info-row">

                                        <div>

                                            <span className="job-info-label">

                                                Experience

                                            </span>


                                            <strong>

                                                {job.experienceRequired !==
                                                    null &&
                                                job.experienceRequired !==
                                                    undefined

                                                    ? `${job.experienceRequired}+ yrs`

                                                    : "Not specified"
                                                }

                                            </strong>

                                        </div>


                                        <div>

                                            <span className="job-info-label">

                                                Salary

                                            </span>


                                            <strong>

                                                {job.salaryMin !==
                                                    null &&
                                                job.salaryMin !==
                                                    undefined &&
                                                job.salaryMax !==
                                                    null &&
                                                job.salaryMax !==
                                                    undefined

                                                    ? `${formatSalary(
                                                        job.salaryMin
                                                    )} - ${formatSalary(
                                                        job.salaryMax
                                                    )}`

                                                    : job.salaryMin !==
                                                        null &&
                                                    job.salaryMin !==
                                                        undefined

                                                        ? `From ${formatSalary(
                                                            job.salaryMin
                                                        )}`

                                                        : job.salaryMax !==
                                                            null &&
                                                        job.salaryMax !==
                                                            undefined

                                                            ? `Up to ${formatSalary(
                                                                job.salaryMax
                                                            )}`

                                                            : "Not disclosed"
                                                }

                                            </strong>

                                        </div>

                                    </div>


                                    {/* =========================
                                        SKILLS
                                    ========================= */}

                                    {job.skills && (

                                        <div className="job-skills">

                                            {String(
                                                job.skills
                                            )
                                                .split(",")
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
                                                    4
                                                )
                                                .map(
                                                    (
                                                        skill,
                                                        index
                                                    ) => (

                                                    <span
                                                        key={
                                                            `${job.id}-${index}`
                                                        }
                                                    >

                                                        {skill}

                                                    </span>

                                                )
                                            )}

                                        </div>

                                    )}


                                    {/* =========================
                                        FOOTER
                                    ========================= */}

                                    <div className="job-card-footer">

                                        <div className="job-status">

                                            <span className="status-dot"></span>

                                            {job.status ||
                                                "OPEN"}

                                        </div>


                                        <button
                                            type="button"
                                            className="btn job-details-button"
                                            onClick={() =>
                                                handleViewJob(
                                                    job.id
                                                )
                                            }
                                        >

                                            View Details

                                            <i className="bi bi-arrow-right ms-2"></i>

                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}


export default Jobs;