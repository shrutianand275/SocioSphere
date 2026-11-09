import { useEffect, useState } from 'react';

import {
    FaUsers,
    FaUserCheck,
    FaUserClock,
    FaUserTimes,
    FaUserShield,
    FaSyncAlt,
    FaBuilding
} from 'react-icons/fa';

import DashboardLayout from '../../components/dashboard/dashboardLayout';
import StatCard from '../../components/dashboard/Statcard';

import { getDashboardStats } from '../../services/adminApi';

const AdminDashboard = () => {

    const [stats, setStats] = useState({
        totalResidents: 0,
        approvedResidents: 0,
        pendingResidents: 0,
        rejectedResidents: 0,
        activeResidents: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = async () => {

        try {
            setLoading(true);
            setError('');

            const data = await getDashboardStats();

            if (data.success) {
                setStats(data.stats);
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load dashboard statistics.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (

        <DashboardLayout>

            <div className="dashboard-heading">

                <div>
                    <h2>Dashboard Overview</h2>
                    <p>Welcome to your society administration dashboard.</p>
                </div>

                <button
                    className="refresh-button"
                    onClick={fetchStats}
                    disabled={loading}
                >
                    <FaSyncAlt />
                    Refresh
                </button>

            </div>

            {error && (
                <div className="dashboard-error">
                    {error}
                    <button onClick={fetchStats}>Retry</button>
                </div>
            )}

            {loading ? (

                <div className="dashboard-loading">
                    Loading dashboard statistics...
                </div>

            ) : (

                <>

                    <div className="stats-grid">

                        <StatCard
                            title="Total Residents"
                            value={stats.totalResidents}
                            icon={<FaUsers />}
                            color="#3978e8"
                            description="Registered residents"
                        />

                        <StatCard
                            title="Approved Residents"
                            value={stats.approvedResidents}
                            icon={<FaUserCheck />}
                            color="#16a36a"
                            description="Approved accounts"
                        />

                        <StatCard
                            title="Pending Approvals"
                            value={stats.pendingResidents}
                            icon={<FaUserClock />}
                            color="#e69b24"
                            description="Waiting for approval"
                        />

                        <StatCard
                            title="Rejected Residents"
                            value={stats.rejectedResidents}
                            icon={<FaUserTimes />}
                            color="#df5252"
                            description="Rejected applications"
                        />

                        <StatCard
                            title="Active Residents"
                            value={stats.activeResidents}
                            icon={<FaUserShield />}
                            color="#7955d9"
                            description="Active approved accounts"
                        />

                    </div>

                    <div className="dashboard-welcome-card">

                        <div>
                            <h3>SocioSphere Administration</h3>

                            <p>
                                Manage residents and monitor your residential
                                society from one centralized dashboard.
                            </p>
                        </div>

                        <FaBuilding className="welcome-building-icon" />

                    </div>

                </>

            )}

        </DashboardLayout>

    );
};

export default AdminDashboard;