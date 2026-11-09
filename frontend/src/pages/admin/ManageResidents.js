import { useEffect, useState } from 'react';

import {
    FaSearch,
    FaCheck,
    FaTimes,
    FaSyncAlt,
    FaUser,
    FaChevronLeft,
    FaChevronRight,
    FaPowerOff
} from 'react-icons/fa';

import DashboardLayout from '../../components/dashboard/dashboardLayout';

import {
    getResidents,
    approveResident,
    rejectResident,
    toggleResidentStatus
} from '../../services/adminApi';

const ManageResidents = () => {

    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalResidents: 0,
        totalPages: 1
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchResidents = async () => {

        try {
            setLoading(true);
            setError('');

            const data = await getResidents({
                search,
                status,
                page,
                limit: 10
            });

            setResidents(data.residents || []);
            setPagination(data.pagination || {
                totalResidents: 0,
                totalPages: 1
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to fetch residents.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchResidents();
        }, 300);

        return () => clearTimeout(timer);

    }, [search, status, page]);

    const handleAction = async (action, id) => {

        const confirmation = window.confirm(
            'Are you sure you want to perform this action?'
        );

        if (!confirmation) return;

        try {

            setMessage('');
            setError('');

            if (action === 'approve') {
                await approveResident(id);
                setMessage('Resident approved successfully.');
            }

            if (action === 'reject') {
                await rejectResident(id);
                setMessage('Resident rejected successfully.');
            }

            if (action === 'toggle') {
                await toggleResidentStatus(id);
                setMessage('Resident status updated successfully.');
            }

            await fetchResidents();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Action failed. Please try again.'
            );
        }
    };

    const getStatusClass = (value) => {
        return `status-badge ${value}`;
    };

    return (

        <DashboardLayout>

            <div className="dashboard-heading">

                <div>
                    <h2>Manage Residents</h2>
                    <p>View, search and manage society residents.</p>
                </div>

                <button
                    className="refresh-button"
                    onClick={fetchResidents}
                >
                    <FaSyncAlt />
                    Refresh
                </button>

            </div>

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            <div className="resident-toolbar">

                <div className="resident-search">
                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search by name, email, phone or flat..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Residents</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>

            </div>

            <div className="resident-table-card">

                <div className="table-heading">
                    <div>
                        <h3>Resident Directory</h3>
                        <p>
                            Total residents: {pagination.totalResidents}
                        </p>
                    </div>
                </div>

                {loading ? (

                    <div className="dashboard-loading">
                        Loading residents...
                    </div>

                ) : residents.length === 0 ? (

                    <div className="empty-state">
                        <FaUser />
                        <h3>No residents found</h3>
                        <p>Try changing your search or filter.</p>
                    </div>

                ) : (

                    <div className="table-responsive">

                        <table className="resident-table">

                            <thead>
                                <tr>
                                    <th>Resident</th>
                                    <th>Phone</th>
                                    <th>Flat Number</th>
                                    <th>Registration Date</th>
                                    <th>Status</th>
                                    <th>Account</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {residents.map((resident) => (

                                    <tr key={resident._id}>

                                        <td>
                                            <div className="resident-name">
                                                <div className="resident-avatar">
                                                    {resident.fullName?.charAt(0).toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>{resident.fullName}</strong>
                                                    <small>{resident.email}</small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{resident.phone}</td>

                                        <td>{resident.flatNumber}</td>

                                        <td>
                                            {new Date(
                                                resident.createdAt
                                            ).toLocaleDateString('en-IN')}
                                        </td>

                                        <td>
                                            <span className={getStatusClass(
                                                resident.approvalStatus
                                            )}>
                                                {resident.approvalStatus}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={
                                                resident.isActive
                                                    ? 'account-active'
                                                    : 'account-inactive'
                                            }>
                                                {resident.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>

                                        <td>

                                            <div className="resident-actions">

                                                {resident.approvalStatus !== 'approved' && (
                                                    <button
                                                        className="action-approve"
                                                        title="Approve"
                                                        onClick={() =>
                                                            handleAction(
                                                                'approve',
                                                                resident._id
                                                            )
                                                        }
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                )}

                                                {resident.approvalStatus !== 'rejected' && (
                                                    <button
                                                        className="action-reject"
                                                        title="Reject"
                                                        onClick={() =>
                                                            handleAction(
                                                                'reject',
                                                                resident._id
                                                            )
                                                        }
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                )}

                                                {resident.approvalStatus === 'approved' && (
                                                    <button
                                                        className="action-toggle"
                                                        title="Activate / Deactivate"
                                                        onClick={() =>
                                                            handleAction(
                                                                'toggle',
                                                                resident._id
                                                            )
                                                        }
                                                    >
                                                        <FaPowerOff />
                                                    </button>
                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

                <div className="pagination">

                    <span>
                        Page {page} of {Math.max(1, pagination.totalPages)}
                    </span>

                    <div>

                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                        >
                            <FaChevronLeft />
                        </button>

                        <button
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            <FaChevronRight />
                        </button>

                    </div>

                </div>

            </div>

        </DashboardLayout>

    );
};

export default ManageResidents;