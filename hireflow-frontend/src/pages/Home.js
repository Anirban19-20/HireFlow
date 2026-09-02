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
    from "../api/axiosInstance";

import { useAuth }
    from "../context/AuthContext";

import "./Home.css";


// =====================================================
// HOME PAGE
// =====================================================

function Home() {

    const navigate =
        useNavigate();


    const {
        user,
        isAuthenticated
    } = useAuth();


    // =====================================================
    // STATE
    // =====================================================

    const [
        jobs,
        setJobs
    ] = useState([]);


    const [
        loadingJobs,
        setLoadingJobs
    ] = useState(true);


    const [
        jobError,
        setJobError
    ] = useState("");


    const [
        keyword,
        setKeyword
    ] = useState("");


    const [
        location,
        setLocation
    ] = useState("");


    // =====================================================
    // LOAD OPEN JOBS
    // =====================================================

    const loadJobs =
        useCallback(
            async () => {

                setLoadingJobs(
                    true
                );

                setJobError(
                    ""
                );


                try {

                    // =========================================
                    // IMPORTANT
                    //
                    // Backend public jobs endpoint is:
                    //
                    // GET /api/jobs
                    //
                    // Do NOT use:
                    //
                    // POST /api/jobs/search
                    // =========================================

                    const response =
                        await axiosInstance.get(
                            "/api/jobs"
                        );


                    const data =
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : [];


                    const openJobs =
                        data.filter(
                            (job) =>
                                !job?.status ||
                                job.status ===
                                "OPEN"
                        );


                    setJobs(
                        openJobs
                    );

                } catch (requestError) {

                    console.error(
                        "Home jobs error:",
                        requestError
                    );


                    console.error(
                        "Backend response:",
                        requestError
                            ?.response
                            ?.data
                    );


                    const backendMessage =
                        requestError
                            ?.response
                            ?.data
                            ?.message;


                    setJobError(
                        backendMessage ||
                        "Latest jobs are unavailable right now."
                    );

                } finally {

                    setLoadingJobs(
                        false
                    );
                }
            },
            []
        );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadJobs();

    }, [loadJobs]);


    // =====================================================
    // LATEST JOBS
    // =====================================================

    const latestJobs =
        useMemo(
            () => {

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
                                )
                                    .getTime();


                            const secondDate =
                                new Date(
                                    second?.createdAt ||
                                    0
                                )
                                    .getTime();


                            return (
                                secondDate -
                                firstDate
                            );
                        }
                    )
                    .slice(
                        0,
                        6
                    );
            },
            [
                jobs
            ]
        );


    // =====================================================
    // FORMAT EMPLOYMENT TYPE
    // =====================================================

    const formatEmploymentType = (
        value
    ) => {

        if (!value) {

            return "Full Time";
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
            "Salary not disclosed"
        );
    };


    // =====================================================
    // GET SKILLS
    // =====================================================

    const getSkills = (
        job
    ) => {

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
                )
                .slice(
                    0,
                    3
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
            )
            .slice(
                0,
                3
            );
    };


    // =====================================================
    // FIND JOBS
    // =====================================================

    const handleJobSearch = (
        event
    ) => {

        event.preventDefault();


        const params =
            new URLSearchParams();


        if (
            keyword.trim()
        ) {

            params.set(
                "keyword",
                keyword.trim()
            );
        }


        if (
            location.trim()
        ) {

            params.set(
                "location",
                location.trim()
            );
        }


        const queryString =
            params.toString();


        // =============================================
        // CANDIDATE
        // =============================================

        if (
            isAuthenticated &&
            user?.role ===
            "CANDIDATE"
        ) {

            navigate(
                queryString

                    ? `/candidate/jobs?${queryString}`

                    : "/candidate/jobs"
            );

            return;
        }


        // =============================================
        // RECRUITER
        // =============================================

        if (
            isAuthenticated &&
            user?.role ===
            "RECRUITER"
        ) {

            navigate(
                "/recruiter/dashboard"
            );

            return;
        }


        // =============================================
        // ADMIN
        // =============================================

        if (
            isAuthenticated
        ) {

            navigate(
                "/admin/dashboard"
            );

            return;
        }


        // =============================================
        // GUEST
        // =============================================

        navigate(
            "/login",
            {
                state: {

                    from:
                        queryString

                            ? `/candidate/jobs?${queryString}`

                            : "/candidate/jobs"
                }
            }
        );
    };


    // =====================================================
    // FIND JOBS BUTTON
    // =====================================================

    const handleFindJobs = () => {

        if (
            isAuthenticated &&
            user?.role ===
            "CANDIDATE"
        ) {

            navigate(
                "/candidate/jobs"
            );

            return;
        }


        if (
            isAuthenticated &&
            user?.role ===
            "RECRUITER"
        ) {

            navigate(
                "/recruiter/dashboard"
            );

            return;
        }


        if (
            isAuthenticated
        ) {

            navigate(
                "/admin/dashboard"
            );

            return;
        }


        navigate(
            "/register"
        );
    };


    // =====================================================
    // POST JOB
    // =====================================================

    const handlePostJob = () => {

        if (
            isAuthenticated &&
            user?.role ===
            "RECRUITER"
        ) {

            navigate(
                "/recruiter/jobs/create"
            );

            return;
        }


        if (
            isAuthenticated &&
            user?.role ===
            "CANDIDATE"
        ) {

            navigate(
                "/candidate/dashboard"
            );

            return;
        }


        if (
            isAuthenticated
        ) {

            navigate(
                "/admin/dashboard"
            );

            return;
        }


        navigate(
            "/register"
        );
    };


    // =====================================================
    // VIEW ALL JOBS
    // =====================================================

    const handleViewJobs = () => {

        if (
            isAuthenticated &&
            user?.role ===
            "CANDIDATE"
        ) {

            navigate(
                "/candidate/jobs"
            );

            return;
        }


        if (
            isAuthenticated &&
            user?.role ===
            "RECRUITER"
        ) {

            navigate(
                "/recruiter/jobs"
            );

            return;
        }


        if (
            isAuthenticated
        ) {

            navigate(
                "/admin/dashboard"
            );

            return;
        }


        navigate(
            "/login",
            {
                state: {

                    from:
                        "/candidate/jobs"
                }
            }
        );
    };


    // =====================================================
    // VIEW SINGLE PUBLIC JOB
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
    // DASHBOARD PATH
    // =====================================================

    const getDashboardPath = () => {

        if (
            user?.role ===
            "CANDIDATE"
        ) {

            return (
                "/candidate/dashboard"
            );
        }


        if (
            user?.role ===
            "RECRUITER"
        ) {

            return (
                "/recruiter/dashboard"
            );
        }


        return (
            "/admin/dashboard"
        );
    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="hireflow-home">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="hireflow-home-hero">

                <div className="container">

                    <div className="row align-items-center g-5">


                        {/* HERO CONTENT */}

                        <div className="col-lg-6">

                            <div className="hireflow-hero-content">


                                <div className="hireflow-hero-badge">

                                    <span className="hireflow-hero-badge-icon">

                                        <i className="bi bi-stars"></i>

                                    </span>

                                    Smarter hiring starts here

                                </div>


                                <h1>

                                    Find the right job.

                                    <span>

                                        Hire the right talent.

                                    </span>

                                </h1>


                                <p className="hireflow-hero-description">

                                    HireFlow brings candidates and
                                    recruiters together through a modern
                                    recruitment experience — from job
                                    discovery and applications to
                                    interviews and hiring.

                                </p>


                                <div className="hireflow-hero-actions">

                                    <button
                                        type="button"
                                        className="hireflow-primary-button"
                                        onClick={
                                            handleFindJobs
                                        }
                                    >

                                        <i className="bi bi-search"></i>

                                        Find Jobs

                                    </button>


                                    <button
                                        type="button"
                                        className="hireflow-secondary-button"
                                        onClick={
                                            handlePostJob
                                        }
                                    >

                                        <i className="bi bi-plus-circle"></i>

                                        Post a Job

                                    </button>

                                </div>


                                <div className="hireflow-hero-trust">

                                    <div>

                                        <i className="bi bi-check-circle-fill"></i>

                                        Easy applications

                                    </div>


                                    <div>

                                        <i className="bi bi-check-circle-fill"></i>

                                        Interview tracking

                                    </div>


                                    <div>

                                        <i className="bi bi-check-circle-fill"></i>

                                        Real-time updates

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* HERO VISUAL */}

                        <div className="col-lg-6">

                            <div className="hireflow-hero-visual">


                                <div className="hireflow-hero-main-card">


                                    <div className="hireflow-hero-card-header">

                                        <div className="hireflow-hero-company-icon">

                                            <i className="bi bi-building"></i>

                                        </div>


                                        <div>

                                            <span>
                                                Featured Opportunity
                                            </span>

                                            <h3>
                                                Java Full Stack Developer
                                            </h3>

                                        </div>

                                    </div>


                                    <div className="hireflow-hero-job-meta">

                                        <span>

                                            <i className="bi bi-geo-alt"></i>

                                            Kolkata

                                        </span>


                                        <span>

                                            <i className="bi bi-briefcase"></i>

                                            Full Time

                                        </span>


                                        <span>

                                            <i className="bi bi-code-slash"></i>

                                            Java • React

                                        </span>

                                    </div>


                                    <div className="hireflow-hero-progress">

                                        <div className="hireflow-progress-item completed">

                                            <span>

                                                <i className="bi bi-check"></i>

                                            </span>

                                            Applied

                                        </div>


                                        <div className="hireflow-progress-line completed"></div>


                                        <div className="hireflow-progress-item completed">

                                            <span>

                                                <i className="bi bi-check"></i>

                                            </span>

                                            Shortlisted

                                        </div>


                                        <div className="hireflow-progress-line"></div>


                                        <div className="hireflow-progress-item active">

                                            <span>

                                                <i className="bi bi-camera-video"></i>

                                            </span>

                                            Interview

                                        </div>

                                    </div>

                                </div>


                                <div className="hireflow-floating-card hireflow-floating-interview">

                                    <div>

                                        <i className="bi bi-calendar2-check-fill"></i>

                                    </div>


                                    <span>

                                        <small>
                                            Next Interview
                                        </small>

                                        <strong>
                                            Technical Round
                                        </strong>

                                    </span>

                                </div>


                                <div className="hireflow-floating-card hireflow-floating-success">

                                    <div>

                                        <i className="bi bi-person-check-fill"></i>

                                    </div>


                                    <span>

                                        <small>
                                            Application
                                        </small>

                                        <strong>
                                            Shortlisted
                                        </strong>

                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                SEARCH
            ================================================= */}

            <section className="hireflow-search-wrapper">

                <div className="container">

                    <div className="hireflow-job-search-card">


                        <div className="hireflow-search-heading">

                            <div>

                                <span>
                                    Start your search
                                </span>

                                <h2>
                                    Discover your next opportunity
                                </h2>

                            </div>


                            <i className="bi bi-search"></i>

                        </div>


                        <form
                            className="hireflow-search-form"
                            onSubmit={
                                handleJobSearch
                            }
                        >

                            <div className="hireflow-search-field">

                                <i className="bi bi-briefcase"></i>


                                <div>

                                    <label>
                                        Job title or keyword
                                    </label>


                                    <input
                                        type="text"
                                        placeholder="Java Developer, React, Spring Boot..."
                                        value={
                                            keyword
                                        }
                                        onChange={
                                            (event) =>
                                                setKeyword(
                                                    event.target.value
                                                )
                                        }
                                    />

                                </div>

                            </div>


                            <div className="hireflow-search-divider"></div>


                            <div className="hireflow-search-field">

                                <i className="bi bi-geo-alt"></i>


                                <div>

                                    <label>
                                        Location
                                    </label>


                                    <input
                                        type="text"
                                        placeholder="Kolkata, Bengaluru, Remote..."
                                        value={
                                            location
                                        }
                                        onChange={
                                            (event) =>
                                                setLocation(
                                                    event.target.value
                                                )
                                        }
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="hireflow-search-button"
                            >

                                <i className="bi bi-search"></i>

                                Search Jobs

                            </button>

                        </form>

                    </div>

                </div>

            </section>


            {/* =================================================
                LATEST JOBS
            ================================================= */}

            <section className="hireflow-section hireflow-jobs-section">

                <div className="container">


                    <div className="hireflow-section-heading">

                        <div>

                            <span className="hireflow-section-eyebrow">
                                Latest opportunities
                            </span>


                            <h2>
                                Jobs you may be interested in
                            </h2>


                            <p>

                                Explore recent opportunities from
                                companies looking for talented people.

                            </p>

                        </div>


                        <button
                            type="button"
                            className="hireflow-view-all"
                            onClick={
                                handleViewJobs
                            }
                        >

                            View all jobs

                            <i className="bi bi-arrow-right"></i>

                        </button>

                    </div>


                    {/* LOADING */}

                    {loadingJobs && (

                        <div className="hireflow-jobs-loading">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>


                            <p>
                                Loading opportunities...
                            </p>

                        </div>

                    )}


                    {/* ERROR */}

                    {!loadingJobs &&
                        jobError && (

                        <div className="hireflow-jobs-message">

                            <i className="bi bi-cloud-slash"></i>


                            <h4>
                                Unable to load jobs
                            </h4>


                            <p>
                                {jobError}
                            </p>


                            <button
                                type="button"
                                onClick={
                                    loadJobs
                                }
                            >

                                Try Again

                            </button>

                        </div>

                    )}


                    {/* EMPTY */}

                    {!loadingJobs &&
                        !jobError &&
                        latestJobs.length ===
                        0 && (

                        <div className="hireflow-jobs-message">

                            <i className="bi bi-briefcase"></i>


                            <h4>
                                New opportunities coming soon
                            </h4>


                            <p>

                                There are currently no open jobs
                                to display.

                            </p>

                        </div>

                    )}


                    {/* JOB CARDS */}

                    {!loadingJobs &&
                        !jobError &&
                        latestJobs.length >
                        0 && (

                        <div className="row g-4">

                            {latestJobs.map(
                                (job) => {

                                    const skills =
                                        getSkills(
                                            job
                                        );


                                    return (

                                        <div
                                            className="col-md-6 col-xl-4"
                                            key={
                                                job.id
                                            }
                                        >

                                            <div className="hireflow-job-card">


                                                <div className="hireflow-job-card-top">

                                                    <div className="hireflow-job-company-logo">

                                                        {(
                                                            job.companyName ||
                                                            "H"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </div>


                                                    <span className="hireflow-job-type">

                                                        {formatEmploymentType(
                                                            job.employmentType
                                                        )}

                                                    </span>

                                                </div>


                                                <div className="hireflow-job-card-content">

                                                    <span className="hireflow-company-name">

                                                        {job.companyName ||
                                                            "Hiring Company"}

                                                    </span>


                                                    <h3>

                                                        {job.title ||
                                                            "Open Position"}

                                                    </h3>


                                                    <div className="hireflow-job-card-meta">

                                                        <span>

                                                            <i className="bi bi-geo-alt"></i>

                                                            {job.location ||
                                                                "Location not specified"}

                                                        </span>


                                                        <span>

                                                            <i className="bi bi-briefcase"></i>

                                                            {job.experienceRequired !==
                                                                null &&
                                                            job.experienceRequired !==
                                                                undefined

                                                                ? `${job.experienceRequired}+ years`

                                                                : "Experience flexible"
                                                            }

                                                        </span>

                                                    </div>


                                                    {skills.length >
                                                        0 && (

                                                        <div className="hireflow-job-skills">

                                                            {skills.map(
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

                                                </div>


                                                <div className="hireflow-job-card-footer">

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


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewJob(
                                                                job.id
                                                            )
                                                        }
                                                    >

                                                        View Job

                                                        <i className="bi bi-arrow-up-right"></i>

                                                    </button>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                </div>

            </section>


            {/* =================================================
                HOW IT WORKS
            ================================================= */}

            <section className="hireflow-section hireflow-how-section">

                <div className="container">


                    <div className="hireflow-centered-heading">

                        <span className="hireflow-section-eyebrow">
                            Simple process
                        </span>


                        <h2>
                            How HireFlow works
                        </h2>


                        <p>

                            Everything you need for a smoother
                            recruitment journey.

                        </p>

                    </div>


                    <div className="row g-4">


                        <div className="col-md-6 col-xl-3">

                            <div className="hireflow-step-card">

                                <div className="hireflow-step-number">
                                    01
                                </div>


                                <div className="hireflow-step-icon">

                                    <i className="bi bi-person-plus"></i>

                                </div>


                                <h3>
                                    Create your profile
                                </h3>


                                <p>

                                    Add your skills, education,
                                    experience and resume to build
                                    your professional profile.

                                </p>

                            </div>

                        </div>


                        <div className="col-md-6 col-xl-3">

                            <div className="hireflow-step-card">

                                <div className="hireflow-step-number">
                                    02
                                </div>


                                <div className="hireflow-step-icon">

                                    <i className="bi bi-search"></i>

                                </div>


                                <h3>
                                    Discover opportunities
                                </h3>


                                <p>

                                    Search jobs by role, skills,
                                    location and employment type.

                                </p>

                            </div>

                        </div>


                        <div className="col-md-6 col-xl-3">

                            <div className="hireflow-step-card">

                                <div className="hireflow-step-number">
                                    03
                                </div>


                                <div className="hireflow-step-icon">

                                    <i className="bi bi-send-check"></i>

                                </div>


                                <h3>
                                    Apply & track
                                </h3>


                                <p>

                                    Apply using your profile resume
                                    and follow every application
                                    status from one place.

                                </p>

                            </div>

                        </div>


                        <div className="col-md-6 col-xl-3">

                            <div className="hireflow-step-card">

                                <div className="hireflow-step-number">
                                    04
                                </div>


                                <div className="hireflow-step-icon">

                                    <i className="bi bi-calendar2-check"></i>

                                </div>


                                <h3>
                                    Interview & get hired
                                </h3>


                                <p>

                                    Receive interview schedules,
                                    track multiple rounds and stay
                                    informed throughout hiring.

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                FEATURES
            ================================================= */}

            <section className="hireflow-section hireflow-features-section">

                <div className="container">


                    <div className="row align-items-center g-5">


                        <div className="col-lg-5">

                            <div className="hireflow-features-content">

                                <span className="hireflow-section-eyebrow">
                                    One platform
                                </span>


                                <h2>

                                    Everything your recruitment
                                    journey needs.

                                </h2>


                                <p>

                                    HireFlow connects every stage
                                    of hiring in one straightforward
                                    experience for candidates and
                                    recruiters.

                                </p>


                                {!isAuthenticated ? (

                                    <Link
                                        to="/register"
                                        className="hireflow-primary-button hireflow-inline-button"
                                    >

                                        Create Free Account

                                        <i className="bi bi-arrow-right"></i>

                                    </Link>

                                ) : (

                                    <Link
                                        to={
                                            getDashboardPath()
                                        }
                                        className="hireflow-primary-button hireflow-inline-button"
                                    >

                                        Open Dashboard

                                        <i className="bi bi-arrow-right"></i>

                                    </Link>

                                )}

                            </div>

                        </div>


                        <div className="col-lg-7">

                            <div className="hireflow-feature-grid">


                                <div className="hireflow-feature-card">

                                    <div>

                                        <i className="bi bi-briefcase"></i>

                                    </div>


                                    <h3>
                                        Smart Job Search
                                    </h3>


                                    <p>

                                        Search and filter opportunities
                                        that match your skills and goals.

                                    </p>

                                </div>


                                <div className="hireflow-feature-card">

                                    <div>

                                        <i className="bi bi-bookmark-check"></i>

                                    </div>


                                    <h3>
                                        Saved Jobs
                                    </h3>


                                    <p>

                                        Bookmark interesting roles
                                        and return when you're ready
                                        to apply.

                                    </p>

                                </div>


                                <div className="hireflow-feature-card">

                                    <div>

                                        <i className="bi bi-file-earmark-person"></i>

                                    </div>


                                    <h3>
                                        Resume Management
                                    </h3>


                                    <p>

                                        Maintain your candidate profile
                                        and resume in one place.

                                    </p>

                                </div>


                                <div className="hireflow-feature-card">

                                    <div>

                                        <i className="bi bi-diagram-3"></i>

                                    </div>


                                    <h3>
                                        Application Tracking
                                    </h3>


                                    <p>

                                        Follow every stage from applied
                                        through review, interview and
                                        final decision.

                                    </p>

                                </div>


                                <div className="hireflow-feature-card">

                                    <div>

                                        <i className="bi bi-camera-video"></i>

                                    </div>


                                    <h3>
                                        Interview Rounds
                                    </h3>


                                    <p>

                                        Schedule and manage technical,
                                        managerial and HR interview
                                        rounds.

                                    </p>

                                </div>


                                <div className="hireflow-feature-card">

                                    <div>

                                        <i className="bi bi-bell"></i>

                                    </div>


                                    <h3>
                                        Notifications
                                    </h3>


                                    <p>

                                        Stay updated when applications
                                        or interview schedules change.

                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                ROLE SECTION
            ================================================= */}

            <section className="hireflow-section hireflow-role-section">

                <div className="container">


                    <div className="hireflow-centered-heading">

                        <span className="hireflow-section-eyebrow">
                            Built for both sides
                        </span>


                        <h2>
                            Choose how you use HireFlow
                        </h2>

                    </div>


                    <div className="row g-4">


                        {/* CANDIDATE */}

                        <div className="col-lg-6">

                            <div className="hireflow-role-card hireflow-candidate-card">

                                <div className="hireflow-role-icon">

                                    <i className="bi bi-person-workspace"></i>

                                </div>


                                <span className="hireflow-role-label">
                                    For Candidates
                                </span>


                                <h3>
                                    Build your career with confidence.
                                </h3>


                                <p>

                                    Discover jobs, maintain your profile,
                                    save opportunities, apply quickly,
                                    track applications and manage
                                    interviews.

                                </p>


                                <div className="hireflow-role-benefits">

                                    <span>

                                        <i className="bi bi-check2"></i>

                                        Search jobs

                                    </span>


                                    <span>

                                        <i className="bi bi-check2"></i>

                                        Upload resume

                                    </span>


                                    <span>

                                        <i className="bi bi-check2"></i>

                                        Track applications

                                    </span>


                                    <span>

                                        <i className="bi bi-check2"></i>

                                        Manage interviews

                                    </span>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        handleFindJobs
                                    }
                                >

                                    Explore Jobs

                                    <i className="bi bi-arrow-right"></i>

                                </button>

                            </div>

                        </div>


                        {/* RECRUITER */}

                        <div className="col-lg-6">

                            <div className="hireflow-role-card hireflow-recruiter-card">

                                <div className="hireflow-role-icon">

                                    <i className="bi bi-building-check"></i>

                                </div>


                                <span className="hireflow-role-label">
                                    For Recruiters
                                </span>


                                <h3>
                                    Turn applicants into great hires.
                                </h3>


                                <p>

                                    Publish jobs, review applicants,
                                    manage the recruitment pipeline,
                                    schedule interview rounds and make
                                    hiring decisions.

                                </p>


                                <div className="hireflow-role-benefits">

                                    <span>

                                        <i className="bi bi-check2"></i>

                                        Post vacancies

                                    </span>


                                    <span>

                                        <i className="bi bi-check2"></i>

                                        Review candidates

                                    </span>


                                    <span>

                                        <i className="bi bi-check2"></i>

                                        Manage pipeline

                                    </span>


                                    <span>

                                        <i className="bi bi-check2"></i>

                                        Schedule interviews

                                    </span>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        handlePostJob
                                    }
                                >

                                    Start Hiring

                                    <i className="bi bi-arrow-right"></i>

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                CTA
            ================================================= */}

            <section className="hireflow-home-cta">

                <div className="container">

                    <div className="hireflow-cta-card">


                        <div className="hireflow-cta-decoration hireflow-cta-decoration-one"></div>

                        <div className="hireflow-cta-decoration hireflow-cta-decoration-two"></div>


                        <div className="hireflow-cta-content">

                            <span>
                                Your next opportunity starts here
                            </span>


                            <h2>

                                Ready to move your career
                                or hiring forward?

                            </h2>


                            <p>

                                Join HireFlow and manage the
                                recruitment journey from first
                                application to final decision.

                            </p>


                            <div>

                                {!isAuthenticated ? (

                                    <>

                                        <Link
                                            to="/register"
                                            className="hireflow-cta-primary"
                                        >

                                            Get Started

                                            <i className="bi bi-arrow-right"></i>

                                        </Link>


                                        <Link
                                            to="/login"
                                            className="hireflow-cta-secondary"
                                        >

                                            Sign In

                                        </Link>

                                    </>

                                ) : (

                                    <Link
                                        to={
                                            getDashboardPath()
                                        }
                                        className="hireflow-cta-primary"
                                    >

                                        Go to Dashboard

                                        <i className="bi bi-arrow-right"></i>

                                    </Link>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="hireflow-home-footer">

                <div className="container">


                    <div className="hireflow-footer-main">


                        <div className="hireflow-footer-brand">

                            <Link
                                to="/"
                                className="hireflow-footer-logo"
                            >

                                <span>

                                    <i className="bi bi-briefcase-fill"></i>

                                </span>

                                HireFlow

                            </Link>


                            <p>

                                A modern recruitment platform
                                connecting talented candidates
                                with growing companies.

                            </p>

                        </div>


                        <div className="hireflow-footer-column">

                            <h4>
                                Candidates
                            </h4>


                            <button
                                type="button"
                                onClick={
                                    handleFindJobs
                                }
                            >

                                Find Jobs

                            </button>


                            {!isAuthenticated && (

                                <Link to="/register">

                                    Create Account

                                </Link>

                            )}

                        </div>


                        <div className="hireflow-footer-column">

                            <h4>
                                Recruiters
                            </h4>


                            <button
                                type="button"
                                onClick={
                                    handlePostJob
                                }
                            >

                                Post a Job

                            </button>


                            {!isAuthenticated && (

                                <Link to="/register">

                                    Recruiter Account

                                </Link>

                            )}

                        </div>


                        <div className="hireflow-footer-column">

                            <h4>
                                Account
                            </h4>


                            {!isAuthenticated ? (

                                <>

                                    <Link to="/login">

                                        Sign In

                                    </Link>


                                    <Link to="/register">

                                        Register

                                    </Link>

                                </>

                            ) : (

                                <Link
                                    to={
                                        getDashboardPath()
                                    }
                                >

                                    Dashboard

                                </Link>

                            )}

                        </div>

                    </div>


                    <div className="hireflow-footer-bottom">

                        <p>

                            © 2026 HireFlow. All rights reserved.

                        </p>


                        <span>

                            Built for better hiring.

                        </span>

                    </div>

                </div>

            </footer>

        </div>
    );
}


export default Home;