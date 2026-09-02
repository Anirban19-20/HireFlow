import {
    BrowserRouter,
    Route,
    Routes
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicJobDetails from "./pages/PublicJobDetails";

import Jobs from "./pages/candidate/Jobs";
import JobDetails from "./pages/candidate/JobDetails";
import CandidateProfile from "./pages/candidate/CandidateProfile";
import Applications from "./pages/candidate/Applications";
import SavedJobs from "./pages/candidate/SavedJobs";
import CandidateInterviews from "./pages/candidate/CandidateInterviews";
import Offers from "./pages/candidate/Offers";
import CandidateOnboarding from "./pages/candidate/CandidateOnboarding";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";

import MyJobs from "./pages/recruiter/MyJobs";
import CreateJob from "./pages/recruiter/CreateJob";
import EditJob from "./pages/recruiter/EditJob";
import JobApplications from "./pages/recruiter/JobApplications";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import RecruiterInterviews from "./pages/recruiter/RecruiterInterviews";
import RecruiterOnboarding from "./pages/recruiter/RecruiterOnboarding";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminRecruiters from "./pages/admin/AdminRecruiters";
import AdminCandidates from "./pages/admin/AdminCandidates";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {

    return (

        <BrowserRouter>

            <Navbar />

            <Routes>

                {/* =========================================
                    PUBLIC
                ========================================= */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/jobs/:jobId"
                    element={<PublicJobDetails />}
                />


                {/* =========================================
                    CANDIDATE
                ========================================= */}

                <Route
                    path="/candidate/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CANDIDATE"]}
                        >
                            <CandidateDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/candidate/jobs"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CANDIDATE"]}
                        >
                            <Jobs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/candidate/jobs/:jobId"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CANDIDATE"]}
                        >
                            <JobDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/candidate/profile"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CANDIDATE"]}
                        >
                            <CandidateProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/candidate/applications"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CANDIDATE"]}
                        >
                            <Applications />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/candidate/saved-jobs"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CANDIDATE"]}
                        >
                            <SavedJobs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/candidate/interviews"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CANDIDATE"]}
                        >
                            <CandidateInterviews />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/candidate/offers"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CANDIDATE"]}
                        >
                            <Offers />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/candidate/onboarding"
                    element={
                        <ProtectedRoute
                            allowedRoles={["CANDIDATE"]}
                        >
                            <CandidateOnboarding />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    RECRUITER
                ========================================= */}

                <Route
                    path="/recruiter/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["RECRUITER"]}
                        >
                            <RecruiterDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recruiter/jobs"
                    element={
                        <ProtectedRoute
                            allowedRoles={["RECRUITER"]}
                        >
                            <MyJobs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recruiter/jobs/create"
                    element={
                        <ProtectedRoute
                            allowedRoles={["RECRUITER"]}
                        >
                            <CreateJob />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recruiter/jobs/:jobId/edit"
                    element={
                        <ProtectedRoute
                            allowedRoles={["RECRUITER"]}
                        >
                            <EditJob />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recruiter/jobs/:jobId/applications"
                    element={
                        <ProtectedRoute
                            allowedRoles={["RECRUITER"]}
                        >
                            <JobApplications />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recruiter/profile"
                    element={
                        <ProtectedRoute
                            allowedRoles={["RECRUITER"]}
                        >
                            <RecruiterProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recruiter/interviews"
                    element={
                        <ProtectedRoute
                            allowedRoles={["RECRUITER"]}
                        >
                            <RecruiterInterviews />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recruiter/onboarding"
                    element={
                        <ProtectedRoute
                            allowedRoles={["RECRUITER"]}
                        >
                            <RecruiterOnboarding />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    ADMIN
                ========================================= */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >
                            <AdminUsers />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/jobs"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >
                            <AdminJobs />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/applications"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >
                            <AdminApplications />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/recruiters"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >
                            <AdminRecruiters />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/candidates"
                    element={
                        <ProtectedRoute
                            allowedRoles={["ADMIN"]}
                        >
                            <AdminCandidates />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
