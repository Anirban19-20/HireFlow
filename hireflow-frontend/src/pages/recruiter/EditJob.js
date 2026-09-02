import { useEffect, useState } from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";

import "./CreateJob.css";
import "./EditJob.css";

function EditJob() {

    const { jobId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        employmentType: "FULL_TIME",
        experienceRequired: "",
        salaryMin: "",
        salaryMax: "",
        skills: "",
        deadline: ""
    });

    const [jobStatus, setJobStatus] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    // =====================================================
    // LOAD JOB
    // =====================================================

    useEffect(() => {

        const loadJob = async () => {

            setLoading(true);
            setError("");

            try {

                const response =
                    await axiosInstance.get(
                        `/api/jobs/${jobId}`
                    );

                const job =
                    response.data;

                setFormData({

                    title:
                        job.title || "",

                    description:
                        job.description || "",

                    location:
                        job.location || "",

                    employmentType:
                        job.employmentType ||
                        "FULL_TIME",

                    experienceRequired:
                        job.experienceRequired !== null &&
                        job.experienceRequired !== undefined
                            ? job.experienceRequired
                            : "",

                    salaryMin:
                        job.salaryMin !== null &&
                        job.salaryMin !== undefined
                            ? job.salaryMin
                            : "",

                    salaryMax:
                        job.salaryMax !== null &&
                        job.salaryMax !== undefined
                            ? job.salaryMax
                            : "",

                    skills:
                        job.skills || "",

                    deadline:
                        job.deadline
                            ? String(
                                job.deadline
                            ).substring(
                                0,
                                10
                            )
                            : ""
                });

                setJobStatus(
                    job.status || ""
                );

            } catch (error) {

                console.error(
                    "Load job error:",
                    error
                );

                setError(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to load this job."
                );

            } finally {

                setLoading(false);
            }
        };

        loadJob();

    }, [jobId]);

    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );

        setError("");
    };

    // =====================================================
    // VALIDATION
    // =====================================================

    const validateForm = () => {

        if (!formData.title.trim()) {

            setError(
                "Job title is required."
            );

            return false;
        }

        if (!formData.description.trim()) {

            setError(
                "Job description is required."
            );

            return false;
        }

        if (!formData.location.trim()) {

            setError(
                "Job location is required."
            );

            return false;
        }

        if (
            formData.experienceRequired === ""
        ) {

            setError(
                "Experience requirement is required."
            );

            return false;
        }

        if (
            Number(
                formData.experienceRequired
            ) < 0
        ) {

            setError(
                "Experience cannot be negative."
            );

            return false;
        }

        if (
            formData.salaryMin !== "" &&
            Number(
                formData.salaryMin
            ) < 0
        ) {

            setError(
                "Minimum salary cannot be negative."
            );

            return false;
        }

        if (
            formData.salaryMax !== "" &&
            Number(
                formData.salaryMax
            ) < 0
        ) {

            setError(
                "Maximum salary cannot be negative."
            );

            return false;
        }

        if (
            formData.salaryMin !== "" &&
            formData.salaryMax !== "" &&
            Number(
                formData.salaryMin
            ) >
            Number(
                formData.salaryMax
            )
        ) {

            setError(
                "Minimum salary cannot be greater than maximum salary."
            );

            return false;
        }

        if (!formData.skills.trim()) {

            setError(
                "Please enter the required skills."
            );

            return false;
        }

        if (!formData.deadline) {

            setError(
                "Application deadline is required."
            );

            return false;
        }

        return true;
    };

    // =====================================================
    // UPDATE JOB
    // =====================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {

            const requestData = {

                title:
                    formData.title.trim(),

                description:
                    formData.description.trim(),

                location:
                    formData.location.trim(),

                employmentType:
                    formData.employmentType,

                experienceRequired:
                    Number(
                        formData.experienceRequired
                    ),

                salaryMin:
                    formData.salaryMin === ""
                        ? null
                        : Number(
                            formData.salaryMin
                        ),

                salaryMax:
                    formData.salaryMax === ""
                        ? null
                        : Number(
                            formData.salaryMax
                        ),

                skills:
                    formData.skills.trim(),

                deadline:
                    formData.deadline
            };

            const response =
                await axiosInstance.put(
                    `/api/recruiter/jobs/${jobId}`,
                    requestData
                );

            console.log(
                "Updated job:",
                response.data
            );

            navigate(
                "/recruiter/jobs",
                {
                    replace: true,
                    state: {
                        message:
                            "Job updated successfully."
                    }
                }
            );

        } catch (error) {

            console.error(
                "Update job error:",
                error
            );

            if (
                error.code ===
                "ERR_NETWORK"
            ) {

                setError(
                    "Unable to connect to the server."
                );

            } else {

                setError(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to update this job."
                );
            }

        } finally {

            setSaving(false);
        }
    };

    // =====================================================
    // FORMAT TYPE
    // =====================================================

    const formatEmploymentType = (
        type
    ) => {

        if (!type) {
            return "";
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
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="edit-job-loading">

                <div
                    className="
                        spinner-border
                        text-primary
                    "
                    role="status"
                ></div>

                <p>
                    Loading job information...
                </p>

            </div>
        );
    }

    // =====================================================
    // ERROR PAGE
    // =====================================================

    if (
        error &&
        !formData.title
    ) {

        return (

            <div className="edit-job-error-page">

                <div className="edit-job-error-icon">

                    <i className="bi bi-exclamation-triangle"></i>

                </div>

                <h3>
                    Unable to Load Job
                </h3>

                <p>
                    {error}
                </p>

                <button
                    type="button"
                    className="btn create-job-submit-button"
                    onClick={() =>
                        navigate(
                            "/recruiter/jobs"
                        )
                    }
                >

                    <i className="bi bi-arrow-left me-2"></i>

                    Back to My Jobs

                </button>

            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="create-job-page">

            <div className="container">

                {/* BACK */}

                <Link
                    to="/recruiter/jobs"
                    className="create-job-back"
                >

                    <i className="bi bi-arrow-left"></i>

                    Back to My Jobs

                </Link>


                {/* HEADER */}

                <div className="create-job-header">

                    <div>

                        <span className="create-job-eyebrow">
                            Job Management
                        </span>

                        <h1>
                            Edit Job
                        </h1>

                        <p>
                            Update the position,
                            requirements, salary and
                            application deadline.
                        </p>

                    </div>


                    <div className="edit-job-header-right">

                        <span
                            className={
                                jobStatus === "OPEN"
                                    ? "edit-job-status edit-job-open"
                                    : jobStatus === "CLOSED"
                                        ? "edit-job-status edit-job-closed"
                                        : "edit-job-status edit-job-expired"
                            }
                        >

                            <span></span>

                            {jobStatus}

                        </span>


                        <div className="create-job-header-icon">

                            <i className="bi bi-pencil-square"></i>

                        </div>

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div
                        className="
                            alert
                            alert-danger
                            create-job-alert
                        "
                    >

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                <div className="row g-4">

                    {/* =====================================
                        FORM
                    ===================================== */}

                    <div className="col-lg-8">

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* =============================
                                BASIC INFORMATION
                            ============================= */}

                            <div className="create-job-card">

                                <div className="create-job-section-heading">

                                    <div className="create-job-section-icon">

                                        <i className="bi bi-info-circle"></i>

                                    </div>

                                    <div>

                                        <h4>
                                            Basic Information
                                        </h4>

                                        <p>
                                            Update the main details
                                            of this position.
                                        </p>

                                    </div>

                                </div>


                                {/* TITLE */}

                                <div className="mb-4">

                                    <label className="create-job-label">

                                        Job Title
                                        <span>*</span>

                                    </label>

                                    <div className="create-job-input">

                                        <i className="bi bi-briefcase"></i>

                                        <input
                                            type="text"
                                            name="title"
                                            value={
                                                formData.title
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Java Full Stack Developer"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>

                                </div>


                                <div className="row g-3">

                                    {/* LOCATION */}

                                    <div className="col-md-6">

                                        <label className="create-job-label">

                                            Location
                                            <span>*</span>

                                        </label>

                                        <div className="create-job-input">

                                            <i className="bi bi-geo-alt"></i>

                                            <input
                                                type="text"
                                                name="location"
                                                value={
                                                    formData.location
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Kolkata"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    {/* EMPLOYMENT TYPE */}

                                    <div className="col-md-6">

                                        <label className="create-job-label">

                                            Employment Type
                                            <span>*</span>

                                        </label>

                                        <select
                                            className="
                                                form-select
                                                create-job-select
                                            "
                                            name="employmentType"
                                            value={
                                                formData.employmentType
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                saving
                                            }
                                        >

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

                                </div>

                            </div>


                            {/* =============================
                                DESCRIPTION
                            ============================= */}

                            <div className="create-job-card">

                                <div className="create-job-section-heading">

                                    <div className="create-job-section-icon">

                                        <i className="bi bi-file-earmark-text"></i>

                                    </div>

                                    <div>

                                        <h4>
                                            Job Description
                                        </h4>

                                        <p>
                                            Keep the responsibilities
                                            and role information
                                            accurate.
                                        </p>

                                    </div>

                                </div>


                                <label className="create-job-label">

                                    Description
                                    <span>*</span>

                                </label>


                                <textarea
                                    name="description"
                                    className="create-job-textarea"
                                    rows="9"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe the role..."
                                    disabled={
                                        saving
                                    }
                                ></textarea>


                                <div className="create-job-character-count">

                                    {
                                        formData
                                            .description
                                            .length
                                    } characters

                                </div>

                            </div>


                            {/* =============================
                                REQUIREMENTS
                            ============================= */}

                            <div className="create-job-card">

                                <div className="create-job-section-heading">

                                    <div className="create-job-section-icon">

                                        <i className="bi bi-person-check"></i>

                                    </div>

                                    <div>

                                        <h4>
                                            Requirements
                                        </h4>

                                        <p>
                                            Update experience
                                            and skill requirements.
                                        </p>

                                    </div>

                                </div>


                                <div className="row g-3">

                                    {/* EXPERIENCE */}

                                    <div className="col-md-5">

                                        <label className="create-job-label">

                                            Experience
                                            <span>*</span>

                                        </label>

                                        <div className="create-job-input">

                                            <i className="bi bi-person-workspace"></i>

                                            <input
                                                type="number"
                                                min="0"
                                                max="50"
                                                name="experienceRequired"
                                                value={
                                                    formData.experienceRequired
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                            <span className="create-job-input-suffix">
                                                Years
                                            </span>

                                        </div>

                                    </div>


                                    {/* SKILLS */}

                                    <div className="col-md-7">

                                        <label className="create-job-label">

                                            Required Skills
                                            <span>*</span>

                                        </label>

                                        <div className="create-job-input">

                                            <i className="bi bi-code-slash"></i>

                                            <input
                                                type="text"
                                                name="skills"
                                                value={
                                                    formData.skills
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Java, Spring Boot, React"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                        <small className="create-job-help-text">

                                            Separate skills using commas.

                                        </small>

                                    </div>

                                </div>

                            </div>


                            {/* =============================
                                SALARY
                            ============================= */}

                            <div className="create-job-card">

                                <div className="create-job-section-heading">

                                    <div className="create-job-section-icon">

                                        <i className="bi bi-currency-rupee"></i>

                                    </div>

                                    <div>

                                        <h4>
                                            Compensation
                                        </h4>

                                        <p>
                                            Update the annual salary
                                            range in INR.
                                        </p>

                                    </div>

                                </div>


                                <div className="row g-3">

                                    {/* MIN */}

                                    <div className="col-md-6">

                                        <label className="create-job-label">
                                            Minimum Salary
                                        </label>

                                        <div className="create-job-input">

                                            <i className="bi bi-currency-rupee"></i>

                                            <input
                                                type="number"
                                                min="0"
                                                name="salaryMin"
                                                value={
                                                    formData.salaryMin
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>


                                    {/* MAX */}

                                    <div className="col-md-6">

                                        <label className="create-job-label">
                                            Maximum Salary
                                        </label>

                                        <div className="create-job-input">

                                            <i className="bi bi-currency-rupee"></i>

                                            <input
                                                type="number"
                                                min="0"
                                                name="salaryMax"
                                                value={
                                                    formData.salaryMax
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* =============================
                                DEADLINE
                            ============================= */}

                            <div className="create-job-card">

                                <div className="create-job-section-heading">

                                    <div className="create-job-section-icon">

                                        <i className="bi bi-calendar-event"></i>

                                    </div>

                                    <div>

                                        <h4>
                                            Application Deadline
                                        </h4>

                                        <p>
                                            Update the last date
                                            candidates can apply.
                                        </p>

                                    </div>

                                </div>


                                <label className="create-job-label">

                                    Deadline
                                    <span>*</span>

                                </label>


                                <input
                                    type="date"
                                    name="deadline"
                                    className="
                                        form-control
                                        create-job-date
                                    "
                                    value={
                                        formData.deadline
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        saving
                                    }
                                />

                            </div>


                            {/* =============================
                                BUTTONS
                            ============================= */}

                            <div className="create-job-actions">

                                <button
                                    type="button"
                                    className="btn create-job-reset-button"
                                    onClick={() =>
                                        navigate(
                                            "/recruiter/jobs"
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                >

                                    <i className="bi bi-x-lg me-2"></i>

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="btn create-job-submit-button"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving ? (

                                        <>

                                            <span
                                                className="
                                                    spinner-border
                                                    spinner-border-sm
                                                    me-2
                                                "
                                            ></span>

                                            Saving Changes...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-check2-circle me-2"></i>

                                            Save Changes

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>


                    {/* =====================================
                        SIDEBAR
                    ===================================== */}

                    <div className="col-lg-4">

                        {/* PREVIEW */}

                        <div className="create-job-preview edit-job-preview">

                            <span>
                                Live Preview
                            </span>

                            <h4>

                                {formData.title ||
                                    "Job Title"}

                            </h4>


                            <div>

                                <i className="bi bi-geo-alt"></i>

                                {formData.location ||
                                    "Location"}

                            </div>


                            <div>

                                <i className="bi bi-briefcase"></i>

                                {formatEmploymentType(
                                    formData.employmentType
                                )}

                            </div>


                            <div>

                                <i className="bi bi-person-workspace"></i>

                                {formData.experienceRequired !== ""

                                    ? `${formData.experienceRequired}+ years experience`

                                    : "Experience not specified"
                                }

                            </div>


                            <div>

                                <i className="bi bi-calendar-event"></i>

                                {formData.deadline ||
                                    "No deadline"}

                            </div>


                            {formData.skills && (

                                <div className="create-job-preview-skills">

                                    {formData.skills
                                        .split(",")
                                        .filter(
                                            (skill) =>
                                                skill.trim()
                                        )
                                        .slice(
                                            0,
                                            5
                                        )
                                        .map(
                                            (
                                                skill,
                                                index
                                            ) => (

                                                <span
                                                    key={
                                                        index
                                                    }
                                                >
                                                    {skill.trim()}
                                                </span>

                                            )
                                        )}

                                </div>

                            )}

                        </div>


                        {/* INFORMATION */}

                        <div className="edit-job-info-card">

                            <div className="edit-job-info-icon">

                                <i className="bi bi-info-circle"></i>

                            </div>

                            <h4>
                                Editing Job #{jobId}
                            </h4>

                            <p>
                                Saving changes updates the
                                existing job posting.
                            </p>

                            <div className="edit-job-info-item">

                                <i className="bi bi-check-circle-fill"></i>

                                Existing applications remain attached.

                            </div>

                            <div className="edit-job-info-item">

                                <i className="bi bi-check-circle-fill"></i>

                                Candidates will see updated
                                job information.

                            </div>

                            <div className="edit-job-info-item">

                                <i className="bi bi-check-circle-fill"></i>

                                Job status is managed separately
                                from the My Jobs page.

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default EditJob;