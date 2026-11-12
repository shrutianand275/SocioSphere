import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaBuilding,
    FaUsers,
    FaHome,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaClipboardList,
    FaBullhorn,
    FaVoteYea,
    FaWallet,
    FaChartLine,
    FaUserCircle
} from 'react-icons/fa';

import { useState } from 'react';

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    const navigation = [
        {
            title: 'Dashboard',
            path: '/admin/dashboard',
            icon: <FaHome />
        },
        {
            title: 'Manage Residents',
            path: '/admin/residents',
            icon: <FaUsers />
        },
        {
            title: 'Manage Complaints',
            path: '/admin/complaints',
            icon: <FaClipboardList />
        },
        {
            title: 'Manage Notices',
            path: '/admin/notices',
            icon: <FaBullhorn />
        },
        {
            title: 'Voting & Polls',
            path: '/admin/voting',
            icon: <FaVoteYea />
        },
        {
            title: 'Expense Management',
            path: '/admin/expenses',
            icon: <FaWallet />
        },
        {
            title: 'Reports & Analytics',
            path: '/admin/reports',
            icon: <FaChartLine />
        },
        {
            title: 'My Profile',
            path: '/admin/profile',
            icon: <FaUserCircle />
        }
    ];

    return (
        <div className="dashboard-container">

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>

                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <FaBuilding />
                    </div>

                    <div>
                        <h4>SocioSphere</h4>
                        <span>Society Management</span>
                    </div>

                    <button
                        className="sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="sidebar-section-title">
                    MAIN MENU
                </div>

                <nav className="sidebar-navigation">

                    {navigation.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                        >
                            {item.icon}
                            <span>{item.title}</span>
                        </NavLink>
                    ))}

                </nav>

                <div className="sidebar-bottom">

                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            <main className="dashboard-main">

                <header className="dashboard-topbar">

                    <button
                        className="mobile-menu-button"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <FaBars />
                    </button>

                    <div>
                        <h5>Administration Panel</h5>
                        <span>Manage your residential society</span>
                    </div>

                    <div className="admin-profile">
                        <div className="admin-avatar">A</div>

                        <div>
                            <strong>Administrator</strong>
                            <small>Society Admin</small>
                        </div>
                    </div>

                </header>

                <section className="dashboard-content">
                    {children}
                </section>

            </main>

        </div>
    );
};

export default DashboardLayout;