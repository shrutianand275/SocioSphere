import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import {
    FaBuilding,
    FaHome,
    FaClipboardList,
    FaBullhorn,
    FaFileInvoiceDollar,
    FaVoteYea,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaWallet,
    FaUserCircle
} from 'react-icons/fa';

import { useAuth } from '../../context/authContext';
import NotificationBell from '../notifications/NotificationBell';

const ResidentLayout = ({ children }) => {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        {
            title: 'Dashboard',
            path: '/resident/dashboard',
            icon: <FaHome />
        },
        {
            title: 'Society Information',
            path: '/resident/society-information',
            icon: <FaBuilding />
        },
        {
            title: 'My Complaints',
            path: '/resident/complaints',
            icon: <FaClipboardList />
        },
        {
            title: 'Maintenance Bills',
            path: '/resident/billing',
            icon: <FaFileInvoiceDollar />
        },
        {
            title: 'Notices',
            path: '/resident/notices',
            icon: <FaBullhorn />
        },
        {
            title: 'Voting & Polls',
            path: '/resident/voting',
            icon: <FaVoteYea />
        },
        {
            title: 'Society Expenses',
            path: '/resident/expenses',
            icon: <FaWallet />
        },
        {
            title: 'My Profile',
            path: '/resident/profile',
            icon: <FaUserCircle />
        }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (

        <div className="resident-layout">

            {sidebarOpen && (
                <div
                    className="resident-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside className={`resident-sidebar ${sidebarOpen ? 'open' : ''}`}>

                <div className="resident-brand">

                    <div className="resident-brand-icon">
                        <FaBuilding />
                    </div>

                    <div>
                        <h4>SocioSphere</h4>
                        <span>Resident Portal</span>
                    </div>

                    <button
                        className="resident-sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <FaTimes />
                    </button>

                </div>

                <nav className="resident-navigation">

                    {navigation.map((item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `resident-nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            {item.icon}
                            <span>{item.title}</span>
                        </NavLink>

                    ))}

                </nav>

                <div className="resident-sidebar-bottom">

                    <div className="resident-sidebar-user">

                        <div className="resident-user-avatar">
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'R'}
                        </div>

                        <div>
                            <strong>{user?.fullName || 'Resident'}</strong>
                            <small>Resident</small>
                        </div>

                    </div>

                    <button
                        className="resident-logout"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt />
                        Logout
                    </button>

                </div>

            </aside>

            <main className="resident-main">

                <header className="resident-topbar">

                    <button
                        className="resident-menu-button"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <FaBars />
                    </button>

                    <div>
                        <h5>Resident Community Portal</h5>
                        <span>Welcome to your society</span>
                    </div>

                    <div className="resident-topbar-profile">

                        <NotificationBell />

                        <div className="resident-topbar-avatar">
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'R'}
                        </div>

                        <div>
                            <strong>{user?.fullName || 'Resident'}</strong>
                            <small>Flat {user?.flatNumber || '-'}</small>
                        </div>

                    </div>

                </header>

                <section className="resident-content">
                    {children}
                </section>

            </main>

        </div>

    );
};

export default ResidentLayout;