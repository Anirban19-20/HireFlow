import {
    Link,
    NavLink,
    useLocation,
    useNavigate
} from "react-router-dom";

import { useAuth }
    from "../context/AuthContext";

import NotificationBell
    from "./NotificationBell";

import "./Navbar.css";


function Navbar() {

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        user,
        logout,
        isAuthenticated
    } = useAuth();


    // =====================================================
    // HIDE NAVBAR ON AUTH PAGES
    // =====================================================

    const hideNavbar =
        location.pathname === "/login" ||
        location.pathname === "/register";


    if (hideNavbar) {

        return null;
    }


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        logout();

        navigate(
            "/login",
            {
                replace: true
            }
        );
    };


    // =====================================================
    // NOT LOGGED IN
    // =====================================================

    if (!isAuthenticated) {

        return (

            <nav className="navbar navbar-expand-lg hireflow-navbar">

                <div className="container">


                    {/* =====================================
                        BRAND
                    ===================================== */}

                    <Link
                        className="navbar-brand hireflow-brand"
                        to="/"
                    >

                        <span className="hireflow-logo">

                            <i className="bi bi-briefcase-fill"></i>

                        </span>

                        HireFlow

                    </Link>


                    {/* =====================================
                        AUTH BUTTONS
                    ===================================== */}

                    <div className="ms-auto d-flex gap-2">

                        <Link
                            to="/login"
                            className="btn navbar-login-btn"
                        >
                            Login
                        </Link>


                        <Link
                            to="/register"
                            className="btn navbar-register-btn"
                        >
                            Get Started
                        </Link>

                    </div>

                </div>

            </nav>
        );
    }


    // =====================================================
    // AUTHENTICATED NAVBAR
    // =====================================================

    return (

        <nav
            className="
                navbar
                navbar-expand-lg
                hireflow-navbar
                sticky-top
            "
        >

            <div className="container-fluid px-lg-5">


                {/* =========================================
                    BRAND
                ========================================= */}

                <Link
                    className="navbar-brand hireflow-brand"
                    to={
                        user?.role === "CANDIDATE"
                            ? "/candidate/dashboard"

                            : user?.role === "RECRUITER"
                                ? "/recruiter/dashboard"

                                : "/admin/dashboard"
                    }
                >

                    <span className="hireflow-logo">

                        <i className="bi bi-briefcase-fill"></i>

                    </span>

                    HireFlow

                </Link>


                {/* =========================================
                    MOBILE TOGGLE
                ========================================= */}

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#hireflowNavbar"
                    aria-controls="hireflowNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >

                    <span className="navbar-toggler-icon"></span>

                </button>


                <div
                    className="collapse navbar-collapse"
                    id="hireflowNavbar"
                >


                    {/* =========================================
                        CANDIDATE LINKS
                    ========================================= */}

                    {user?.role === "CANDIDATE" && (

                        <ul className="navbar-nav me-auto ms-lg-4">


                            {/* =================================
                                DASHBOARD
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/candidate/dashboard"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-grid me-1"></i>

                                    Dashboard

                                </NavLink>

                            </li>


                            {/* =================================
                                FIND JOBS
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/candidate/jobs"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-search me-1"></i>

                                    Find Jobs

                                </NavLink>

                            </li>


                            {/* =================================
                                SAVED JOBS
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/candidate/saved-jobs"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-bookmark me-1"></i>

                                    Saved Jobs

                                </NavLink>

                            </li>


                            {/* =================================
                                APPLICATIONS
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/candidate/applications"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-file-earmark-text me-1"></i>

                                    Applications

                                </NavLink>

                            </li>


                            {/* =================================
                                INTERVIEWS
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/candidate/interviews"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-calendar2-check me-1"></i>

                                    Interviews

                                </NavLink>

                            </li>


                            {/* =================================
                                MY OFFERS
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/candidate/offers"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-envelope-paper me-1"></i>

                                    My Offers

                                </NavLink>

                            </li>


                            {/* =================================
                                ONBOARDING
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/candidate/onboarding"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-person-check me-1"></i>

                                    Onboarding

                                </NavLink>

                            </li>

                        </ul>
                    )}


                    {/* =========================================
                        RECRUITER LINKS
                    ========================================= */}

                    {user?.role === "RECRUITER" && (

                        <ul className="navbar-nav me-auto ms-lg-4">


                            {/* =================================
                                DASHBOARD
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/recruiter/dashboard"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-grid me-1"></i>

                                    Dashboard

                                </NavLink>

                            </li>


                            {/* =================================
                                MY JOBS
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/recruiter/jobs"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-briefcase me-1"></i>

                                    My Jobs

                                </NavLink>

                            </li>


                            {/* =================================
                                INTERVIEWS
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/recruiter/interviews"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-calendar2-check me-1"></i>

                                    Interviews

                                </NavLink>

                            </li>


                            {/* =================================
                                ONBOARDING
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/recruiter/onboarding"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-person-workspace me-1"></i>

                                    Onboarding

                                </NavLink>

                            </li>


                            {/* =================================
                                POST JOB
                            ================================= */}

                            <li className="nav-item">

                                <NavLink
                                    to="/recruiter/jobs/create"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-plus-circle me-1"></i>

                                    Post Job

                                </NavLink>

                            </li>

                        </ul>
                    )}


                    {/* =========================================
                        ADMIN LINKS
                    ========================================= */}

                    {user?.role === "ADMIN" && (

                        <ul className="navbar-nav me-auto ms-lg-4">

                            <li className="nav-item">

                                <NavLink
                                    to="/admin/dashboard"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-grid me-1"></i>

                                    Dashboard

                                </NavLink>

                            </li>


                            <li className="nav-item">

                                <NavLink
                                    to="/admin/users"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-people me-1"></i>

                                    Users

                                </NavLink>

                            </li>


                            <li className="nav-item">

                                <NavLink
                                    to="/admin/jobs"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-briefcase me-1"></i>

                                    Jobs

                                </NavLink>

                            </li>


                            <li className="nav-item">

                                <NavLink
                                    to="/admin/applications"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-file-earmark-text me-1"></i>

                                    Applications

                                </NavLink>

                            </li>


                            <li className="nav-item">

                                <NavLink
                                    to="/admin/recruiters"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-building me-1"></i>

                                    Recruiters

                                </NavLink>

                            </li>


                            <li className="nav-item">

                                <NavLink
                                    to="/admin/candidates"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "nav-link hireflow-nav-link active"
                                            : "nav-link hireflow-nav-link"
                                    }
                                >

                                    <i className="bi bi-person-badge me-1"></i>

                                    Candidates

                                </NavLink>

                            </li>

                        </ul>
                    )}


                    {/* =========================================
                        USER AREA
                    ========================================= */}

                    <div className="navbar-user-area">


                        {/* =====================================
                            NOTIFICATIONS
                        ===================================== */}

                        {(
                            user?.role === "CANDIDATE" ||
                            user?.role === "RECRUITER"
                        ) && (

                            <NotificationBell />

                        )}


                        {/* =====================================
                            USER AVATAR
                        ===================================== */}

                        <div className="user-avatar">

                            {user?.name
                                ? user.name
                                    .charAt(0)
                                    .toUpperCase()

                                : "U"
                            }

                        </div>


                        {/* =====================================
                            USER INFO
                        ===================================== */}

                        <div className="user-info d-none d-lg-block">

                            <span className="user-name">

                                {user?.name}

                            </span>

                            <span className="user-role">

                                {user?.role}

                            </span>

                        </div>


                        {/* =====================================
                            CANDIDATE PROFILE
                        ===================================== */}

                        {user?.role === "CANDIDATE" && (

                            <Link
                                to="/candidate/profile"
                                className="navbar-icon-button"
                                title="Profile"
                            >

                                <i className="bi bi-person"></i>

                            </Link>

                        )}


                        {/* =====================================
                            RECRUITER PROFILE
                        ===================================== */}

                        {user?.role === "RECRUITER" && (

                            <Link
                                to="/recruiter/profile"
                                className="navbar-icon-button"
                                title="Profile"
                            >

                                <i className="bi bi-person"></i>

                            </Link>

                        )}


                        {/* =====================================
                            LOGOUT
                        ===================================== */}

                        <button
                            type="button"
                            className="navbar-logout-button"
                            onClick={
                                handleLogout
                            }
                            title="Logout"
                        >

                            <i className="bi bi-box-arrow-right"></i>

                            <span className="d-none d-xl-inline">

                                Logout

                            </span>

                        </button>

                    </div>

                </div>

            </div>

        </nav>
    );
}


export default Navbar;