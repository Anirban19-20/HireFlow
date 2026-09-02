import {
    useEffect,
    useRef,
    useState
} from "react";

import axiosInstance
    from "../../api/axiosInstance";

import "./CandidateProfile.css";


// =====================================================
// API ENDPOINTS
// =====================================================

const PROFILE_API =
    "/api/candidate/profile";

const RESUME_API =
    "/api/candidate/profile/resume";


function CandidateProfile() {

    const fileInputRef =
        useRef(null);


    const [
        profileExists,
        setProfileExists
    ] = useState(false);


    const [
        profile,
        setProfile
    ] = useState(null);


    const [
        formData,
        setFormData
    ] = useState({
        phone: "",
        location: "",
        skills: "",
        experience: "",
        education: ""
    });


    const [
        selectedFile,
        setSelectedFile
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
        uploading,
        setUploading
    ] = useState(false);


    const [
        deletingResume,
        setDeletingResume
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    // =====================================================
    // BACKEND ERROR MESSAGE
    // =====================================================

    const getBackendErrorMessage = (
        requestError,
        fallbackMessage
    ) => {

        const data =
            requestError?.response?.data;


        if (
            typeof data === "string" &&
            data.trim()
        ) {

            return data.trim();
        }


        if (
            data?.message
        ) {

            return data.message;
        }


        if (
            data?.error
        ) {

            return data.error;
        }


        return fallbackMessage;
    };


    // =====================================================
    // APPLY PROFILE TO FORM
    // =====================================================

    const applyProfileToForm = (
        data
    ) => {

        setFormData({
            phone:
                data?.phone || "",

            location:
                data?.location || "",

            skills:
                data?.skills || "",

            experience:
                data?.experience !== null &&
                data?.experience !== undefined
                    ? data.experience
                    : "",

            education:
                data?.education || ""
        });
    };


    // =====================================================
    // LOAD PROFILE
    // =====================================================
    useEffect(() => {

        const loadProfile = async () => {

            setLoading(true);
            setError("");

            try {

                const response =
                    await axiosInstance.get(
                        PROFILE_API
                    );

                const data =
                    response.data;

                setProfile(
                    data
                );

                setProfileExists(
                    true
                );

                setFormData({
                    phone:
                        data?.phone || "",

                    location:
                        data?.location || "",

                    skills:
                        data?.skills || "",

                    experience:
                        data?.experience !== null &&
                        data?.experience !== undefined
                            ? data.experience
                            : "",

                    education:
                        data?.education || ""
                });

            } catch (
                requestError
            ) {

                console.error(
                    "Profile loading error:",
                    requestError
                );

                const data =
                    requestError?.response?.data;

                let message =
                    "Unable to load your profile.";

                if (
                    typeof data === "string" &&
                    data.trim()
                ) {

                    message =
                        data.trim();

                } else if (
                    data?.message
                ) {

                    message =
                        data.message;

                } else if (
                    data?.error
                ) {

                    message =
                        data.error;
                }

                const status =
                    requestError?.response?.status;

                const normalizedMessage =
                    String(
                        message || ""
                    )
                        .toLowerCase();

                // =============================================
                // PROFILE DOES NOT EXIST YET
                // =============================================

                if (
                    status === 404 &&
                    normalizedMessage.includes(
                        "candidate profile not found"
                    )
                ) {

                    setProfileExists(
                        false
                    );

                    setProfile(
                        null
                    );

                    setFormData({
                        phone: "",
                        location: "",
                        skills: "",
                        experience: "",
                        education: ""
                    });

                    return;
                }

                setError(
                    message
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

        loadProfile();

    }, []);


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange =
        (
            event
        ) => {

            const {
                name,
                value
            } = event.target;


            setFormData(
                (
                    previous
                ) => ({
                    ...previous,

                    [name]:
                        value
                })
            );


            setError(
                ""
            );


            setSuccess(
                ""
            );
        };


    // =====================================================
    // CREATE / UPDATE PROFILE
    // =====================================================

    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();


            setSaving(
                true
            );


            setError(
                ""
            );


            setSuccess(
                ""
            );


            try {

                const experience =
                    formData.experience === ""
                        ? null
                        : Number(
                            formData.experience
                        );


                if (
                    experience !== null &&
                    (
                        Number.isNaN(
                            experience
                        ) ||
                        experience < 0
                    )
                ) {

                    setError(
                        "Experience must be zero or greater."
                    );

                    return;
                }


                const requestData = {

                    phone:
                        formData.phone
                            .trim(),

                    location:
                        formData.location
                            .trim(),

                    skills:
                        formData.skills
                            .trim(),

                    experience:
                        experience,

                    education:
                        formData.education
                            .trim()
                };


                let response;


                // =============================================
                // UPDATE EXISTING PROFILE
                // =============================================

                if (
                    profileExists
                ) {

                    response =
                        await axiosInstance.put(
                            PROFILE_API,
                            requestData
                        );


                    setSuccess(
                        "Profile updated successfully."
                    );

                }

                // =============================================
                // CREATE NEW PROFILE
                // =============================================

                else {

                    response =
                        await axiosInstance.post(
                            PROFILE_API,
                            requestData
                        );


                    setProfileExists(
                        true
                    );


                    setSuccess(
                        "Profile created successfully."
                    );
                }


                const updatedProfile =
                    response.data;


                setProfile(
                    updatedProfile
                );


                applyProfileToForm(
                    updatedProfile
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Profile save error:",
                    requestError
                );


                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to save your profile."
                    )
                );

            } finally {

                setSaving(
                    false
                );
            }
        };


    // =====================================================
    // FILE SELECTION
    // =====================================================

    const handleFileChange =
        (
            event
        ) => {

            const file =
                event.target.files?.[0];


            setError(
                ""
            );


            setSuccess(
                ""
            );


            if (
                !file
            ) {

                setSelectedFile(
                    null
                );

                return;
            }


            // =============================================
            // PDF ONLY
            // =============================================

            if (
                file.type !==
                "application/pdf"
            ) {

                setError(
                    "Please select a PDF resume."
                );


                setSelectedFile(
                    null
                );


                event.target.value =
                    "";


                return;
            }


            // =============================================
            // MAX 5 MB
            // =============================================

            const maxSize =
                5 * 1024 * 1024;


            if (
                file.size >
                maxSize
            ) {

                setError(
                    "Resume must be smaller than 5 MB."
                );


                setSelectedFile(
                    null
                );


                event.target.value =
                    "";


                return;
            }


            setSelectedFile(
                file
            );
        };


    // =====================================================
    // UPLOAD RESUME
    // =====================================================

    const handleResumeUpload =
        async () => {

            if (
                !profileExists
            ) {

                setError(
                    "Create your profile before uploading a resume."
                );

                return;
            }


            if (
                !selectedFile
            ) {

                setError(
                    "Please select a PDF resume first."
                );

                return;
            }


            setUploading(
                true
            );


            setError(
                ""
            );


            setSuccess(
                ""
            );


            try {

                const multipartData =
                    new FormData();


                multipartData.append(
                    "file",
                    selectedFile
                );


                /*
                 * Do not manually set Content-Type here.
                 *
                 * The browser automatically adds the correct
                 * multipart/form-data boundary.
                 */

                const response =
                    await axiosInstance.post(
                        RESUME_API,
                        multipartData
                    );


                setProfile(
                    response.data
                );


                setSelectedFile(
                    null
                );


                if (
                    fileInputRef.current
                ) {

                    fileInputRef.current.value =
                        "";
                }


                setSuccess(
                    "Resume uploaded successfully."
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Resume upload error:",
                    requestError
                );


                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to upload your resume."
                    )
                );

            } finally {

                setUploading(
                    false
                );
            }
        };


    // =====================================================
    // DELETE RESUME
    // =====================================================

    const handleDeleteResume =
        async () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to remove your current resume?"
                );


            if (
                !confirmed
            ) {

                return;
            }


            setDeletingResume(
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
                    await axiosInstance.delete(
                        RESUME_API
                    );


                setProfile(
                    response.data
                );


                setSelectedFile(
                    null
                );


                if (
                    fileInputRef.current
                ) {

                    fileInputRef.current.value =
                        "";
                }


                setSuccess(
                    "Resume removed successfully."
                );

            } catch (
                requestError
            ) {

                console.error(
                    "Resume delete error:",
                    requestError
                );


                setError(
                    getBackendErrorMessage(
                        requestError,
                        "Unable to remove your resume."
                    )
                );

            } finally {

                setDeletingResume(
                    false
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

            <div className="candidate-profile-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>


                <p>
                    Loading your profile...
                </p>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="candidate-profile-page">

            <div className="container">


                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="candidate-profile-header">

                    <div>

                        <span className="profile-eyebrow">
                            Candidate Profile
                        </span>


                        <h1>
                            Your Professional Profile
                        </h1>


                        <p>
                            Keep your information updated so
                            recruiters can better understand
                            your experience and skills.
                        </p>

                    </div>


                    <div className="profile-header-icon">

                        <i className="bi bi-person-badge"></i>

                    </div>

                </div>


                {/* =========================================
                    ALERTS
                ========================================= */}

                {success && (

                    <div className="alert alert-success profile-alert">

                        <i className="bi bi-check-circle-fill me-2"></i>

                        {success}

                    </div>

                )}


                {error && (

                    <div className="alert alert-danger profile-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                <div className="row g-4">


                    {/* ======================================
                        LEFT PROFILE SUMMARY
                    ====================================== */}

                    <div className="col-lg-4">

                        <div className="profile-summary-card">


                            {/* AVATAR */}

                            <div className="profile-avatar-large">

                                {profile?.name
                                    ? profile.name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "C"
                                }

                            </div>


                            <h3>

                                {profile?.name ||
                                    "Candidate"
                                }

                            </h3>


                            <p className="profile-email">

                                {profile?.email ||
                                    "Complete your profile"
                                }

                            </p>


                            <div className="profile-summary-divider"></div>


                            {/* LOCATION */}

                            <div className="profile-summary-row">

                                <i className="bi bi-geo-alt"></i>


                                <div>

                                    <span>
                                        Location
                                    </span>


                                    <strong>

                                        {formData.location ||
                                            "Not added"
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* EXPERIENCE */}

                            <div className="profile-summary-row">

                                <i className="bi bi-briefcase"></i>


                                <div>

                                    <span>
                                        Experience
                                    </span>


                                    <strong>

                                        {formData.experience !== ""

                                            ? `${formData.experience} years`

                                            : "Not added"
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* RESUME */}

                            <div className="profile-summary-row">

                                <i className="bi bi-file-earmark-pdf"></i>


                                <div>

                                    <span>
                                        Resume
                                    </span>


                                    <strong
                                        className={
                                            profile?.resumeUrl
                                                ? "profile-resume-active"
                                                : ""
                                        }
                                    >

                                        {profile?.resumeUrl
                                            ? "Uploaded"
                                            : "Not uploaded"
                                        }

                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* ==================================
                            PROFILE COMPLETION
                        ================================== */}

                        <div className="profile-completion-card">

                            <h5>
                                Profile Checklist
                            </h5>


                            {/* PHONE */}

                            <div className="profile-check-item">

                                <i
                                    className={
                                        formData.phone
                                            ? "bi bi-check-circle-fill"
                                            : "bi bi-circle"
                                    }
                                ></i>

                                Phone Number

                            </div>


                            {/* LOCATION */}

                            <div className="profile-check-item">

                                <i
                                    className={
                                        formData.location
                                            ? "bi bi-check-circle-fill"
                                            : "bi bi-circle"
                                    }
                                ></i>

                                Location

                            </div>


                            {/* SKILLS */}

                            <div className="profile-check-item">

                                <i
                                    className={
                                        formData.skills
                                            ? "bi bi-check-circle-fill"
                                            : "bi bi-circle"
                                    }
                                ></i>

                                Skills

                            </div>


                            {/* EDUCATION */}

                            <div className="profile-check-item">

                                <i
                                    className={
                                        formData.education
                                            ? "bi bi-check-circle-fill"
                                            : "bi bi-circle"
                                    }
                                ></i>

                                Education

                            </div>


                            {/* RESUME */}

                            <div className="profile-check-item">

                                <i
                                    className={
                                        profile?.resumeUrl
                                            ? "bi bi-check-circle-fill"
                                            : "bi bi-circle"
                                    }
                                ></i>

                                Resume

                            </div>

                        </div>

                    </div>


                    {/* ======================================
                        RIGHT SIDE
                    ====================================== */}

                    <div className="col-lg-8">


                        {/* ==================================
                            PROFILE FORM
                        ================================== */}

                        <div className="profile-form-card">

                            <div className="profile-section-heading">

                                <div className="profile-section-icon">

                                    <i className="bi bi-person-lines-fill"></i>

                                </div>


                                <div>

                                    <h4>
                                        Profile Information
                                    </h4>


                                    <p>
                                        Add details about your
                                        professional background.
                                    </p>

                                </div>

                            </div>


                            {/* CREATE INFO */}

                            {!profileExists && (

                                <div className="profile-create-info">

                                    <i className="bi bi-info-circle-fill"></i>


                                    <span>
                                        You haven't created your
                                        candidate profile yet.
                                        Fill in the details below
                                        to get started.
                                    </span>

                                </div>

                            )}


                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                <div className="row g-3">


                                    {/* PHONE */}

                                    <div className="col-md-6">

                                        <label className="profile-label">
                                            Phone Number
                                        </label>


                                        <div className="profile-input-wrapper">

                                            <i className="bi bi-telephone"></i>


                                            <input
                                                type="tel"
                                                name="phone"

                                                value={
                                                    formData.phone
                                                }

                                                onChange={
                                                    handleChange
                                                }

                                                placeholder="9876543210"
                                            />

                                        </div>

                                    </div>


                                    {/* LOCATION */}

                                    <div className="col-md-6">

                                        <label className="profile-label">
                                            Location
                                        </label>


                                        <div className="profile-input-wrapper">

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
                                            />

                                        </div>

                                    </div>


                                    {/* EXPERIENCE */}

                                    <div className="col-md-6">

                                        <label className="profile-label">
                                            Experience
                                        </label>


                                        <div className="profile-input-wrapper">

                                            <i className="bi bi-briefcase"></i>


                                            <input
                                                type="number"
                                                name="experience"

                                                min="0"
                                                max="50"

                                                value={
                                                    formData.experience
                                                }

                                                onChange={
                                                    handleChange
                                                }

                                                placeholder="Years of experience"
                                            />

                                        </div>

                                    </div>


                                    {/* EDUCATION */}

                                    <div className="col-md-6">

                                        <label className="profile-label">
                                            Education
                                        </label>


                                        <div className="profile-input-wrapper">

                                            <i className="bi bi-mortarboard"></i>


                                            <input
                                                type="text"
                                                name="education"

                                                value={
                                                    formData.education
                                                }

                                                onChange={
                                                    handleChange
                                                }

                                                placeholder="B.Tech in Computer Science"
                                            />

                                        </div>

                                    </div>


                                    {/* SKILLS */}

                                    <div className="col-12">

                                        <label className="profile-label">
                                            Skills
                                        </label>


                                        <textarea
                                            className="profile-textarea"

                                            name="skills"

                                            rows="4"

                                            value={
                                                formData.skills
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            placeholder="Java, Spring Boot, React, PostgreSQL, Docker"
                                        ></textarea>


                                        <small className="profile-help-text">
                                            Separate skills using commas.
                                        </small>

                                    </div>

                                </div>


                                {/* FORM ACTION */}

                                <div className="profile-form-actions">

                                    <button
                                        type="submit"

                                        className="btn profile-save-button"

                                        disabled={
                                            saving
                                        }
                                    >

                                        {saving ? (

                                            <>

                                                <span className="spinner-border spinner-border-sm me-2"></span>

                                                Saving...

                                            </>

                                        ) : (

                                            <>

                                                <i className="bi bi-check2-circle me-2"></i>


                                                {profileExists
                                                    ? "Save Changes"
                                                    : "Create Profile"
                                                }

                                            </>

                                        )}

                                    </button>

                                </div>

                            </form>

                        </div>


                        {/* ==================================
                            RESUME MANAGEMENT
                        ================================== */}

                        <div className="profile-form-card resume-management-card">

                            <div className="profile-section-heading">

                                <div className="profile-section-icon resume-section-icon">

                                    <i className="bi bi-file-earmark-pdf"></i>

                                </div>


                                <div>

                                    <h4>
                                        Resume
                                    </h4>


                                    <p>
                                        Upload your latest PDF resume.
                                    </p>

                                </div>

                            </div>


                            {/* =================================
                                CURRENT RESUME
                            ================================= */}

                            {profile?.resumeUrl ? (

                                <div className="current-resume-card">

                                    <div className="current-resume-left">

                                        <div className="pdf-file-icon">

                                            <i className="bi bi-file-earmark-pdf-fill"></i>

                                        </div>


                                        <div>

                                            <strong>
                                                Current Resume
                                            </strong>


                                            <span>
                                                Your resume is ready
                                                for job applications.
                                            </span>

                                        </div>

                                    </div>


                                    <div className="current-resume-actions">

                                        <a
                                            href={
                                                profile.resumeUrl
                                            }

                                            target="_blank"

                                            rel="noreferrer"

                                            className="btn resume-view-button"
                                        >

                                            <i className="bi bi-eye me-1"></i>

                                            View

                                        </a>


                                        <button
                                            type="button"

                                            className="btn resume-delete-button"

                                            onClick={
                                                handleDeleteResume
                                            }

                                            disabled={
                                                deletingResume
                                            }
                                        >

                                            {deletingResume ? (

                                                <>

                                                    <span className="spinner-border spinner-border-sm me-1"></span>

                                                    Removing...

                                                </>

                                            ) : (

                                                <>

                                                    <i className="bi bi-trash me-1"></i>

                                                    Remove

                                                </>

                                            )}

                                        </button>

                                    </div>

                                </div>

                            ) : (

                                <div className="no-resume-message">

                                    <i className="bi bi-cloud-arrow-up"></i>


                                    <div>

                                        <strong>
                                            No resume uploaded
                                        </strong>


                                        <span>
                                            Upload a PDF before
                                            applying for jobs.
                                        </span>

                                    </div>

                                </div>

                            )}


                            {/* =================================
                                RESUME UPLOAD
                            ================================= */}

                            <div className="resume-upload-area">

                                <div>

                                    <label
                                        htmlFor="resumeFile"

                                        className="resume-upload-label"
                                    >

                                        <i className="bi bi-cloud-arrow-up-fill"></i>


                                        <span>
                                            Choose PDF Resume
                                        </span>

                                    </label>


                                    <input
                                        ref={
                                            fileInputRef
                                        }

                                        id="resumeFile"

                                        type="file"

                                        accept="application/pdf"

                                        onChange={
                                            handleFileChange
                                        }

                                        hidden
                                    />

                                </div>


                                {/* SELECTED FILE */}

                                {selectedFile && (

                                    <div className="selected-resume-file">

                                        <i className="bi bi-file-earmark-pdf-fill"></i>


                                        <div>

                                            <strong>
                                                {selectedFile.name}
                                            </strong>


                                            <span>

                                                {(
                                                    selectedFile.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(
                                                    2
                                                )} MB

                                            </span>

                                        </div>

                                    </div>

                                )}


                                {/* UPLOAD BUTTON */}

                                <button
                                    type="button"

                                    className="btn resume-upload-button"

                                    onClick={
                                        handleResumeUpload
                                    }

                                    disabled={
                                        uploading ||
                                        !selectedFile ||
                                        !profileExists
                                    }
                                >

                                    {uploading ? (

                                        <>

                                            <span className="spinner-border spinner-border-sm me-2"></span>

                                            Uploading...

                                        </>

                                    ) : (

                                        <>

                                            <i className="bi bi-cloud-upload me-2"></i>


                                            {profile?.resumeUrl
                                                ? "Upload New Resume"
                                                : "Upload Resume"
                                            }

                                        </>

                                    )}

                                </button>


                                <p className="resume-upload-note">

                                    <i className="bi bi-shield-check"></i>

                                    PDF only · Maximum 5 MB

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default CandidateProfile;