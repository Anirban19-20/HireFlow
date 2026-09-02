import {
    useEffect,
    useMemo,
    useState
} from "react";

import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

import "./RecruiterProfile.css";

function RecruiterProfile() {

    const { user } = useAuth();

    const [profile, setProfile] =
        useState(null);

    const [profileExists, setProfileExists] =
        useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        companyDescription: "",
        website: ""
    });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    // =====================================================
    // LOAD PROFILE
    // =====================================================

    useEffect(() => {

        loadProfile();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadProfile = async () => {

        setLoading(true);
        setError("");

        try {

            const response =
                await axiosInstance.get(
                    "/api/recruiter/profile"
                );

            const data =
                response.data;

            setProfile(data);

            setProfileExists(true);

            setFormData({
                companyName:
                    data.companyName || "",

                companyDescription:
                    data.companyDescription || "",

                website:
                    data.website || ""
            });

        } catch (error) {

            console.error(
                "Recruiter profile loading error:",
                error
            );

            // =============================================
            // PROFILE DOES NOT EXIST YET
            // =============================================

            if (
                error.response?.status === 404 ||
                String(
                    error.response
                        ?.data
                        ?.message || ""
                )
                    .toLowerCase()
                    .includes(
                        "profile not found"
                    )
            ) {

                setProfile(null);

                setProfileExists(false);

                setFormData({
                    companyName: "",
                    companyDescription: "",
                    website: ""
                });

            } else {

                setError(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to load recruiter profile."
                );
            }

        } finally {

            setLoading(false);
        }
    };

    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (
        event
    ) => {

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
        setSuccess("");
    };

    // =====================================================
    // VALIDATE
    // =====================================================

    const validateForm = () => {

        // =================================================
        // COMPANY NAME
        // =================================================

        if (
            !formData
                .companyName
                .trim()
        ) {

            setError(
                "Company name is required."
            );

            return false;
        }

        // =================================================
        // WEBSITE
        // =================================================

        if (
            formData.website.trim()
        ) {

            try {

                const website =
                    formData
                        .website
                        .trim();

                const websiteWithProtocol =
                    website.startsWith(
                        "http://"
                    ) ||
                    website.startsWith(
                        "https://"
                    )
                        ? website
                        : `https://${website}`;

                new URL(
                    websiteWithProtocol
                );

            } catch {

                setError(
                    "Please enter a valid company website."
                );

                return false;
            }
        }

        return true;
    };

    // =====================================================
    // NORMALIZE WEBSITE
    // =====================================================

    const normalizeWebsite = (
        website
    ) => {

        const value =
            website.trim();

        if (!value) {

            return "";
        }

        if (
            value.startsWith(
                "http://"
            ) ||
            value.startsWith(
                "https://"
            )
        ) {

            return value;
        }

        return `https://${value}`;
    };

    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) {

            return;
        }

        setSaving(true);

        try {

            const requestData = {

                companyName:
                    formData
                        .companyName
                        .trim(),

                companyDescription:
                    formData
                        .companyDescription
                        .trim(),

                website:
                    normalizeWebsite(
                        formData.website
                    )
            };

            let response;

            // =============================================
            // CREATE PROFILE
            // =============================================

            if (!profileExists) {

                response =
                    await axiosInstance.post(
                        "/api/recruiter/profile",
                        requestData
                    );

                setSuccess(
                    "Recruiter profile created successfully."
                );

            } else {

                // =========================================
                // UPDATE PROFILE
                // =========================================

                response =
                    await axiosInstance.put(
                        "/api/recruiter/profile",
                        requestData
                    );

                setSuccess(
                    "Recruiter profile updated successfully."
                );
            }

            // =============================================
            // RESPONSE CONTAINS PROFILE
            // =============================================

            if (
                response.data &&
                typeof response.data ===
                    "object"
            ) {

                const updated =
                    response.data;

                setProfile(
                    updated
                );

                setProfileExists(
                    true
                );

                setFormData({

                    companyName:
                        updated.companyName ??
                        requestData.companyName,

                    companyDescription:
                        updated.companyDescription ??
                        requestData.companyDescription,

                    website:
                        updated.website ??
                        requestData.website
                });

            } else {

                // =========================================
                // FALLBACK
                // =========================================

                await loadProfile();
            }

        } catch (error) {

            console.error(
                "Recruiter profile save error:",
                error
            );

            setError(
                error.response
                    ?.data
                    ?.message ||
                "Unable to save recruiter profile."
            );

        } finally {

            setSaving(false);
        }
    };

    // =====================================================
    // PROFILE COMPLETION
    // =====================================================

    const completion =
        useMemo(() => {

            const fields = [
                formData.companyName,
                formData.companyDescription,
                formData.website
            ];

            const completed =
                fields.filter(
                    (value) =>
                        value &&
                        value
                            .trim()
                            .length > 0
                ).length;

            return Math.round(
                (
                    completed /
                    fields.length
                ) * 100
            );

        }, [formData]);

    // =====================================================
    // COMPANY INITIAL
    // =====================================================

    const companyInitial =
        formData.companyName
            ?.trim()
            ?.charAt(0)
            ?.toUpperCase() ||
        user?.name
            ?.charAt(0)
            ?.toUpperCase() ||
        "R";

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="recruiter-profile-loading">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <p>
                    Loading recruiter profile...
                </p>

            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="recruiter-profile-page">

            <div className="container">

                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="recruiter-profile-header">

                    <div>

                        <span className="recruiter-profile-eyebrow">
                            Company Profile
                        </span>

                        <h1>
                            Recruiter Profile
                        </h1>

                        <p>
                            Manage your company information
                            and keep your recruiter profile
                            up to date.
                        </p>

                    </div>


                    <div className="recruiter-profile-header-icon">

                        <i className="bi bi-building"></i>

                    </div>

                </div>


                {/* =====================================
                    ALERTS
                ===================================== */}

                {success && (

                    <div className="alert alert-success recruiter-profile-alert">

                        <i className="bi bi-check-circle-fill me-2"></i>

                        {success}

                    </div>

                )}


                {error && (

                    <div className="alert alert-danger recruiter-profile-alert">

                        <i className="bi bi-exclamation-circle-fill me-2"></i>

                        {error}

                    </div>

                )}


                <div className="row g-4">

                    {/* =================================
                        LEFT - COMPANY CARD
                    ================================= */}

                    <div className="col-lg-4">

                        <div className="recruiter-company-card">

                            <div className="recruiter-company-avatar">

                                {companyInitial}

                            </div>


                            <h3>

                                {formData.companyName ||
                                    "Your Company"}

                            </h3>


                            <span className="recruiter-company-role">

                                <i className="bi bi-person-badge"></i>

                                Recruiter

                            </span>


                            <div className="recruiter-company-divider"></div>


                            {/* USER */}

                            <div className="recruiter-company-detail">

                                <div>

                                    <i className="bi bi-person"></i>

                                </div>

                                <span>

                                    <small>
                                        Recruiter
                                    </small>

                                    <strong>

                                        {user?.name ||
                                            profile?.name ||
                                            "Recruiter"}

                                    </strong>

                                </span>

                            </div>


                            {/* EMAIL */}

                            <div className="recruiter-company-detail">

                                <div>

                                    <i className="bi bi-envelope"></i>

                                </div>

                                <span>

                                    <small>
                                        Email
                                    </small>

                                    <strong>

                                        {user?.email ||
                                            profile?.email ||
                                            "Not available"}

                                    </strong>

                                </span>

                            </div>


                            {/* WEBSITE */}

                            <div className="recruiter-company-detail">

                                <div>

                                    <i className="bi bi-globe"></i>

                                </div>

                                <span>

                                    <small>
                                        Website
                                    </small>

                                    {formData.website ? (

                                        <a
                                            href={
                                                normalizeWebsite(
                                                    formData.website
                                                )
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                        >

                                            {formData.website}

                                        </a>

                                    ) : (

                                        <strong>
                                            Not added
                                        </strong>

                                    )}

                                </span>

                            </div>

                        </div>


                        {/* =================================
                            PROFILE COMPLETION
                        ================================= */}

                        <div className="recruiter-profile-completion">

                            <div className="recruiter-completion-heading">

                                <div>

                                    <span>
                                        Profile Strength
                                    </span>

                                    <h4>
                                        Company Profile
                                    </h4>

                                </div>

                                <strong>
                                    {completion}%
                                </strong>

                            </div>


                            <div className="recruiter-completion-track">

                                <div
                                    className="recruiter-completion-value"
                                    style={{
                                        width:
                                            `${completion}%`
                                    }}
                                ></div>

                            </div>


                            <p>

                                {completion === 100
                                    ? "Your company profile is complete."
                                    : "Add all company information to complete your profile."
                                }

                            </p>

                        </div>

                    </div>


                    {/* =================================
                        RIGHT - FORM
                    ================================= */}

                    <div className="col-lg-8">

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* =============================
                                COMPANY INFORMATION
                            ============================= */}

                            <div className="recruiter-profile-form-card">

                                <div className="recruiter-profile-form-heading">

                                    <div>

                                        <i className="bi bi-building"></i>

                                    </div>

                                    <span>

                                        <h4>
                                            Company Information
                                        </h4>

                                        <p>

                                            {profileExists
                                                ? "Update the information candidates see about your company."
                                                : "Create your company profile before posting and managing opportunities."
                                            }

                                        </p>

                                    </span>

                                </div>


                                {/* =====================
                                    COMPANY NAME
                                ===================== */}

                                <div className="mb-4">

                                    <label className="recruiter-profile-label">

                                        Company Name
                                        <span>*</span>

                                    </label>

                                    <div className="recruiter-profile-input">

                                        <i className="bi bi-building"></i>

                                        <input
                                            type="text"
                                            name="companyName"
                                            value={
                                                formData.companyName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="HireFlow Technologies"
                                            disabled={
                                                saving
                                            }
                                            maxLength="150"
                                        />

                                    </div>

                                </div>


                                {/* =====================
                                    WEBSITE
                                ===================== */}

                                <div className="mb-4">

                                    <label className="recruiter-profile-label">
                                        Company Website
                                    </label>

                                    <div className="recruiter-profile-input">

                                        <i className="bi bi-globe2"></i>

                                        <input
                                            type="text"
                                            name="website"
                                            value={
                                                formData.website
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="https://company.com"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </div>

                                    <small className="recruiter-profile-help">

                                        Example: https://hireflow.com

                                    </small>

                                </div>


                                {/* =====================
                                    DESCRIPTION
                                ===================== */}

                                <div>

                                    <label className="recruiter-profile-label">

                                        Company Description

                                    </label>

                                    <textarea
                                        name="companyDescription"
                                        value={
                                            formData.companyDescription
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="8"
                                        className="recruiter-profile-textarea"
                                        placeholder="Tell candidates about your company, culture, products and the type of people you are looking for..."
                                        disabled={
                                            saving
                                        }
                                    ></textarea>


                                    <div className="recruiter-description-footer">

                                        <span>
                                            Help candidates understand
                                            your organization.
                                        </span>

                                        <span>

                                            {
                                                formData
                                                    .companyDescription
                                                    .length
                                            } characters

                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                ACCOUNT INFORMATION
                            ================================= */}

                            <div className="recruiter-profile-form-card">

                                <div className="recruiter-profile-form-heading">

                                    <div>

                                        <i className="bi bi-person-lock"></i>

                                    </div>

                                    <span>

                                        <h4>
                                            Account Information
                                        </h4>

                                        <p>
                                            These details come from
                                            your HireFlow account.
                                        </p>

                                    </span>

                                </div>


                                <div className="row g-3">

                                    <div className="col-md-6">

                                        <label className="recruiter-profile-label">
                                            Recruiter Name
                                        </label>

                                        <div className="recruiter-profile-input disabled-profile-input">

                                            <i className="bi bi-person"></i>

                                            <input
                                                type="text"
                                                value={
                                                    user?.name ||
                                                    profile?.name ||
                                                    ""
                                                }
                                                disabled
                                                readOnly
                                            />

                                        </div>

                                    </div>


                                    <div className="col-md-6">

                                        <label className="recruiter-profile-label">
                                            Email Address
                                        </label>

                                        <div className="recruiter-profile-input disabled-profile-input">

                                            <i className="bi bi-envelope"></i>

                                            <input
                                                type="email"
                                                value={
                                                    user?.email ||
                                                    profile?.email ||
                                                    ""
                                                }
                                                disabled
                                                readOnly
                                            />

                                        </div>

                                    </div>

                                </div>


                                <div className="recruiter-account-note">

                                    <i className="bi bi-info-circle"></i>

                                    <span>
                                        Account name and email are
                                        managed separately from your
                                        company profile.
                                    </span>

                                </div>

                            </div>


                            {/* =================================
                                ACTIONS
                            ================================= */}

                            <div className="recruiter-profile-actions">

                                <button
                                    type="button"
                                    className="btn recruiter-profile-cancel"
                                    disabled={
                                        saving
                                    }
                                    onClick={
                                        loadProfile
                                    }
                                >

                                    <i className="bi bi-arrow-counterclockwise me-2"></i>

                                    Reset

                                </button>


                                <button
                                    type="submit"
                                    className="btn recruiter-profile-save"
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

                </div>

            </div>

        </div>
    );
}

export default RecruiterProfile;