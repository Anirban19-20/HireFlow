import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import axiosInstance
    from "../../api/axiosInstance";

import {
    useAuth
} from "../../context/AuthContext";

import "./AdminDashboard.css";

const formatStatus = (value) => {

    if (!value) {
        return "Unknown";
    }

    return String(value)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase()
        );
};

const formatDate = (value) => {

    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};

function AdminDashboard() {

    const {
        user
    } = useAuth();

    const [
        dashboard,
        setDashboard
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        refreshing,
        setRefreshing
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const loadDashboard =
        useCallback(
            async (
                manualRefresh = false
            ) => {

                if (manualRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                try {

                    const response =
                        await axiosInstance.get(
                            "/api/admin/dashboard"
                        );

                    setDashboard(
                        response.data || {}
                    );

                } catch (requestError) {

                    console.error(
                        "Admin dashboard error:",
                        requestError
                    );

                    setError(
                        requestError?.response?.data?.message ||
                        "Unable to load admin dashboard."
                    );

                } finally {

                    setLoading(false);
                    setRefreshing(false);
                }
            },
            []
        );

    useEffect(
        () => {
            loadDashboard();
        },
        [loadDashboard]
    );

    const stats = useMemo(
        () => [
            {
                label: "Total Users",
                value: dashboard?.totalUsers ?? 0,
                detail: `${dashboard?.totalCandidates ?? 0} candidates • ${dashboard?.totalRecruiters ?? 0} recruiters`,
                icon: "bi-people-fill",
                className: "admin-stat-blue",
                to: "/admin/users"
            },
            {
                label: "Recruiters",
                value: dashboard?.totalRecruiters ?? 0,
                detail: "Registered recruiter accounts",
                icon: "bi-building",
                className: "admin-stat-purple",
                to: "/admin/recruiters"
            },
            {
                label: "Candidates",
                value: dashboard?.totalCandidates ?? 0,
                detail: "Registered candidate accounts",
                icon: "bi-person-badge",
                className: "admin-stat-green",
                to: "/admin/candidates"
            },
            {
                label: "Jobs",
                value: dashboard?.totalJobs ?? 0,
                detail: `${dashboard?.openJobs ?? 0} open • ${dashboard?.closedJobs ?? 0} closed`,
                icon: "bi-briefcase-fill",
                className: "admin-stat-orange",
                to: "/admin/jobs"
            },
            {
                label: "Applications",
                value: dashboard?.totalApplications ?? 0,
                detail: `${dashboard?.interviewApplications ?? 0} interviewing`,
                icon: "bi-file-earmark-text-fill",
                className: "admin-stat-cyan",
                to: "/admin/applications"
            },
            {
                label: "Selected",
                value: dashboard?.selectedApplications ?? 0,
                detail: "Candidates selected by recruiters",
                icon: "bi-patch-check-fill",
                className: "admin-stat-emerald",
                to: "/admin/applications"
            }
        ],
        [dashboard]
    );

    if (loading) {

        return (
            <div className="admin-loading-screen">
                <div className="spinner-border text-primary" />
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="container">

                <header className="admin-page-header admin-dashboard-header">
                    <div>
                        <span className="admin-eyebrow">
                            Platform Administration
                        </span>

                        <h1>
                            Welcome, {user?.name || "Administrator"}
                        </h1>

                        <p>
                            Monitor HireFlow users, jobs, applications,
                            recruiters and candidates from one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-refresh-button"
                        onClick={() =>
                            loadDashboard(true)
                        }
                        disabled={refreshing}
                    >
                        <i
                            className={
                                `bi bi-arrow-clockwise ${
                                    refreshing
                                        ? "admin-spin"
                                        : ""
                                }`
                            }
                        />
                        {refreshing
                            ? "Refreshing"
                            : "Refresh"
                        }
                    </button>
                </header>

                {error && (
                    <div className="alert alert-danger admin-alert">
                        <i className="bi bi-exclamation-triangle-fill" />
                        <span>{error}</span>
                    </div>
                )}

                <section className="admin-stat-grid">
                    {stats.map(
                        (stat) => (
                            <Link
                                to={stat.to}
                                className="admin-stat-card"
                                key={stat.label}
                            >
                                <div
                                    className={
                                        `admin-stat-icon ${stat.className}`
                                    }
                                >
                                    <i
                                        className={
                                            `bi ${stat.icon}`
                                        }
                                    />
                                </div>

                                <div>
                                    <span>{stat.label}</span>
                                    <strong>{stat.value}</strong>
                                    <small>{stat.detail}</small>
                                </div>
                            </Link>
                        )
                    )}
                </section>

                <section className="admin-quick-grid">
                    <AdminQuickLink
                        to="/admin/users"
                        icon="bi-people"
                        title="Manage Users"
                        text="Review all registered platform accounts."
                    />
                    <AdminQuickLink
                        to="/admin/jobs"
                        icon="bi-briefcase"
                        title="Review Jobs"
                        text="Inspect every job posted on HireFlow."
                    />
                    <AdminQuickLink
                        to="/admin/applications"
                        icon="bi-file-earmark-text"
                        title="Applications"
                        text="Monitor recruitment activity and outcomes."
                    />
                    <AdminQuickLink
                        to="/admin/recruiters"
                        icon="bi-building"
                        title="Recruiters"
                        text="Review recruiter companies and profiles."
                    />
                    <AdminQuickLink
                        to="/admin/candidates"
                        icon="bi-person-vcard"
                        title="Candidates"
                        text="Review candidate profiles and resumes."
                    />
                </section>

                <div className="admin-dashboard-columns">

                    <section className="admin-panel">
                        <PanelHeader
                            eyebrow="Latest Activity"
                            title="Recent Users"
                            to="/admin/users"
                        />

                        <div className="admin-activity-list">
                            {(dashboard?.recentUsers || []).length > 0
                                ? dashboard.recentUsers.map(
                                    (recentUser) => (
                                        <div
                                            className="admin-activity-item"
                                            key={recentUser.id}
                                        >
                                            <div className="admin-avatar">
                                                {(recentUser.name || "U")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="admin-activity-main">
                                                <strong>
                                                    {recentUser.name || "Unnamed User"}
                                                </strong>
                                                <span>
                                                    {recentUser.email || "No email"}
                                                </span>
                                            </div>

                                            <span
                                                className={
                                                    `admin-status-pill ${
                                                        getRoleClass(
                                                            recentUser.role
                                                        )
                                                    }`
                                                }
                                            >
                                                {formatStatus(
                                                    recentUser.role
                                                )}
                                            </span>
                                        </div>
                                    )
                                )
                                : (
                                    <AdminEmpty
                                        text="No users found."
                                    />
                                )
                            }
                        </div>
                    </section>

                    <section className="admin-panel">
                        <PanelHeader
                            eyebrow="Recruitment"
                            title="Recent Applications"
                            to="/admin/applications"
                        />

                        <div className="admin-activity-list">
                            {(dashboard?.recentApplications || []).length > 0
                                ? dashboard.recentApplications.map(
                                    (application) => (
                                        <div
                                            className="admin-activity-item"
                                            key={application.id}
                                        >
                                            <div className="admin-activity-icon">
                                                <i className="bi bi-file-earmark-text" />
                                            </div>

                                            <div className="admin-activity-main">
                                                <strong>
                                                    {application.candidateName || "Candidate"}
                                                </strong>
                                                <span>
                                                    {application.jobTitle || "Job"}
                                                    {application.companyName
                                                        ? ` • ${application.companyName}`
                                                        : ""
                                                    }
                                                </span>
                                                <small>
                                                    {formatDate(
                                                        application.appliedAt
                                                    )}
                                                </small>
                                            </div>

                                            <span
                                                className={
                                                    `admin-status-pill ${
                                                        getApplicationStatusClass(
                                                            application.status
                                                        )
                                                    }`
                                                }
                                            >
                                                {formatStatus(
                                                    application.status
                                                )}
                                            </span>
                                        </div>
                                    )
                                )
                                : (
                                    <AdminEmpty
                                        text="No applications found."
                                    />
                                )
                            }
                        </div>
                    </section>
                </div>

                <section className="admin-panel">
                    <PanelHeader
                        eyebrow="Marketplace"
                        title="Recent Jobs"
                        to="/admin/jobs"
                    />

                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Job</th>
                                    <th>Company</th>
                                    <th>Status</th>
                                    <th>Applications</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(dashboard?.recentJobs || []).map(
                                    (job) => (
                                        <tr key={job.id}>
                                            <td>
                                                <strong>
                                                    {job.title || "Untitled Job"}
                                                </strong>
                                                <span>
                                                    {job.location || "Location not specified"}
                                                </span>
                                            </td>
                                            <td>
                                                {job.companyName ||
                                                    job.recruiterName ||
                                                    "Company"
                                                }
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        `admin-status-pill ${
                                                            getJobStatusClass(
                                                                job.status
                                                            )
                                                        }`
                                                    }
                                                >
                                                    {formatStatus(job.status)}
                                                </span>
                                            </td>
                                            <td>
                                                {job.applicationCount ?? 0}
                                            </td>
                                            <td>
                                                {formatDate(job.createdAt)}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

function AdminQuickLink({
    to,
    icon,
    title,
    text
}) {

    return (
        <Link
            to={to}
            className="admin-quick-card"
        >
            <div>
                <i className={`bi ${icon}`} />
            </div>
            <span>
                <strong>{title}</strong>
                <small>{text}</small>
            </span>
            <i className="bi bi-arrow-right" />
        </Link>
    );
}

function PanelHeader({
    eyebrow,
    title,
    to
}) {

    return (
        <div className="admin-panel-header">
            <div>
                <span>{eyebrow}</span>
                <h3>{title}</h3>
            </div>
            <Link to={to}>
                View All
                <i className="bi bi-arrow-right" />
            </Link>
        </div>
    );
}

function AdminEmpty({
    text
}) {

    return (
        <div className="admin-inline-empty">
            <i className="bi bi-inbox" />
            <span>{text}</span>
        </div>
    );
}

const getRoleClass = (role) => {

    switch (role) {
        case "ADMIN":
            return "admin-status-admin";
        case "RECRUITER":
            return "admin-status-recruiter";
        case "CANDIDATE":
            return "admin-status-candidate";
        default:
            return "admin-status-default";
    }
};

const getJobStatusClass = (status) => {

    switch (status) {
        case "OPEN":
            return "admin-status-open";
        case "CLOSED":
            return "admin-status-closed";
        case "EXPIRED":
            return "admin-status-expired";
        default:
            return "admin-status-default";
    }
};

const getApplicationStatusClass = (status) => {

    switch (status) {
        case "SELECTED":
            return "admin-status-selected";
        case "INTERVIEW":
            return "admin-status-interview";
        case "SHORTLISTED":
            return "admin-status-shortlisted";
        case "REJECTED":
            return "admin-status-rejected";
        case "WITHDRAWN":
            return "admin-status-withdrawn";
        case "UNDER_REVIEW":
            return "admin-status-review";
        default:
            return "admin-status-applied";
    }
};

export default AdminDashboard;
