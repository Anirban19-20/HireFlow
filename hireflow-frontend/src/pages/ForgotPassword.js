import { useState } from "react";
import { Link } from "react-router-dom";

import axiosInstance from "../api/axiosInstance";

import "./ForgotPassword.css";

function ForgotPassword() {

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [successMessage, setSuccessMessage] =
        useState("");


    // =====================================================
    // HANDLE SUBMIT
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccessMessage("");


        // =================================================
        // VALIDATION
        // =================================================

        if (!email.trim()) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        try {

            setLoading(true);


            // =================================================
            // API CALL
            // =================================================

            const response =
                await axiosInstance.post(
                    "/api/auth/forgot-password",
                    {
                        email: email.trim()
                    }
                );


            setSuccessMessage(
                response?.data?.message ||
                "If an account exists with this email, a password reset link has been sent."
            );


        } catch (requestError) {

            console.error(
                "Forgot password error:",
                requestError
            );


            const message =
                requestError?.response?.data?.message ||
                requestError?.response?.data?.error ||
                "Unable to process your password reset request. Please try again.";


            setError(message);

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="forgot-password-page">

            <div className="forgot-password-container">


                {/* =================================================
                    LEFT SECTION
                ================================================= */}

                <div className="forgot-password-brand">

                    <div className="forgot-brand-content">

                        <div className="forgot-brand-icon">

                            <i className="bi bi-shield-lock-fill"></i>

                        </div>

                        <span className="forgot-brand-eyebrow">
                            HIREFLOW SECURITY
                        </span>

                        <h1>
                            Reset your password safely.
                        </h1>

                        <p>
                            Enter your registered HireFlow email
                            address and we will send you a secure
                            password reset link.
                        </p>


                        <div className="forgot-security-list">

                            <div>

                                <i className="bi bi-check-circle-fill"></i>

                                <span>
                                    Secure one-time reset link
                                </span>

                            </div>

                            <div>

                                <i className="bi bi-check-circle-fill"></i>

                                <span>
                                    Link expires automatically
                                </span>

                            </div>

                            <div>

                                <i className="bi bi-check-circle-fill"></i>

                                <span>
                                    Password remains encrypted
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    FORM SECTION
                ================================================= */}

                <div className="forgot-password-card">

                    <div className="forgot-card-header">

                        <div className="forgot-lock-icon">

                            <i className="bi bi-key-fill"></i>

                        </div>

                        <span>
                            ACCOUNT RECOVERY
                        </span>

                        <h2>
                            Forgot Password?
                        </h2>

                        <p>
                            Enter the email associated with your
                            HireFlow account.
                        </p>

                    </div>


                    {/* =================================================
                        ALERTS
                    ================================================= */}

                    {error && (

                        <div className="forgot-alert forgot-alert-error">

                            <i className="bi bi-exclamation-circle-fill"></i>

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    {successMessage && (

                        <div className="forgot-alert forgot-alert-success">

                            <i className="bi bi-check-circle-fill"></i>

                            <span>
                                {successMessage}
                            </span>

                        </div>

                    )}


                    {/* =================================================
                        FORM
                    ================================================= */}

                    {!successMessage && (

                        <form
                            onSubmit={handleSubmit}
                            className="forgot-password-form"
                        >

                            <div className="forgot-form-group">

                                <label htmlFor="forgot-email">

                                    Email Address

                                </label>


                                <div className="forgot-input-wrapper">

                                    <i className="bi bi-envelope"></i>

                                    <input
                                        id="forgot-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your registered email"
                                        autoComplete="email"
                                        disabled={loading}
                                    />

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="forgot-submit-button"
                                disabled={loading}
                            >

                                {loading ? (

                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>

                                        Sending Reset Link...
                                    </>

                                ) : (

                                    <>
                                        <i className="bi bi-send-fill"></i>

                                        Send Reset Link
                                    </>

                                )}

                            </button>

                        </form>

                    )}


                    {/* =================================================
                        SUCCESS ACTION
                    ================================================= */}

                    {successMessage && (

                        <div className="forgot-success-actions">

                            <p>
                                Check your email inbox and follow
                                the password reset link.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSuccessMessage("");
                                    setEmail("");
                                }}
                            >

                                <i className="bi bi-arrow-repeat"></i>

                                Send Another Request

                            </button>

                        </div>

                    )}


                    {/* =================================================
                        BACK TO LOGIN
                    ================================================= */}

                    <div className="forgot-login-link">

                        <Link to="/login">

                            <i className="bi bi-arrow-left"></i>

                            Back to Login

                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ForgotPassword;