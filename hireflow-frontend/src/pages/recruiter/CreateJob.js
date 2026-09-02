import { useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance";

import "./CreateJob.css";

function CreateJob() {

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

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };

    // =====================================================
    // VALIDATE
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
            Number(formData.salaryMin) < 0
        ) {

            setError(
                "Minimum salary cannot be negative."
            );

            return false;
        }

        if (
            formData.salaryMax !== "" &&
            Number(formData.salaryMax) < 0
        ) {

            setError(
                "Maximum salary cannot be negative."
            );

            return false;
        }

        if (
            formData.salaryMin !== "" &&
            formData.salaryMax !== "" &&
            Number(formData.salaryMin) >
                Number(formData.salaryMax)
        ) {

            setError(
                "Minimum salary cannot be greater than maximum salary."
            );

            return false;
        }

        if (!formData.skills.trim()) {

            setError(
                "Please add at least one required skill."
            );

            return false;
        }

        if (!formData.deadline) {

            setError(
                "Application deadline is required."
            );

            return false;
        }

        const selectedDeadline =
            new Date(
                `${formData.deadline}T23:59:59`
            );

        const today =
            new Date();

        if (
            selectedDeadline < today
        ) {

            setError(
                "Application deadline cannot be in the past."
            );

            return false;
        }

        return true;
    };

    // =====================================================
    // CREATE JOB
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        if (!validateForm()) {
            return;
        }

        setLoading(true);

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
                await axiosInstance.post(
                    "/api/recruiter/jobs",
                    requestData
                );

            console.log(
                "Job created:",
                response.data
            );

            navigate(
                "/recruiter/jobs",
                {
                    replace: true,
                    state: {
                        message:
                            "Job posted successfully."
                    }
                }
            );

        } catch (error) {

            console.error(
                "Create job error:",
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
                    "Unable to create the job."
                );
            }

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // RESET
    // =====================================================

    const handleReset = () => {

        setFormData({
            title: "",
            description: "",
            location: "",
            employmentType:
                "FULL_TIME",
            experienceRequired: "",
            salaryMin: "",
            salaryMax: "",
            skills: "",
            deadline: ""
        });

        setError("");
    };

    return (

        <div className="create-job-page">

            <div className="container">

                {/* =====================================
                    BACK
                ===================================== */}

                <Link
                    to="/recruiter/jobs"
                    className="create-job-back"
                >

                    <i className="bi bi-arrow-left"></i>

                    Back to My Jobs

                </Link>


                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="create-job-header">

                    <div>

                        <span className="create-job-eyebrow">
                            Recruitment
                        </span>

                        <h1>
                            Post a New Job
                        </h1>

                        <p>
                            Add the position details,
                            requirements and application
                            deadline.
                        </p>

                    </div>


                    <div className="create-job-header-icon">

                        <i className="bi bi-briefcase-fill"></i>

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

                    {/* =================================
                        FORM
                    ================================= */}

                    <div className="col-lg-8">

                        <form
                            onSubmit={handleSubmit}
                        >

                            {/* BASIC INFO */}

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
                                            Tell candidates about
                                            the role you're hiring for.
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
                                                loading
                                            }
                                        />

                                    </div>

                                </div>


                                {/* LOCATION + TYPE */}

                                <div className="row g-3">

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
                                                placeholder="Kolkata, West Bengal"
                                                disabled={
                                                    loading
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="create-job-label">

                                            Employment Type
                                            <span>*</span>

                                        </label>

                                        <select
                                            className="form-select create-job-select"
                                            name="employmentType"
                                            value={
                                                formData.employmentType
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                loading
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


                            {/* DESCRIPTION */}

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
                                            Explain the responsibilities
                                            and expectations for this role.
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
                                    placeholder={
                                        "Describe the role, responsibilities, qualifications and what the candidate will work on..."
                                    }
                                    disabled={
                                        loading
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


                            {/* REQUIREMENTS */}

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
                                            Define experience and
                                            technical skills.
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
                                                    formData
                                                        .experienceRequired
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="1"
                                                disabled={
                                                    loading
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
                                                    loading
                                                }
                                            />

                                        </div>

                                        <small className="create-job-help-text">
                                            Separate skills using commas.
                                        </small>

                                    </div>

                                </div>

                            </div>


                            {/* COMPENSATION */}

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
                                            Enter the annual salary
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
                                                placeholder="400000"
                                                disabled={
                                                    loading
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
                                                placeholder="700000"
                                                disabled={
                                                    loading
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* DEADLINE */}

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
                                            Choose the final date
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
                                    className="form-control create-job-date"
                                    value={
                                        formData.deadline
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        loading
                                    }
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="create-job-actions">

                                <button
                                    type="button"
                                    className="btn create-job-reset-button"
                                    onClick={
                                        handleReset
                                    }
                                    disabled={
                                        loading
                                    }
                                >

                                    <i className="bi bi-arrow-counterclockwise me-2"></i>

                                    Reset

                                </button>


                                <button
                                    type="submit"
                                    className="btn create-job-submit-button"
                                    disabled={
                                        loading
                                    }
                                >

                                    {loading ? (

                                        <>

                                            <span
                                                className="
                                                    spinner-border
                                                    spinner-border-sm
                                                    me-2
                                                "
                                            ></span>

                                            Posting Job...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-send-fill me-2"></i>

                                            Publish Job

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>


                    {/* =================================
                        RIGHT SIDEBAR
                    ================================= */}

                    <div className="col-lg-4">

                        <div className="create-job-sidebar">

                            <div className="create-job-sidebar-icon">

                                <i className="bi bi-lightbulb"></i>

                            </div>

                            <h4>
                                Posting Tips
                            </h4>

                            <p>
                                A clear and complete job
                                description attracts better
                                candidates.
                            </p>


                            <div className="posting-tip">

                                <i className="bi bi-check-circle-fill"></i>

                                <span>
                                    Use a clear and specific
                                    job title.
                                </span>

                            </div>


                            <div className="posting-tip">

                                <i className="bi bi-check-circle-fill"></i>

                                <span>
                                    Explain key responsibilities
                                    and expectations.
                                </span>

                            </div>


                            <div className="posting-tip">

                                <i className="bi bi-check-circle-fill"></i>

                                <span>
                                    Add only relevant skills.
                                </span>

                            </div>


                            <div className="posting-tip">

                                <i className="bi bi-check-circle-fill"></i>

                                <span>
                                    Provide a realistic
                                    experience requirement.
                                </span>

                            </div>


                            <div className="posting-tip">

                                <i className="bi bi-check-circle-fill"></i>

                                <span>
                                    Add salary information
                                    when possible.
                                </span>

                            </div>

                        </div>


                        {/* PREVIEW */}

                        <div className="create-job-preview">

                            <span>
                                Preview
                            </span>

                            <h4>

                                {formData.title ||
                                    "Your Job Title"}

                            </h4>


                            <div>

                                <i className="bi bi-geo-alt"></i>

                                {formData.location ||
                                    "Location"}

                            </div>


                            <div>

                                <i className="bi bi-briefcase"></i>

                                {formData.employmentType
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
                                    )
                                }

                            </div>


                            <div>

                                <i className="bi bi-person-workspace"></i>

                                {formData
                                    .experienceRequired !== ""

                                    ? `${formData.experienceRequired}+ years`

                                    : "Experience"
                                }

                            </div>


                            {formData.skills && (

                                <div className="create-job-preview-skills">

                                    {formData.skills
                                        .split(",")
                                        .slice(0, 4)
                                        .filter(
                                            (skill) =>
                                                skill.trim()
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

                    </div>

                </div>

            </div>

        </div>
    );
}

export default CreateJob;