import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";

import "./SavedJobs.css";

function SavedJobs() {

    const navigate = useNavigate();

    const [savedJobs, setSavedJobs] =
        useState([]);

    const [searchText, setSearchText] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [removingJobId, setRemovingJobId] =
        useState(null);

    // =====================================================
    // LOAD SAVED JOBS
    // =====================================================

    useEffect(() => {

        loadSavedJobs();

    }, []);

    const loadSavedJobs = async () => {

        setLoading(true);
        setError("");

        try {

            const response =
                await axiosInstance.get(
                    "/api/candidate/saved-jobs"
                );

            setSavedJobs(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Saved jobs loading error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load your saved jobs."
            );

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // REMOVE SAVED JOB
    // =====================================================

    const handleRemoveJob = async (jobId) => {

        const confirmed =
            window.confirm(
                "Remove this job from your saved jobs?"
            );

        if (!confirmed) {
            return;
        }

        setRemovingJobId(jobId);

        setError("");
        setSuccess("");

        try {

            await axiosInstance.delete(
                `/api/candidate/saved-jobs/${jobId}`
            );

            // Remove directly from UI
            setSavedJobs(
                (previous) =>
                    previous.filter(
                        (savedJob) =>
                            savedJob.jobId !== jobId
                    )
            );

            setSuccess(
                "Job removed from saved jobs."
            );

        } catch (error) {

            console.error(
                "Remove saved job error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to remove this job."
            );

        } finally {

            setRemovingJobId(null);
        }
    };

    // =====================================================
    // FORMAT EMPLOYMENT TYPE
    // =====================================================

    const formatEmploymentType = (type) => {

        if (!type) {
            return "Not specified";
        }

        return type
            .replaceAll("_", " ")
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

    const formatSalary = (salary) => {

        if (
            salary === null ||
            salary === undefined
        ) {
            return null;
        }

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(salary);
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "Not specified";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // =====================================================
    // FILTER SAVED JOBS
    // =====================================================

    const filteredJobs =
        useMemo(() => {

            const query =
                searchText
                    .trim()
                    .toLowerCase();

            if (!query) {
                return savedJobs;
            }

            return savedJobs.filter(
                (job) => {

                    const searchableText = [
                        job.title,
                        job.companyName,
                        job.location,
                        job.skills,
                        job.employmentType
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return searchableText.includes(
                        query
                    );
                }
            );

        }, [savedJobs, searchText]);

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="saved-jobs-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <p>
                    Loading your saved jobs...
                </p>

            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="saved-jobs-page">

            <div className="container-fluid px-lg-5">

                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="saved-jobs-header">

                    <div>

                        <span className="saved-jobs-eyebrow">
                            Your Shortlist
                        </span>

                        <h1>
                            Saved Jobs
                        </h1>

                        <p>
                            Keep track of opportunities
                            you're interested in and apply
                            when you're ready.
                        </p>

                    </div>

                    <div className="saved-jobs-header-icon">

                        <i className="bi bi-bookmark-star-fill"></i>

                    </div>

                </div>


                {/* =========================================
                    ALERTS
                ========================================= */}

                {success && (

                    <div className="alert alert-success saved-job-alert">

                        <i className="bi bi-check-circle-fill me-2"></i>

                        {success}

                    </div>

                )}


                {error && (

                    <div className="alert alert-danger saved-job-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                {/* =========================================
                    SEARCH / SUMMARY
                ========================================= */}

                <div className="saved-jobs-toolbar">

                    <div className="saved-jobs-search">

                        <i className="bi bi-search"></i>

                        <input
                            type="text"
                            placeholder="Search saved jobs by title, company, location or skill..."
                            value={searchText}
                            onChange={(event) =>
                                setSearchText(
                                    event.target.value
                                )
                            }
                        />

                        {searchText && (

                            <button
                                type="button"
                                onClick={() =>
                                    setSearchText("")
                                }
                                title="Clear search"
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        )}

                    </div>


                    <div className="saved-jobs-count">

                        <div>

                            <i className="bi bi-bookmark-check"></i>

                        </div>

                        <span>

                            <strong>
                                {savedJobs.length}
                            </strong>

                            Saved{" "}

                            {savedJobs.length === 1
                                ? "Job"
                                : "Jobs"
                            }

                        </span>

                    </div>

                </div>


                {/* =========================================
                    EMPTY
                ========================================= */}

                {savedJobs.length === 0 && (

                    <div className="saved-jobs-empty">

                        <div className="saved-jobs-empty-icon">

                            <i className="bi bi-bookmark"></i>

                        </div>

                        <h3>
                            No saved jobs yet
                        </h3>

                        <p>
                            When you find an opportunity
                            you're interested in, use the
                            bookmark button to save it here.
                        </p>

                        <button
                            type="button"
                            className="btn saved-browse-button"
                            onClick={() =>
                                navigate(
                                    "/candidate/jobs"
                                )
                            }
                        >

                            <i className="bi bi-search me-2"></i>

                            Browse Jobs

                        </button>

                    </div>

                )}


                {/* =========================================
                    NO SEARCH RESULTS
                ========================================= */}

                {savedJobs.length > 0 &&
                    filteredJobs.length === 0 && (

                    <div className="saved-jobs-empty">

                        <div className="saved-jobs-empty-icon">

                            <i className="bi bi-search"></i>

                        </div>

                        <h3>
                            No matching saved jobs
                        </h3>

                        <p>
                            Try another job title,
                            company, location or skill.
                        </p>

                        <button
                            type="button"
                            className="btn saved-clear-button"
                            onClick={() =>
                                setSearchText("")
                            }
                        >
                            Clear Search
                        </button>

                    </div>

                )}


                {/* =========================================
                    JOB CARDS
                ========================================= */}

                {filteredJobs.length > 0 && (

                    <div className="row g-4">

                        {filteredJobs.map(
                            (job) => (

                                <div
                                    className="col-xl-4 col-lg-6"
                                    key={
                                        job.savedJobId ||
                                        job.jobId
                                    }
                                >

                                    <div className="saved-job-card">

                                        {/* TOP */}

                                        <div className="saved-job-card-top">

                                            <div className="saved-company-logo">

                                                {job.companyName
                                                    ? job.companyName
                                                        .charAt(0)
                                                        .toUpperCase()
                                                    : "H"
                                                }

                                            </div>


                                            <button
                                                type="button"
                                                className="saved-remove-icon"
                                                onClick={() =>
                                                    handleRemoveJob(
                                                        job.jobId
                                                    )
                                                }
                                                disabled={
                                                    removingJobId ===
                                                    job.jobId
                                                }
                                                title="Remove saved job"
                                            >

                                                {removingJobId ===
                                                job.jobId ? (

                                                    <span
                                                        className="
                                                            spinner-border
                                                            spinner-border-sm
                                                        "
                                                    ></span>

                                                ) : (

                                                    <i className="bi bi-bookmark-fill"></i>

                                                )}

                                            </button>

                                        </div>


                                        {/* COMPANY */}

                                        <span className="saved-company-name">

                                            {job.companyName ||
                                                "Company"}

                                        </span>


                                        {/* TITLE */}

                                        <h3 className="saved-job-title">

                                            {job.title}

                                        </h3>


                                        {/* META */}

                                        <div className="saved-job-meta">

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


                                        {/* INFORMATION */}

                                        <div className="saved-job-information">

                                            <div>

                                                <span>
                                                    Experience
                                                </span>

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


                                            <div>

                                                <span>
                                                    Salary
                                                </span>

                                                <strong>

                                                    {job.salaryMin &&
                                                    job.salaryMax

                                                        ? `${formatSalary(
                                                            job.salaryMin
                                                        )} - ${formatSalary(
                                                            job.salaryMax
                                                        )}`

                                                        : "Not disclosed"
                                                    }

                                                </strong>

                                            </div>

                                        </div>


                                        {/* SKILLS */}

                                        {job.skills && (

                                            <div className="saved-job-skills">

                                                {job.skills
                                                    .split(",")
                                                    .slice(0, 4)
                                                    .map(
                                                        (
                                                            skill,
                                                            index
                                                        ) => (

                                                            <span
                                                                key={index}
                                                            >
                                                                {skill.trim()}
                                                            </span>

                                                        )
                                                    )}

                                                {job.skills
                                                    .split(",")
                                                    .length > 4 && (

                                                    <span className="saved-more-skills">

                                                        +
                                                        {
                                                            job.skills
                                                                .split(",")
                                                                .length - 4
                                                        }

                                                    </span>

                                                )}

                                            </div>

                                        )}


                                        {/* EXTRA INFORMATION */}

                                        <div className="saved-job-extra">

                                            <div>

                                                <i className="bi bi-calendar-event"></i>

                                                <span>
                                                    Deadline:
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        job.deadline
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <i className="bi bi-bookmark-check"></i>

                                                <span>
                                                    Saved:
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        job.savedAt
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* STATUS */}

                                        <div className="saved-status-row">

                                            <span
                                                className={
                                                    job.status === "OPEN"
                                                        ? "saved-status-open"
                                                        : "saved-status-closed"
                                                }
                                            >

                                                <span className="saved-status-dot"></span>

                                                {job.status}

                                            </span>

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="saved-job-actions">

                                            <button
                                                type="button"
                                                className="btn saved-view-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/candidate/jobs/${job.jobId}`
                                                    )
                                                }
                                            >

                                                <i className="bi bi-eye me-2"></i>

                                                View Job

                                            </button>


                                            <button
                                                type="button"
                                                className="btn saved-apply-button"
                                                disabled={
                                                    job.status !== "OPEN"
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        `/candidate/jobs/${job.jobId}`
                                                    )
                                                }
                                            >

                                                <i className="bi bi-send me-2"></i>

                                                {job.status === "OPEN"
                                                    ? "Apply Now"
                                                    : "Unavailable"
                                                }

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>
    );
}

export default SavedJobs;