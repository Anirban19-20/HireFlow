import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import axiosInstance from "../api/axiosInstance";

import "./Register.css";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "CANDIDATE"
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );

            return;
        }

        if (formData.password.length < 6) {

            setError(
                "Password must contain at least 6 characters."
            );

            return;
        }

        setLoading(true);

        try {

            const requestData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            };

            await axiosInstance.post(
                "/api/auth/register",
                requestData
            );

            navigate(
                "/login",
                {
                    state: {
                        message:
                            "Account created successfully. Please sign in."
                    }
                }
            );

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Registration failed. Please try again.";

            setError(message);

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-container">

                {/* LEFT SECTION */}

                <div className="register-brand-section">

                    <div className="register-brand-content">

                        <div className="register-brand-logo">
                            <i className="bi bi-briefcase-fill"></i>
                        </div>

                        <h1>HireFlow</h1>

                        <p className="register-brand-subtitle">
                            Build your future with the right opportunities.
                        </p>

                        <div className="register-benefits">

                            <div className="register-benefit">

                                <div className="benefit-icon">
                                    <i className="bi bi-person-check"></i>
                                </div>

                                <div>
                                    <h6>Create your profile</h6>

                                    <p>
                                        Showcase your skills,
                                        experience and resume.
                                    </p>
                                </div>

                            </div>

                            <div className="register-benefit">

                                <div className="benefit-icon">
                                    <i className="bi bi-briefcase"></i>
                                </div>

                                <div>
                                    <h6>Find opportunities</h6>

                                    <p>
                                        Search and save jobs that
                                        match your career goals.
                                    </p>
                                </div>

                            </div>

                            <div className="register-benefit">

                                <div className="benefit-icon">
                                    <i className="bi bi-bar-chart-line"></i>
                                </div>

                                <div>
                                    <h6>Track your progress</h6>

                                    <p>
                                        Follow every application
                                        from applied to selected.
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* RIGHT SECTION */}

                <div className="register-form-section">

                    <div className="register-form-wrapper">

                        <div className="register-mobile-logo">

                            <div className="register-mobile-logo-icon">
                                <i className="bi bi-briefcase-fill"></i>
                            </div>

                            <span>HireFlow</span>

                        </div>

                        <div className="register-heading">

                            <h2>Create your account</h2>

                            <p>
                                Join HireFlow and start your journey today.
                            </p>

                        </div>


                        {error && (

                            <div
                                className="alert alert-danger register-alert"
                                role="alert"
                            >

                                <i className="bi bi-exclamation-circle-fill me-2"></i>

                                {error}

                            </div>

                        )}


                        <form onSubmit={handleSubmit}>

                            {/* NAME */}

                            <div className="mb-3">

                                <label className="register-label">
                                    Full Name
                                </label>

                                <div className="input-group register-input-group">

                                    <span className="input-group-text">
                                        <i className="bi bi-person"></i>
                                    </span>

                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="mb-3">

                                <label className="register-label">
                                    Email Address
                                </label>

                                <div className="input-group register-input-group">

                                    <span className="input-group-text">
                                        <i className="bi bi-envelope"></i>
                                    </span>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        autoComplete="email"
                                    />

                                </div>

                            </div>


                            {/* ROLE */}

                            <div className="mb-3">

                                <label className="register-label">
                                    I want to join as
                                </label>

                                <div className="role-selection">

                                    <label
                                        className={
                                            formData.role === "CANDIDATE"
                                                ? "role-card active"
                                                : "role-card"
                                        }
                                    >

                                        <input
                                            type="radio"
                                            name="role"
                                            value="CANDIDATE"
                                            checked={
                                                formData.role ===
                                                "CANDIDATE"
                                            }
                                            onChange={handleChange}
                                        />

                                        <i className="bi bi-person-workspace"></i>

                                        <div>
                                            <strong>Candidate</strong>
                                            <span>Find your next job</span>
                                        </div>

                                    </label>


                                    <label
                                        className={
                                            formData.role === "RECRUITER"
                                                ? "role-card active"
                                                : "role-card"
                                        }
                                    >

                                        <input
                                            type="radio"
                                            name="role"
                                            value="RECRUITER"
                                            checked={
                                                formData.role ===
                                                "RECRUITER"
                                            }
                                            onChange={handleChange}
                                        />

                                        <i className="bi bi-building"></i>

                                        <div>
                                            <strong>Recruiter</strong>
                                            <span>Hire great talent</span>
                                        </div>

                                    </label>

                                </div>

                            </div>


                            {/* PASSWORD */}

                            <div className="mb-3">

                                <label className="register-label">
                                    Password
                                </label>

                                <div className="input-group register-input-group">

                                    <span className="input-group-text">
                                        <i className="bi bi-lock"></i>
                                    </span>

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        className="form-control"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="input-group-text register-password-toggle"
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

                            <div className="mb-4">

                                <label className="register-label">
                                    Confirm Password
                                </label>

                                <div className="input-group register-input-group">

                                    <span className="input-group-text">
                                        <i className="bi bi-shield-lock"></i>
                                    </span>

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        className="form-control"
                                        placeholder="Repeat your password"
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="input-group-text register-password-toggle"
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


                            <button
                                type="submit"
                                className="btn register-submit-button w-100"
                                disabled={loading}
                            >

                                {loading ? (

                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Creating account...
                                    </>

                                ) : (

                                    <>
                                        Create Account
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </>

                                )}

                            </button>

                        </form>


                        <div className="register-login-text">

                            Already have an account?{" "}

                            <Link to="/login">
                                Sign in
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;