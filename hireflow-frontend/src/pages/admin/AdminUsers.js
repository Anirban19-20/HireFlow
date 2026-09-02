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

function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadUsers =
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
                            "/api/admin/users"
                        );

                    setUsers(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );

                } catch (requestError) {

                    console.error(
                        "Admin users error:",
                        requestError
                    );

                    setError(
                        requestError?.response?.data?.message ||
                        "Unable to load users."
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
            loadUsers();
        },
        [loadUsers]
    );

    const filteredUsers =
        useMemo(
            () => {

                const query =
                    search.trim().toLowerCase();

                return users.filter(
                    (user) => {

                        const roleMatches =
                            roleFilter === "ALL" ||
                            user.role === roleFilter;

                        const searchMatches =
                            !query ||
                            String(user.name || "")
                                .toLowerCase()
                                .includes(query) ||
                            String(user.email || "")
                                .toLowerCase()
                                .includes(query) ||
                            String(user.id ?? "")
                                .includes(query);

                        return roleMatches && searchMatches;
                    }
                );
            },
            [users, search, roleFilter]
        );

    const counts = useMemo(
        () => ({
            total: users.length,
            candidates: users.filter(
                (user) => user.role === "CANDIDATE"
            ).length,
            recruiters: users.filter(
                (user) => user.role === "RECRUITER"
            ).length,
            admins: users.filter(
                (user) => user.role === "ADMIN"
            ).length
        }),
        [users]
    );

    if (loading) {
        return <AdminLoader text="Loading users..." />;
    }

    return (
        <div className="admin-page">
            <div className="container">

                <AdminHeader
                    eyebrow="User Management"
                    title="Platform Users"
                    text="Review every account registered on HireFlow."
                    refreshing={refreshing}
                    onRefresh={() => loadUsers(true)}
                />

                {error && (
                    <AdminAlert text={error} />
                )}

                <div className="admin-mini-stat-grid">
                    <MiniStat
                        label="All Users"
                        value={counts.total}
                        icon="bi-people"
                    />
                    <MiniStat
                        label="Candidates"
                        value={counts.candidates}
                        icon="bi-person-badge"
                    />
                    <MiniStat
                        label="Recruiters"
                        value={counts.recruiters}
                        icon="bi-building"
                    />
                    <MiniStat
                        label="Admins"
                        value={counts.admins}
                        icon="bi-shield-check"
                    />
                </div>

                <section className="admin-panel">
                    <div className="admin-toolbar">
                        <div className="admin-search-box">
                            <i className="bi bi-search" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by name, email or ID..."
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                >
                                    <i className="bi bi-x" />
                                </button>
                            )}
                        </div>

                        <select
                            className="form-select admin-filter-select"
                            value={roleFilter}
                            onChange={(event) =>
                                setRoleFilter(event.target.value)
                            }
                        >
                            <option value="ALL">All Roles</option>
                            <option value="CANDIDATE">Candidates</option>
                            <option value="RECRUITER">Recruiters</option>
                            <option value="ADMIN">Admins</option>
                        </select>
                    </div>

                    <div className="admin-result-summary">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>

                    {filteredUsers.length === 0
                        ? (
                            <AdminEmpty
                                title="No users found"
                                text="Try changing your search or role filter."
                            />
                        )
                        : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                            <th>ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(
                                            (user) => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div className="admin-user-cell">
                                                            <div className="admin-avatar">
                                                                {(user.name || "U")
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                            <strong>
                                                                {user.name || "Unnamed User"}
                                                            </strong>
                                                        </div>
                                                    </td>
                                                    <td>{user.email || "—"}</td>
                                                    <td>
                                                        <span
                                                            className={
                                                                `admin-status-pill ${getRoleClass(user.role)}`
                                                            }
                                                        >
                                                            {formatStatus(user.role)}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(user.createdAt)}</td>
                                                    <td>#{user.id}</td>
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

function AdminHeader({
    eyebrow,
    title,
    text,
    refreshing,
    onRefresh
}) {
    return (
        <header className="admin-page-header">
            <div>
                <Link
                    to="/admin/dashboard"
                    className="admin-back-link"
                >
                    <i className="bi bi-arrow-left" />
                    Admin Dashboard
                </Link>
                <span className="admin-eyebrow">{eyebrow}</span>
                <h1>{title}</h1>
                <p>{text}</p>
            </div>
            <button
                type="button"
                className="admin-refresh-button"
                onClick={onRefresh}
                disabled={refreshing}
            >
                <i
                    className={
                        `bi bi-arrow-clockwise ${refreshing ? "admin-spin" : ""}`
                    }
                />
                Refresh
            </button>
        </header>
    );
}

function MiniStat({
    label,
    value,
    icon
}) {
    return (
        <div className="admin-mini-stat">
            <div>
                <i className={`bi ${icon}`} />
            </div>
            <span>
                <small>{label}</small>
                <strong>{value}</strong>
            </span>
        </div>
    );
}

function AdminLoader({
    text
}) {
    return (
        <div className="admin-loading-screen">
            <div className="spinner-border text-primary" />
            <p>{text}</p>
        </div>
    );
}

function AdminAlert({
    text
}) {
    return (
        <div className="alert alert-danger admin-alert">
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{text}</span>
        </div>
    );
}

function AdminEmpty({
    title,
    text
}) {
    return (
        <div className="admin-empty-state">
            <i className="bi bi-search" />
            <h4>{title}</h4>
            <p>{text}</p>
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

export default AdminUsers;
