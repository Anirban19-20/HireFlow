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

const formatDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Not available"
        : date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
};

function AdminRecruiters() {

    const [recruiters, setRecruiters] = useState([]);
    const [search, setSearch] = useState("");
    const [profileFilter, setProfileFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadRecruiters = useCallback(
        async (manualRefresh = false) => {

            if (manualRefresh) setRefreshing(true);
            else setLoading(true);

            setError("");

            try {
                const response = await axiosInstance.get(
                    "/api/admin/recruiters"
                );

                setRecruiters(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (requestError) {
                console.error("Admin recruiters error:", requestError);
                setError(
                    requestError?.response?.data?.message ||
                    "Unable to load recruiters."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        loadRecruiters();
    }, [loadRecruiters]);

    const filteredRecruiters = useMemo(
        () => {
            const query = search.trim().toLowerCase();

            return recruiters.filter(
                (recruiter) => {
                    const profileMatches =
                        profileFilter === "ALL" ||
                        (profileFilter === "COMPLETE" && recruiter.profileComplete) ||
                        (profileFilter === "INCOMPLETE" && !recruiter.profileComplete);

                    const searchMatches =
                        !query ||
                        String(recruiter.name || "").toLowerCase().includes(query) ||
                        String(recruiter.email || "").toLowerCase().includes(query) ||
                        String(recruiter.companyName || "").toLowerCase().includes(query);

                    return profileMatches && searchMatches;
                }
            );
        },
        [recruiters, search, profileFilter]
    );

    const completeProfiles = recruiters.filter(
        (recruiter) => recruiter.profileComplete
    ).length;

    const totalJobs = recruiters.reduce(
        (sum, recruiter) =>
            sum + Number(recruiter.jobCount || 0),
        0
    );

    if (loading) {
        return <Loader text="Loading recruiters..." />;
    }

    return (
        <div className="admin-page">
            <div className="container">
                <PageHeader
                    eyebrow="Recruiter Management"
                    title="Recruiters"
                    text="Review recruiter accounts, companies and job activity."
                    refreshing={refreshing}
                    onRefresh={() => loadRecruiters(true)}
                />

                {error && <Alert text={error} />}

                <div className="admin-mini-stat-grid admin-mini-stat-grid-three">
                    <MiniStat label="Recruiters" value={recruiters.length} icon="bi-building" />
                    <MiniStat label="Complete Profiles" value={completeProfiles} icon="bi-patch-check" />
                    <MiniStat label="Jobs Posted" value={totalJobs} icon="bi-briefcase" />
                </div>

                <section className="admin-panel">
                    <div className="admin-toolbar">
                        <div className="admin-search-box">
                            <i className="bi bi-search" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search recruiter, email or company..."
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch("")}>
                                    <i className="bi bi-x" />
                                </button>
                            )}
                        </div>

                        <select
                            className="form-select admin-filter-select"
                            value={profileFilter}
                            onChange={(event) => setProfileFilter(event.target.value)}
                        >
                            <option value="ALL">All Profiles</option>
                            <option value="COMPLETE">Complete</option>
                            <option value="INCOMPLETE">Incomplete</option>
                        </select>
                    </div>

                    <div className="admin-result-summary">
                        Showing {filteredRecruiters.length} of {recruiters.length} recruiters
                    </div>

                    {filteredRecruiters.length === 0
                        ? <Empty title="No recruiters found" text="Try changing your search or filter." />
                        : (
                            <div className="admin-profile-grid">
                                {filteredRecruiters.map(
                                    (recruiter) => (
                                        <article className="admin-profile-card" key={recruiter.id}>
                                            <div className="admin-profile-card-top">
                                                <div className="admin-profile-avatar admin-recruiter-avatar">
                                                    {(recruiter.name || "R").charAt(0).toUpperCase()}
                                                </div>
                                                <span className={`admin-status-pill ${recruiter.profileComplete ? "admin-status-open" : "admin-status-expired"}`}>
                                                    {recruiter.profileComplete ? "Profile Complete" : "Profile Incomplete"}
                                                </span>
                                            </div>

                                            <h3>{recruiter.name || "Recruiter"}</h3>
                                            <p>{recruiter.email || "No email"}</p>

                                            <div className="admin-profile-company">
                                                <i className="bi bi-building" />
                                                <span>
                                                    <small>Company</small>
                                                    <strong>{recruiter.companyName || "Not provided"}</strong>
                                                </span>
                                            </div>

                                            <div className="admin-profile-info-grid">
                                                <Info label="Jobs Posted" value={recruiter.jobCount ?? 0} />
                                                <Info label="Joined" value={formatDate(recruiter.createdAt)} />
                                            </div>

                                            {recruiter.companyDescription && (
                                                <p className="admin-profile-description">
                                                    {recruiter.companyDescription}
                                                </p>
                                            )}

                                            {recruiter.website && (
                                                <a
                                                    href={recruiter.website}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="admin-profile-link"
                                                >
                                                    <i className="bi bi-globe2" />
                                                    Visit Website
                                                </a>
                                            )}
                                        </article>
                                    )
                                )}
                            </div>
                        )
                    }
                </section>
            </div>
        </div>
    );
}

function PageHeader({eyebrow, title, text, refreshing, onRefresh}) {
    return <header className="admin-page-header"><div><Link to="/admin/dashboard" className="admin-back-link"><i className="bi bi-arrow-left" /> Admin Dashboard</Link><span className="admin-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div><button type="button" className="admin-refresh-button" onClick={onRefresh} disabled={refreshing}><i className={`bi bi-arrow-clockwise ${refreshing ? "admin-spin" : ""}`} /> Refresh</button></header>;
}

function MiniStat({label, value, icon}) {
    return <div className="admin-mini-stat"><div><i className={`bi ${icon}`} /></div><span><small>{label}</small><strong>{value}</strong></span></div>;
}

function Info({label, value}) {
    return <div><small>{label}</small><strong>{value}</strong></div>;
}

function Loader({text}) {
    return <div className="admin-loading-screen"><div className="spinner-border text-primary" /><p>{text}</p></div>;
}

function Alert({text}) {
    return <div className="alert alert-danger admin-alert"><i className="bi bi-exclamation-triangle-fill" /><span>{text}</span></div>;
}

function Empty({title, text}) {
    return <div className="admin-empty-state"><i className="bi bi-building" /><h4>{title}</h4><p>{text}</p></div>;
}

export default AdminRecruiters;
