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

function AdminCandidates() {

    const [candidates, setCandidates] = useState([]);
    const [search, setSearch] = useState("");
    const [profileFilter, setProfileFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadCandidates = useCallback(
        async (manualRefresh = false) => {

            if (manualRefresh) setRefreshing(true);
            else setLoading(true);

            setError("");

            try {
                const response = await axiosInstance.get(
                    "/api/admin/candidates"
                );

                setCandidates(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (requestError) {
                console.error("Admin candidates error:", requestError);
                setError(
                    requestError?.response?.data?.message ||
                    "Unable to load candidates."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useEffect(() => {
        loadCandidates();
    }, [loadCandidates]);

    const filteredCandidates = useMemo(
        () => {
            const query = search.trim().toLowerCase();

            return candidates.filter(
                (candidate) => {
                    const profileMatches =
                        profileFilter === "ALL" ||
                        (profileFilter === "COMPLETE" && candidate.profileComplete) ||
                        (profileFilter === "INCOMPLETE" && !candidate.profileComplete) ||
                        (profileFilter === "RESUME" && candidate.resumeUrl);

                    const searchMatches =
                        !query ||
                        String(candidate.name || "").toLowerCase().includes(query) ||
                        String(candidate.email || "").toLowerCase().includes(query) ||
                        String(candidate.location || "").toLowerCase().includes(query) ||
                        String(candidate.skills || "").toLowerCase().includes(query) ||
                        String(candidate.education || "").toLowerCase().includes(query);

                    return profileMatches && searchMatches;
                }
            );
        },
        [candidates, search, profileFilter]
    );

    const completeProfiles = candidates.filter(
        (candidate) => candidate.profileComplete
    ).length;

    const resumeCount = candidates.filter(
        (candidate) => candidate.resumeUrl
    ).length;

    const applicationCount = candidates.reduce(
        (sum, candidate) =>
            sum + Number(candidate.applicationCount || 0),
        0
    );

    if (loading) {
        return <Loader text="Loading candidates..." />;
    }

    return (
        <div className="admin-page">
            <div className="container">
                <PageHeader
                    eyebrow="Candidate Management"
                    title="Candidates"
                    text="Review candidate profiles, skills, applications and resumes."
                    refreshing={refreshing}
                    onRefresh={() => loadCandidates(true)}
                />

                {error && <Alert text={error} />}

                <div className="admin-mini-stat-grid">
                    <MiniStat label="Candidates" value={candidates.length} icon="bi-person-badge" />
                    <MiniStat label="Profiles" value={completeProfiles} icon="bi-person-check" />
                    <MiniStat label="Resumes" value={resumeCount} icon="bi-file-earmark-pdf" />
                    <MiniStat label="Applications" value={applicationCount} icon="bi-file-earmark-text" />
                </div>

                <section className="admin-panel">
                    <div className="admin-toolbar">
                        <div className="admin-search-box">
                            <i className="bi bi-search" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search candidates, skills, education or location..."
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
                            <option value="ALL">All Candidates</option>
                            <option value="COMPLETE">Profile Created</option>
                            <option value="INCOMPLETE">No Profile</option>
                            <option value="RESUME">Resume Uploaded</option>
                        </select>
                    </div>

                    <div className="admin-result-summary">
                        Showing {filteredCandidates.length} of {candidates.length} candidates
                    </div>

                    {filteredCandidates.length === 0
                        ? <Empty title="No candidates found" text="Try changing your search or filter." />
                        : (
                            <div className="admin-profile-grid">
                                {filteredCandidates.map(
                                    (candidate) => (
                                        <article className="admin-profile-card" key={candidate.id}>
                                            <div className="admin-profile-card-top">
                                                <div className="admin-profile-avatar admin-candidate-avatar">
                                                    {(candidate.name || "C").charAt(0).toUpperCase()}
                                                </div>
                                                <span className={`admin-status-pill ${candidate.profileComplete ? "admin-status-open" : "admin-status-expired"}`}>
                                                    {candidate.profileComplete ? "Profile Created" : "No Profile"}
                                                </span>
                                            </div>

                                            <h3>{candidate.name || "Candidate"}</h3>
                                            <p>{candidate.email || "No email"}</p>

                                            <div className="admin-profile-info-grid">
                                                <Info label="Applications" value={candidate.applicationCount ?? 0} />
                                                <Info label="Experience" value={candidate.experience != null ? `${candidate.experience} yrs` : "—"} />
                                                <Info label="Location" value={candidate.location || "—"} />
                                                <Info label="Joined" value={formatDate(candidate.createdAt)} />
                                            </div>

                                            {candidate.education && (
                                                <div className="admin-candidate-detail">
                                                    <i className="bi bi-mortarboard" />
                                                    <span>{candidate.education}</span>
                                                </div>
                                            )}

                                            {candidate.skills && (
                                                <div className="admin-skill-row">
                                                    {String(candidate.skills)
                                                        .split(/[,;|]/)
                                                        .map((skill) => skill.trim())
                                                        .filter(Boolean)
                                                        .slice(0, 7)
                                                        .map((skill) => (
                                                            <span key={skill}>{skill}</span>
                                                        ))
                                                    }
                                                </div>
                                            )}

                                            <div className="admin-profile-card-footer">
                                                {candidate.resumeUrl
                                                    ? (
                                                        <a
                                                            href={candidate.resumeUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="admin-profile-link"
                                                        >
                                                            <i className="bi bi-file-earmark-pdf" />
                                                            View Resume
                                                        </a>
                                                    )
                                                    : (
                                                        <span className="admin-muted">
                                                            <i className="bi bi-file-earmark-x" />
                                                            No resume uploaded
                                                        </span>
                                                    )
                                                }
                                            </div>
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
    return <div className="admin-empty-state"><i className="bi bi-person-x" /><h4>{title}</h4><p>{text}</p></div>;
}

export default AdminCandidates;
