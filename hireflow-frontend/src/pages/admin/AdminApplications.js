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

import "./AdminDashboard.css";

const STATUS_OPTIONS = [
    "APPLIED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEW",
    "SELECTED",
    "REJECTED",
    "WITHDRAWN"
];

const formatStatus = (value) => {
    if (!value) return "Unknown";
    return String(value)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDateTime = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Not available"
        : date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
};

function AdminApplications() {

    const [applications, setApplications] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadApplications = useCallback(
        async (manualRefresh = false) => {

            if (manualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            try {
                const response =
                    await axiosInstance.get(
                        "/api/admin/applications"
                    );

                setApplications(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (requestError) {
                console.error("Admin applications error:", requestError);
                setError(
                    requestError?.response?.data?.message ||
                    "Unable to load applications."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

    const filteredApplications = useMemo(
        () => {
            const query = search.trim().toLowerCase();

            return applications.filter(
                (application) => {
                    const statusMatches =
                        statusFilter === "ALL" ||
                        application.status === statusFilter;

                    const searchMatches =
                        !query ||
                        String(application.candidateName || "")
                            .toLowerCase()
                            .includes(query) ||
                        String(application.candidateEmail || "")
                            .toLowerCase()
                            .includes(query) ||
                        String(application.jobTitle || "")
                            .toLowerCase()
                            .includes(query) ||
                        String(application.companyName || "")
                            .toLowerCase()
                            .includes(query) ||
                        String(application.id ?? "")
                            .includes(query);

                    return statusMatches && searchMatches;
                }
            );
        },
        [applications, search, statusFilter]
    );

    const counts = useMemo(
        () => ({
            total: applications.length,
            review: applications.filter(
                (application) =>
                    application.status === "UNDER_REVIEW" ||
                    application.status === "SHORTLISTED"
            ).length,
            interview: applications.filter(
                (application) => application.status === "INTERVIEW"
            ).length,
            selected: applications.filter(
                (application) => application.status === "SELECTED"
            ).length
        }),
        [applications]
    );

    if (loading) {
        return <Loader text="Loading applications..." />;
    }

    return (
        <div className="admin-page">
            <div className="container">
                <PageHeader
                    eyebrow="Recruitment Activity"
                    title="All Applications"
                    text="Monitor candidate applications across every recruiter and job."
                    refreshing={refreshing}
                    onRefresh={() => loadApplications(true)}
                />

                {error && <Alert text={error} />}

                <div className="admin-mini-stat-grid">
                    <MiniStat label="Total" value={counts.total} icon="bi-file-earmark-text" />
                    <MiniStat label="In Review" value={counts.review} icon="bi-search" />
                    <MiniStat label="Interview" value={counts.interview} icon="bi-camera-video" />
                    <MiniStat label="Selected" value={counts.selected} icon="bi-patch-check" />
                </div>

                <section className="admin-panel">
                    <div className="admin-toolbar">
                        <div className="admin-search-box">
                            <i className="bi bi-search" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search candidates, jobs, companies or application IDs..."
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch("")}>
                                    <i className="bi bi-x" />
                                </button>
                            )}
                        </div>

                        <select
                            className="form-select admin-filter-select"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            {STATUS_OPTIONS.map(
                                (status) => (
                                    <option key={status} value={status}>
                                        {formatStatus(status)}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="admin-result-summary">
                        Showing {filteredApplications.length} of {applications.length} applications
                    </div>

                    {filteredApplications.length === 0
                        ? <Empty title="No applications found" text="Try changing the current filters." />
                        : (
                            <div className="admin-table-wrap">
                                <table className="admin-table admin-application-table">
                                    <thead>
                                        <tr>
                                            <th>Candidate</th>
                                            <th>Job</th>
                                            <th>Company</th>
                                            <th>Status</th>
                                            <th>Applied</th>
                                            <th>Resume</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredApplications.map(
                                            (application) => (
                                                <tr key={application.id}>
                                                    <td>
                                                        <div className="admin-user-cell">
                                                            <div className="admin-avatar">
                                                                {(application.candidateName || "C")
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                            <span>
                                                                <strong>{application.candidateName || "Candidate"}</strong>
                                                                <small>{application.candidateEmail || `Candidate #${application.candidateId}`}</small>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <strong>{application.jobTitle || "Job"}</strong>
                                                        <span>Application #{application.id}</span>
                                                    </td>
                                                    <td>{application.companyName || "Company"}</td>
                                                    <td>
                                                        <span className={`admin-status-pill ${getApplicationStatusClass(application.status)}`}>
                                                            {formatStatus(application.status)}
                                                        </span>
                                                    </td>
                                                    <td>{formatDateTime(application.appliedAt)}</td>
                                                    <td>
                                                        {application.resumeUrl
                                                            ? (
                                                                <a
                                                                    href={application.resumeUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="admin-table-action"
                                                                >
                                                                    <i className="bi bi-file-earmark-pdf" />
                                                                    View
                                                                </a>
                                                            )
                                                            : <span className="admin-muted">No resume</span>
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }
                </section>
            </div>
        </div>
    );
}

function PageHeader({eyebrow, title, text, refreshing, onRefresh}) {
    return (
        <header className="admin-page-header">
            <div>
                <Link to="/admin/dashboard" className="admin-back-link"><i className="bi bi-arrow-left" /> Admin Dashboard</Link>
                <span className="admin-eyebrow">{eyebrow}</span>
                <h1>{title}</h1>
                <p>{text}</p>
            </div>
            <button type="button" className="admin-refresh-button" onClick={onRefresh} disabled={refreshing}>
                <i className={`bi bi-arrow-clockwise ${refreshing ? "admin-spin" : ""}`} /> Refresh
            </button>
        </header>
    );
}

function MiniStat({label, value, icon}) {
    return <div className="admin-mini-stat"><div><i className={`bi ${icon}`} /></div><span><small>{label}</small><strong>{value}</strong></span></div>;
}

function Loader({text}) {
    return <div className="admin-loading-screen"><div className="spinner-border text-primary" /><p>{text}</p></div>;
}

function Alert({text}) {
    return <div className="alert alert-danger admin-alert"><i className="bi bi-exclamation-triangle-fill" /><span>{text}</span></div>;
}

function Empty({title, text}) {
    return <div className="admin-empty-state"><i className="bi bi-file-earmark-text" /><h4>{title}</h4><p>{text}</p></div>;
}

const getApplicationStatusClass = (status) => {
    switch (status) {
        case "SELECTED": return "admin-status-selected";
        case "INTERVIEW": return "admin-status-interview";
        case "SHORTLISTED": return "admin-status-shortlisted";
        case "REJECTED": return "admin-status-rejected";
        case "WITHDRAWN": return "admin-status-withdrawn";
        case "UNDER_REVIEW": return "admin-status-review";
        default: return "admin-status-applied";
    }
};

export default AdminApplications;
