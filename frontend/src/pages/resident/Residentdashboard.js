import { useAuth } from '../../context/authContext';

import {
    FaClipboardList,
    FaFileInvoiceDollar,
    FaBullhorn,
    FaVoteYea,
    FaArrowRight,
    FaHome
} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

import ResidentLayout from '../../components/dashboard/ResidentLayout';

const ResidentDashboard = () => {

    const { user } = useAuth();
    const navigate = useNavigate();

    const modules = [
        {
            title: 'My Complaints',
            description: 'Submit complaints and track their progress.',
            icon: <FaClipboardList />,
            color: '#2864d7',
            path: '/resident/complaints'
        },
        {
            title: 'Maintenance Bills',
            description: 'View maintenance bills and payment status.',
            icon: <FaFileInvoiceDollar />,
            color: '#16a36a',
            path: '/resident/billing'
        },
        {
            title: 'Society Notices',
            description: 'Stay updated with society announcements.',
            icon: <FaBullhorn />,
            color: '#e69b24',
            path: '/resident/notices'
        },
        {
            title: 'Voting & Polls',
            description: 'Participate in society polls and voting.',
            icon: <FaVoteYea />,
            color: '#7955d9',
            path: '/resident/voting'
        }
    ];

    return (

        <ResidentLayout>

            <div className="resident-welcome">

                <div>
                    <span className="resident-welcome-label">
                        RESIDENT DASHBOARD
                    </span>

                    <h2>
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Resident'}!
                    </h2>

                    <p>
                        Manage your residential activities from one place.
                    </p>
                </div>

                <div className="resident-welcome-icon">
                    <FaHome />
                </div>

            </div>


            <div className="resident-information-grid">

                <div className="resident-information-card">
                    <span>Resident Name</span>
                    <h4>{user?.fullName || '-'}</h4>
                </div>

                <div className="resident-information-card">
                    <span>Flat Number</span>
                    <h4>{user?.flatNumber || '-'}</h4>
                </div>

                <div className="resident-information-card">
                    <span>Phone Number</span>
                    <h4>{user?.phone || '-'}</h4>
                </div>

                <div className="resident-information-card">
                    <span>Account Status</span>
                    <h4 className="resident-approved">
                        Approved
                    </h4>
                </div>

            </div>


            <div className="resident-section-heading">

                <div>
                    <h3>Society Services</h3>
                    <p>Access your residential services.</p>
                </div>

            </div>


            <div className="resident-services-grid">

                {modules.map((module) => (

                    <div
                        className="resident-service-card"
                        key={module.title}
                    >

                        <div
                            className="resident-service-icon"
                            style={{
                                color: module.color,
                                background: `${module.color}15`
                            }}
                        >
                            {module.icon}
                        </div>

                        <h4>{module.title}</h4>

                        <p>{module.description}</p>

                        <button
                            onClick={() => navigate(module.path)}
                        >
                            Open Module
                            <FaArrowRight />
                        </button>

                    </div>

                ))}

            </div>

        </ResidentLayout>

    );

};

export default ResidentDashboard;