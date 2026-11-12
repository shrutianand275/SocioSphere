import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';

import Login from './pages/auth/Login';
import Register from './pages/auth/register';
import PendingApproval from './pages/auth/PendingApproval';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageResidents from './pages/admin/ManageResidents';
import ManageComplaints from './pages/admin/ManageComplaints';
import MyComplaints from './pages/resident/MyComplaints';
import ManageNotices from './pages/admin/ManageNotices';
import ResidentNotices from './pages/resident/ResidentNotices';
import ResidentDashboard from './pages/resident/Residentdashboard';
import ManageVoting from './pages/admin/ManageVoting';
import ResidentVoting from './pages/resident/residentVoting';
import ManageExpenses from './pages/admin/ManageExpenses';
import ResidentExpenses from './pages/resident/ResidentExpenses';
import ReportsAnalytics from './pages/admin/ReportAnalytics';
import AdminMyProfile from './pages/admin/MyProfile';
import ResidentMyProfile from './pages/resident/MyProfile';

import ProtectedRoute from './components/common/ProtectedRoute';

function App() {

    return (

        <Routes>

            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route
                path="/pending-approval"
                element={<PendingApproval />}
            />

            {/* ADMIN ROUTES */}

            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/residents"
                element={
                    <ProtectedRoute allowedRole="admin">
                        <ManageResidents />
                    </ProtectedRoute>
                }
            />

            {/* RESIDENT ROUTES */}

            <Route
                path="/resident/dashboard"
                element={
                    <ProtectedRoute allowedRole="resident">
                        <ResidentDashboard />
                    </ProtectedRoute>
                }
            />

            {/* ADMIN COMPLAINTS */}

            <Route
                path="/admin/complaints"
                element={
                    <ProtectedRoute allowedRole="admin">
                        <ManageComplaints />
                    </ProtectedRoute>
                }
            />

            {/* RESIDENT COMPLAINTS */}

            <Route
                path="/resident/complaints"
                element={
                    <ProtectedRoute allowedRole="resident">
                        <MyComplaints />
                    </ProtectedRoute>
                }
            />

            {/* ADMIN NOTICE MANAGEMENT */}

            <Route
                path="/admin/notices"
                element={
                    <ProtectedRoute allowedRole="admin">
                        <ManageNotices />
                    </ProtectedRoute>
                }
            />

            {/* RESIDENT NOTICE BOARD */}

            <Route
                path="/resident/notices"
                element={
                    <ProtectedRoute allowedRole="resident">
                        <ResidentNotices />
                    </ProtectedRoute>
                }
            />

            {/* ADMIN VOTING */}

            <Route
                path="/admin/voting"
                element={
                    <ProtectedRoute allowedRole="admin">
                        <ManageVoting />
                    </ProtectedRoute>
                }
            />

            {/* RESIDENT VOTING */}

            <Route
                path="/resident/voting"
                element={
                    <ProtectedRoute allowedRole="resident">
                        <ResidentVoting />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/expenses"
                element={
                    <ProtectedRoute allowedRole="admin">
                        <ManageExpenses />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/resident/expenses"
                element={
                    <ProtectedRoute allowedRole="resident">
                        <ResidentExpenses />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute allowedRole="admin">
                        <ReportsAnalytics />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/profile"
                element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminMyProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/resident/profile"
                element={
                    <ProtectedRoute allowedRole="resident">
                        <ResidentMyProfile />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Home />} />

        </Routes>

    );
}

export default App;