import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    clearAuthMessage,
    getAuthMessage
} from "../utils/authUtils";

import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

function Login() {

    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuth();


    // =====================================================
    // REGISTER / PASSWORD RESET SUCCESS MESSAGE
    // =====================================================

    const [successMessage] =
        useState(
            location.state?.message || ""
        );


    // =====================================================
    // SESSION EXPIRED MESSAGE
    // =====================================================

    const [
        sessionMessage,
        setSessionMessage
    ] = useState("");


    // =====================================================
    // FORM DATA
    // =====================================================

    const [
        formData,
        setFormData
    ] = useState({
        email: "",
        password: ""
    });


    const [
        showPassword,
        setShowPassword
    ] = useState(false);


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    // =====================================================
    // LOAD SESSION MESSAGE
    // =====================================================

    useEffect(() => {

        const message =
            getAuthMessage();

        if (message) {

            setSessionMessage(
                message
            );

            // Remove after reading so it
            // does not appear on future visits

            clearAuthMessage();
        }

    }, []);


    // =====================================================
    // HANDLE INPUT CHANGE
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


        // Clear previous login error

        setError("");
    };


    // =====================================================
    // VALIDATE FORM
    // =====================================================

    const validateForm = () => {

        if (!formData.email.trim()) {

            setError(
                "Email address is required."
            );

            return false;
        }


        if (!formData.password) {

            setError(
                "Password is required."
            );

            return false;
        }


        return true;
    };


    // =====================================================
    // LOGIN
    // =====================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");


        if (!validateForm()) {
            return;
        }


        setLoading(true);


        try {

            // =================================================
            // REQUEST
            // =================================================

            const loginRequest = {

                email:
                    formData.email.trim(),

                password:
                    formData.password
            };


            const response =
                await axiosInstance.post(
                    "/api/auth/login",
                    loginRequest
                );


            const authData =
                response.data;


            // =================================================
            // VALIDATE AUTH RESPONSE
            // =================================================

            if (
                !authData ||
                !authData.token ||
                !authData.role
            ) {

                throw new Error(
                    "Invalid authentication response"
                );
            }


            // =================================================
            // REMOVE OLD SESSION MESSAGE
            // =================================================

            clearAuthMessage();

            setSessionMessage("");


            // =================================================
            // SAVE JWT + USER INFORMATION
            // =================================================

            login(
                authData
            );


            // =================================================
            // ROLE BASED REDIRECTION
            // =================================================

            if (
                authData.role ===
                "CANDIDATE"
            ) {

                navigate(
                    "/candidate/dashboard",
                    {
                        replace: true
                    }
                );

            } else if (
                authData.role ===
                "RECRUITER"
            ) {

                navigate(
                    "/recruiter/dashboard",
                    {
                        replace: true
                    }
                );

            } else if (
                authData.role ===
                "ADMIN"
            ) {

                navigate(
                    "/admin/dashboard",
                    {
                        replace: true
                    }
                );

            } else {

                navigate(
                    "/",
                    {
                        replace: true
                    }
                );
            }


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            // =================================================
            // NETWORK ERROR
            // =================================================

            if (
                error.code ===
                "ERR_NETWORK"
            ) {

                setError(
                    "Unable to connect to the server. Please make sure the backend is running."
                );

                return;
            }


            // =================================================
            // BACKEND ERROR MESSAGE
            // =================================================

            const backendMessage =
                error.response
                    ?.data
                    ?.message;


            if (backendMessage) {

                setError(
                    backendMessage
                );

                return;
            }


            // =================================================
            // COMMON LOGIN STATUS CODES
            // =================================================

            const status =
                error.response
                    ?.status;


            if (
                status === 401 ||
                status === 403
            ) {

                setError(
                    "Invalid email or password."
                );

                return;
            }


            // =================================================
            // FALLBACK
            // =================================================

            setError(
                "Unable to sign in. Please try again."
            );


        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="login-page">

            <div className="login-container">


                {/* =================================================
                    LEFT BRAND SECTION
                ================================================= */}

                <div className="login-brand-section">

                    <div className="brand-content">


                        {/* LOGO */}

                        <div className="brand-logo">

                            <i className="bi bi-briefcase-fill"></i>

                        </div>


                        {/* BRAND */}

                        <h1>
                            HireFlow
                        </h1>


                        <p className="brand-subtitle">

                            Where talent meets opportunity.

                        </p>


                        {/* =================================================
                            FEATURES
                        ================================================= */}

                        <div className="brand-features">


                            {/* FEATURE 1 */}

                            <div className="feature-item">

                                <i className="bi bi-search"></i>

                                <div>

                                    <h6>
                                        Discover Opportunities
                                    </h6>

                                    <p>
                                        Find jobs that match your
                                        skills and career goals.
                                    </p>

                                </div>

                            </div>


                            {/* FEATURE 2 */}

                            <div className="feature-item">

                                <i className="bi bi-graph-up-arrow"></i>

                                <div>

                                    <h6>
                                        Track Applications
                                    </h6>

                                    <p>
                                        Stay updated throughout
                                        your recruitment journey.
                                    </p>

                                </div>

                            </div>


                            {/* FEATURE 3 */}

                            <div className="feature-item">

                                <i className="bi bi-people"></i>

                                <div>

                                    <h6>
                                        Connect with Recruiters
                                    </h6>

                                    <p>
                                        Build meaningful
                                        professional connections.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    RIGHT LOGIN SECTION
                ================================================= */}

                <div className="login-form-section">

                    <div className="login-form-wrapper">


                        {/* =================================================
                            MOBILE LOGO
                        ================================================= */}

                        <div className="mobile-logo">

                            <div className="mobile-logo-icon">

                                <i className="bi bi-briefcase-fill"></i>

                            </div>

                            <span>
                                HireFlow
                            </span>

                        </div>


                        {/* =================================================
                            LOGIN HEADING
                        ================================================= */}

                        <div className="login-heading">

                            <h2>
                                Welcome Back
                            </h2>

                            <p>
                                Sign in to continue to your
                                HireFlow account.
                            </p>

                        </div>


                        {/* =================================================
                            SESSION EXPIRED MESSAGE
                        ================================================= */}

                        {sessionMessage && (

                            <div
                                className="
                                    alert
                                    alert-warning
                                    login-alert
                                "
                                role="alert"
                            >

                                <i className="bi bi-clock-history me-2"></i>

                                {sessionMessage}

                            </div>

                        )}


                        {/* =================================================
                            REGISTER / RESET SUCCESS MESSAGE
                        ================================================= */}

                        {successMessage && (

                            <div
                                className="
                                    alert
                                    alert-success
                                    login-alert
                                "
                                role="alert"
                            >

                                <i className="bi bi-check-circle-fill me-2"></i>

                                {successMessage}

                            </div>

                        )}


                        {/* =================================================
                            LOGIN ERROR
                        ================================================= */}

                        {error && (

                            <div
                                className="
                                    alert
                                    alert-danger
                                    login-alert
                                "
                                role="alert"
                            >

                                <i className="bi bi-exclamation-circle-fill me-2"></i>

                                {error}

                            </div>

                        )}


                        {/* =================================================
                            LOGIN FORM
                        ================================================= */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >


                            {/* =============================================
                                EMAIL
                            ============================================= */}

                            <div className="mb-4">

                                <label
                                    htmlFor="email"
                                    className="form-label login-label"
                                >

                                    Email Address

                                </label>


                                <div className="input-group login-input-group">

                                    <span className="input-group-text">

                                        <i className="bi bi-envelope"></i>

                                    </span>


                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="name@example.com"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        autoComplete="email"
                                        disabled={
                                            loading
                                        }
                                    />

                                </div>

                            </div>


                            {/* =============================================
                                PASSWORD
                            ============================================= */}

                            <div className="mb-3">

                                <div
                                    className="
                                        d-flex
                                        justify-content-between
                                        align-items-center
                                    "
                                >

                                    <label
                                        htmlFor="password"
                                        className="form-label login-label"
                                    >

                                        Password

                                    </label>


                                    {/* =====================================
                                        FORGOT PASSWORD
                                    ===================================== */}

                                    <Link
                                        to="/forgot-password"
                                        className="forgot-password"
                                        aria-disabled={loading}
                                        onClick={(event) => {

                                            if (loading) {
                                                event.preventDefault();
                                            }
                                        }}
                                    >

                                        Forgot password?

                                    </Link>

                                </div>


                                <div className="input-group login-input-group">

                                    <span className="input-group-text">

                                        <i className="bi bi-lock"></i>

                                    </span>


                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        className="form-control"
                                        placeholder="Enter your password"
                                        value={
                                            formData.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        autoComplete="current-password"
                                        disabled={
                                            loading
                                        }
                                    />


                                    {/* =====================================
                                        SHOW / HIDE PASSWORD
                                    ===================================== */}

                                    <button
                                        type="button"
                                        className="
                                            input-group-text
                                            password-toggle
                                        "
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        disabled={
                                            loading
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


                            {/* =============================================
                                REMEMBER ME
                            ============================================= */}

                            <div className="form-check mb-4">

                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="rememberMe"
                                    disabled={
                                        loading
                                    }
                                />

                                <label
                                    className="
                                        form-check-label
                                        remember-label
                                    "
                                    htmlFor="rememberMe"
                                >

                                    Remember me

                                </label>

                            </div>


                            {/* =================================================
                                LOGIN BUTTON
                            ================================================= */}

                            <button
                                type="submit"
                                className="
                                    btn
                                    login-button
                                    w-100
                                "
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
                                            role="status"
                                            aria-hidden="true"
                                        ></span>

                                        Signing in...

                                    </>

                                ) : (

                                    <>

                                        Sign In

                                        <i className="bi bi-arrow-right ms-2"></i>

                                    </>

                                )}

                            </button>

                        </form>


                        {/* =================================================
                            DIVIDER
                        ================================================= */}

                        <div className="divider">

                            <span>
                                New to HireFlow?
                            </span>

                        </div>


                        {/* =================================================
                            REGISTER BUTTON
                        ================================================= */}

                        <Link
                            to="/register"
                            className="
                                btn
                                register-button
                                w-100
                            "
                        >

                            <i className="bi bi-person-plus me-2"></i>

                            Create an Account

                        </Link>


                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <p className="login-footer">

                            By continuing, you agree to our{" "}

                            <span>
                                Terms of Service
                            </span>

                            {" "}and{" "}

                            <span>
                                Privacy Policy
                            </span>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;