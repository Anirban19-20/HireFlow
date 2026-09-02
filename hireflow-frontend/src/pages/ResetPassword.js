import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import axiosInstance from "../api/axiosInstance";

import "./ResetPassword.css";

function ResetPassword() {

    const navigate = useNavigate();

    const [searchParams] =
        useSearchParams();

    const token =
        searchParams.get("token");


    const [formData, setFormData] =
        useState({
            newPassword: "",
            confirmPassword: ""
        });


    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");


    // =====================================================
    // CHECK TOKEN
    // =====================================================

    useEffect(() => {

        if (!token) {

            setError(
                "Password reset token is missing. Please request a new password reset link."
            );
        }

    }, [token]);


    // =====================================================
    // INPUT CHANGE
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
    // VALIDATE PASSWORD
    // =====================================================

    const validatePassword = () => {

        if (!formData.newPassword) {

            return "Please enter your new password.";
        }


        if (formData.newPassword.length < 8) {

            return "Password must contain at least 8 characters.";
        }


        if (
            formData.newPassword !==
            formData.confirmPassword
        ) {

            return "Passwords do not match.";
        }


        return "";
    };


    // =====================================================
    // RESET PASSWORD
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccessMessage("");


        if (!token) {

            setError(
                "Invalid password reset link."
            );

            return;
        }


        const validationError =
            validatePassword();


        if (validationError) {

            setError(validationError);

            return;
        }


        try {

            setLoading(true);


            const response =
                await axiosInstance.post(
                    "/api/auth/reset-password",
                    {
                        token: token,
                        newPassword:
                            formData.newPassword
                    }
                );


            setSuccessMessage(
                response?.data?.message ||
                "Password reset successfully."
            );


            setFormData({
                newPassword: "",
                confirmPassword: ""
            });


            window.setTimeout(() => {

                navigate(
                    "/login",
                    {
                        replace: true,
                        state: {
                            message:
                                "Password reset successfully. Please login with your new password."
                        }
                    }
                );

            }, 1800);


        } catch (requestError) {

            console.error(
                "Reset password error:",
                requestError
            );


            const message =
                requestError?.response?.data?.message ||
                requestError?.response?.data?.error ||
                "Unable to reset your password. The reset link may be invalid or expired.";


            setError(message);

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="reset-password-page">

            <div className="reset-password-card">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="reset-password-header">

                    <div className="reset-password-icon">

                        <i className="bi bi-shield-lock-fill"></i>

                    </div>

                    <span>
                        HIREFLOW SECURITY
                    </span>

                    <h1>
                        Create New Password
                    </h1>

                    <p>
                        Choose a secure password for your
                        HireFlow account.
                    </p>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="reset-alert reset-error">

                        <i className="bi bi-exclamation-circle-fill"></i>

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {successMessage && (

                    <div className="reset-alert reset-success">

                        <i className="bi bi-check-circle-fill"></i>

                        <span>
                            {successMessage}
                        </span>

                    </div>

                )}


                {/* =================================================
                    FORM
                ================================================= */}

                {!successMessage && token && (

                    <form
                        onSubmit={handleSubmit}
                        className="reset-password-form"
                    >


                        {/* NEW PASSWORD */}

                        <div className="reset-form-group">

                            <label>
                                New Password
                            </label>


                            <div className="reset-input-wrapper">

                                <i className="bi bi-lock"></i>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="newPassword"
                                    value={
                                        formData.newPassword
                                    }
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    disabled={loading}
                                    autoComplete="new-password"
                                />


                                <button
                                    type="button"
                                    className="reset-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >

                                    <i
                                        className={
                                            showPassword
                                                ? "bi bi-eye-slash"
                                                : "bi bi-eye"
                                        }
                                    ></i>

                                </button>

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="reset-form-group">

                            <label>
                                Confirm Password
                            </label>


                            <div className="reset-input-wrapper">

                                <i className="bi bi-lock-fill"></i>

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                    disabled={loading}
                                    autoComplete="new-password"
                                />


                                <button
                                    type="button"
                                    className="reset-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >

                                    <i
                                        className={
                                            showConfirmPassword
                                                ? "bi bi-eye-slash"
                                                : "bi bi-eye"
                                        }
                                    ></i>

                                </button>

                            </div>

                        </div>


                        {/* PASSWORD REQUIREMENT */}

                        <div className="reset-password-requirement">

                            <i className="bi bi-info-circle"></i>

                            <span>
                                Password must contain at least
                                8 characters.
                            </span>

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="reset-submit-button"
                            disabled={loading}
                        >

                            {loading ? (

                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>

                                    Resetting Password...
                                </>

                            ) : (

                                <>
                                    <i className="bi bi-check2-circle"></i>

                                    Reset Password
                                </>

                            )}

                        </button>

                    </form>

                )}


                {/* =================================================
                    MISSING TOKEN
                ================================================= */}

                {!token && (

                    <div className="reset-invalid-link">

                        <Link to="/forgot-password">

                            Request New Reset Link

                        </Link>

                    </div>

                )}


                {/* =================================================
                    LOGIN
                ================================================= */}

                <div className="reset-login-link">

                    <Link to="/login">

                        <i className="bi bi-arrow-left"></i>

                        Back to Login

                    </Link>

                </div>

            </div>

        </div>
    );
}

export default ResetPassword;