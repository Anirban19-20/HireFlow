import { useEffect, useState } from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import axiosInstance
    from "../../api/axiosInstance";

import "./JobDetails.css";

function JobDetails() {

    const { jobId } = useParams();

    const navigate = useNavigate();

    const [job, setJob] =
        useState(null);

    const [profile, setProfile] =
        useState(null);

    const [coverLetter, setCoverLetter] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [applying, setApplying] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [profileError, setProfileError] =
        useState("");

    // =====================================================
    // LOAD JOB + CANDIDATE PROFILE
    // =====================================================

    useEffect(() => {

        const loadData = async () => {

            setLoading(true);
            setError("");

            try {

                // -----------------------------
                // LOAD JOB
                // -----------------------------

                const jobResponse =
                    await axiosInstance.get(
                        `/api/jobs/${jobId}`
                    );

                setJob(
                    jobResponse.data
                );

                // -----------------------------
                // LOAD CANDIDATE PROFILE
                // -----------------------------

                try {

                    const profileResponse =
                        await axiosInstance.get(
                            "/api/candidates/profile"
                        );

                    setProfile(
                        profileResponse.data
                    );

                    setProfileError("");

                } catch (profileRequestError) {

                    console.error(
                        "Profile loading error:",
                        profileRequestError
                    );

                    setProfile(null);

                    setProfileError(
                        profileRequestError
                            .response
                            ?.data
                            ?.message ||
                        "Complete your candidate profile before applying."
                    );
                }

            } catch (jobError) {

                console.error(
                    "Job loading error:",
                    jobError
                );

                setError(
                    jobError.response
                        ?.data
                        ?.message ||
                    "Unable to load this job."
                );

            } finally {

                setLoading(false);
            }
        };

        loadData();

    }, [jobId]);

    // =====================================================
    // SAVE JOB
    // =====================================================

    const handleSaveJob = async () => {

        setSaving(true);

        setError("");
        setSuccess("");

        try {

            await axiosInstance.post(
                `/api/candidate/saved-jobs/${jobId}`
            );

            setSuccess(
                "Job saved successfully."
            );

        } catch (error) {

            console.error(
                "Save job error:",
                error
            );

            setError(
                error.response
                    ?.data
                    ?.message ||
                "Unable to save this job."
            );

        } finally {

            setSaving(false);
        }
    };

    // =====================================================
    // APPLY FOR JOB
    // =====================================================

    const handleApply = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        // Candidate profile must exist
        if (!profile) {

            setError(
                "Please complete your candidate profile before applying."
            );

            return;
        }

        // Resume is required
        if (
            !profile.resumeUrl ||
            profile.resumeUrl.trim() === ""
        ) {

            setError(
                "Please upload your resume before applying for this job."
            );

            return;
        }

        // Optional frontend validation
        if (coverLetter.trim().length < 20) {

            setError(
                "Please write a cover letter of at least 20 characters."
            );

            return;
        }

        setApplying(true);

        try {

            const response =
                await axiosInstance.post(
                    `/api/candidate/applications/job/${jobId}`,
                    {
                        coverLetter:
                            coverLetter.trim()
                    }
                );

            console.log(
                "Application created:",
                response.data
            );

            setSuccess(
                "Application submitted successfully!"
            );

            setCoverLetter("");

        } catch (error) {

            console.error(
                "Apply error:",
                error
            );

            const message =
                error.response
                    ?.data
                    ?.message ||
                "Unable to submit your application.";

            setError(message);

        } finally {

            setApplying(false);
        }
    };

    // =====================================================
    // FORMAT SALARY
    // =====================================================

    const formatSalary = (salary) => {

        if (
            salary === null ||
            salary === undefined
        ) {

            return "Not disclosed";
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
    // FORMAT DEADLINE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "Not specified";
        }

        return new Date(
            `${date}T00:00:00`
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="job-details-loading">

                <div
                    className="
                        spinner-border
                        text-primary
                    "
                    role="status"
                ></div>

                <p>
                    Loading job details...
                </p>

            </div>
        );
    }

    // =====================================================
    // JOB NOT AVAILABLE
    // =====================================================

    if (!job) {

        return (

            <div className="job-details-error-page">

                <div className="job-details-error-icon">

                    <i className="bi bi-briefcase-x"></i>

                </div>

                <h3>
                    Job Not Available
                </h3>

                <p>
                    {error ||
                        "This job may no longer be available."}
                </p>

                <button
                    className="btn back-jobs-button"
                    onClick={() =>
                        navigate(
                            "/candidate/jobs"
                        )
                    }
                >
                    <i className="bi bi-arrow-left me-2"></i>

                    Browse Jobs
                </button>

            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="job-details-page">

            <div className="container">

                {/* BACK */}

                <Link
                    to="/candidate/jobs"
                    className="job-details-back-link"
                >
                    <i className="bi bi-arrow-left"></i>

                    Back to Jobs
                </Link>


                {/* ALERTS */}

                {success && (

                    <div className="alert alert-success job-details-alert">

                        <i className="bi bi-check-circle-fill me-2"></i>

                        {success}

                    </div>

                )}


                {error && (

                    <div className="alert alert-danger job-details-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                <div className="row g-4">

                    {/* =====================================
                        LEFT SIDE
                    ===================================== */}

                    <div className="col-lg-8">

                        {/* MAIN HEADER */}

                        <div className="job-details-main-card">

                            <div className="job-details-header">

                                <div className="job-details-company-logo">

                                    {job.companyName
                                        ? job.companyName
                                            .charAt(0)
                                            .toUpperCase()
                                        : "H"
                                    }

                                </div>


                                <div className="job-details-header-content">

                                    <span className="job-details-company">

                                        {job.companyName ||
                                            "Company"}

                                    </span>

                                    <h1>
                                        {job.title}
                                    </h1>


                                    <div className="job-details-meta">

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

                                        <span>

                                            <i className="bi bi-person-workspace"></i>

                                            {job.experienceRequired !== null &&
                                            job.experienceRequired !== undefined
                                                ? `${job.experienceRequired}+ years`
                                                : "Experience not specified"
                                            }

                                        </span>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    className="job-details-save-button"
                                    onClick={handleSaveJob}
                                    disabled={saving}
                                >

                                    {saving ? (

                                        <span
                                            className="
                                                spinner-border
                                                spinner-border-sm
                                            "
                                        ></span>

                                    ) : (

                                        <i className="bi bi-bookmark"></i>

                                    )}

                                </button>

                            </div>


                            {/* INFORMATION CARDS */}

                            <div className="job-summary-grid">

                                <div className="job-summary-item">

                                    <div className="job-summary-icon">

                                        <i className="bi bi-currency-rupee"></i>

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


                                <div className="job-summary-item">

                                    <div className="job-summary-icon">

                                        <i className="bi bi-calendar-event"></i>

                                    </div>

                                    <div>

                                        <span>
                                            Apply Before
                                        </span>

                                        <strong>
                                            {formatDate(
                                                job.deadline
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                <div className="job-summary-item">

                                    <div className="job-summary-icon">

                                        <i className="bi bi-clock-history"></i>

                                    </div>

                                    <div>

                                        <span>
                                            Job Status
                                        </span>

                                        <strong className="job-open-status">

                                            <span></span>

                                            {job.status}

                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="job-details-content-card">

                            <h4>
                                <i className="bi bi-file-earmark-text"></i>

                                Job Description
                            </h4>

                            <p className="job-description">

                                {job.description ||
                                    "No description provided."}

                            </p>

                        </div>


                        {/* SKILLS */}

                        <div className="job-details-content-card">

                            <h4>

                                <i className="bi bi-code-slash"></i>

                                Skills Required

                            </h4>

                            <div className="job-details-skills">

                                {job.skills ? (

                                    job.skills
                                        .split(",")
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
                                        )

                                ) : (

                                    <p>
                                        Skills not specified.
                                    </p>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* =====================================
                        RIGHT SIDE
                    ===================================== */}

                    <div className="col-lg-4">

                        <div className="application-card">

                            <div className="application-card-header">

                                <div className="application-icon">

                                    <i className="bi bi-send-fill"></i>

                                </div>

                                <div>

                                    <h4>
                                        Apply for this job
                                    </h4>

                                    <p>
                                        Submit your application below.
                                    </p>

                                </div>

                            </div>


                            {/* PROFILE STATUS */}

                            <div className="application-profile-status">

                                {profile ? (

                                    <>

                                        <div className="application-candidate">

                                            <div className="application-avatar">

                                                {profile.name
                                                    ? profile.name
                                                        .charAt(0)
                                                        .toUpperCase()
                                                    : "C"
                                                }

                                            </div>

                                            <div>

                                                <strong>
                                                    {profile.name}
                                                </strong>

                                                <span>
                                                    {profile.email}
                                                </span>

                                            </div>

                                        </div>


                                        {profile.resumeUrl ? (

                                            <div className="resume-ready">

                                                <i className="bi bi-file-earmark-pdf-fill"></i>

                                                <div>

                                                    <strong>
                                                        Resume Ready
                                                    </strong>

                                                    <span>
                                                        Your uploaded resume
                                                        will be attached.
                                                    </span>

                                                </div>

                                                <a
                                                    href={profile.resumeUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <i className="bi bi-box-arrow-up-right"></i>
                                                </a>

                                            </div>

                                        ) : (

                                            <div className="resume-missing">

                                                <i className="bi bi-exclamation-triangle"></i>

                                                <div>

                                                    <strong>
                                                        Resume Required
                                                    </strong>

                                                    <span>
                                                        Upload a resume before applying.
                                                    </span>

                                                </div>

                                            </div>

                                        )}

                                    </>

                                ) : (

                                    <div className="profile-required">

                                        <i className="bi bi-person-exclamation"></i>

                                        <div>

                                            <strong>
                                                Profile Required
                                            </strong>

                                            <span>
                                                {profileError}
                                            </span>

                                        </div>

                                    </div>

                                )}

                            </div>


                            {/* APPLICATION FORM */}

                            <form onSubmit={handleApply}>

                                <div className="mb-3">

                                    <label className="application-label">

                                        Cover Letter

                                    </label>

                                    <textarea
                                        className="form-control cover-letter-input"
                                        rows="8"
                                        placeholder={
                                            "Tell the recruiter why you are a good fit for this position..."
                                        }
                                        value={coverLetter}
                                        onChange={(event) =>
                                            setCoverLetter(
                                                event.target.value
                                            )
                                        }
                                        disabled={applying}
                                        required
                                    ></textarea>


                                    <div className="cover-letter-counter">

                                        {coverLetter.length} characters

                                    </div>

                                </div>


                                {!profile && (

                                    <button
                                        type="button"
                                        className="btn complete-profile-button w-100"
                                        onClick={() =>
                                            navigate(
                                                "/candidate/profile"
                                            )
                                        }
                                    >

                                        <i className="bi bi-person-gear me-2"></i>

                                        Complete Profile

                                    </button>

                                )}


                                {profile &&
                                !profile.resumeUrl && (

                                    <button
                                        type="button"
                                        className="btn complete-profile-button w-100"
                                        onClick={() =>
                                            navigate(
                                                "/candidate/profile"
                                            )
                                        }
                                    >

                                        <i className="bi bi-cloud-arrow-up me-2"></i>

                                        Upload Resume

                                    </button>

                                )}


                                {profile &&
                                profile.resumeUrl && (

                                    <button
                                        type="submit"
                                        className="btn apply-now-button w-100"
                                        disabled={
                                            applying ||
                                            job.status !== "OPEN"
                                        }
                                    >

                                        {applying ? (

                                            <>

                                                <span
                                                    className="
                                                        spinner-border
                                                        spinner-border-sm
                                                        me-2
                                                    "
                                                ></span>

                                                Submitting...

                                            </>

                                        ) : (

                                            <>

                                                <i className="bi bi-send me-2"></i>

                                                Apply Now

                                            </>

                                        )}

                                    </button>

                                )}

                            </form>


                            <div className="application-note">

                                <i className="bi bi-shield-check"></i>

                                Your profile and resume are securely
                                shared with the recruiter.

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default JobDetails;