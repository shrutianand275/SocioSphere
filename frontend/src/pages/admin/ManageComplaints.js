import { useEffect, useState } from 'react';

import {
    FaClipboardList,
    FaClock,
    FaTools,
    FaCheckCircle,
    FaExclamationTriangle,
    FaSearch,
    FaSyncAlt,
    FaEye,
    FaTimes,
    FaUser,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaUserTie
} from 'react-icons/fa';

import DashboardLayout from '../../components/dashboard/dashboardLayout';

import {
    getComplaints,
    getComplaintStats,
    getComplaintById,
    updateComplaintStatus,
    assignComplaint
} from '../../services/complaintApi';


const ManageComplaints = () => {

    const [complaints, setComplaints] = useState([]);

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
        urgent: 0
    });

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1
    });

    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const [showDetails, setShowDetails] = useState(false);

    const [newStatus, setNewStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [saving, setSaving] = useState(false);


    // Fetch complaint list
    const fetchComplaints = async () => {

        try {

            setLoading(true);
            setError('');

            const data = await getComplaints({
                search,
                status,
                category,
                priority,
                page,
                limit: 10
            });

            setComplaints(data.complaints || []);

            setPagination(data.pagination || {
                total: 0,
                totalPages: 1
            });

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to load complaints.'
            );

        } finally {

            setLoading(false);

        }
    };


    // Fetch statistics
    const fetchStats = async () => {

        try {

            const data = await getComplaintStats();

            if (data.success) {
                setStats(data.stats);
            }

        } catch (err) {

            console.error('Statistics error:', err);

        }
    };


    const refreshData = async () => {

        await Promise.all([
            fetchComplaints(),
            fetchStats()
        ]);

    };


    useEffect(() => {

        const timer = setTimeout(() => {
            fetchComplaints();
        }, 300);

        return () => clearTimeout(timer);

    }, [search, status, category, priority, page]);


    useEffect(() => {
        fetchStats();
    }, []);


    // Open complaint details
    const openDetails = async (id) => {

        try {

            const data = await getComplaintById(id);

            setSelectedComplaint(data.complaint);

            setNewStatus(data.complaint.status);

            setRemarks(data.complaint.resolutionNotes || '');

            setAssignedTo(data.complaint.assignedTo || '');

            setShowDetails(true);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to load complaint details.'
            );

        }
    };


    // Update complaint status
    const handleStatusUpdate = async () => {

        if (!selectedComplaint || !newStatus) return;

        try {

            setSaving(true);
            setError('');
            setMessage('');

            await updateComplaintStatus(
                selectedComplaint._id,
                {
                    status: newStatus,
                    remarks
                }
            );

            setMessage('Complaint status updated successfully.');

            await refreshData();

            const updated = await getComplaintById(
                selectedComplaint._id
            );

            setSelectedComplaint(updated.complaint);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Failed to update complaint.'
            );

        } finally {

            setSaving(false);

        }
    };


    // Assign complaint
    const handleAssign = async () => {

        if (!selectedComplaint || !assignedTo.trim()) {
            setError('Please enter an assignee or department.');
            return;
        }

        try {

            setSaving(true);
            setError('');

            await assignComplaint(
                selectedComplaint._id,
                assignedTo
            );

            setMessage('Complaint assigned successfully.');

            await refreshData();

            const updated = await getComplaintById(
                selectedComplaint._id
            );

            setSelectedComplaint(updated.complaint);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Failed to assign complaint.'
            );

        } finally {

            setSaving(false);

        }
    };


    const statusClass = (value) => {
        return `status-badge ${value}`;
    };


    const priorityClass = (value) => {
        return `priority-badge ${value}`;
    };


    return (

        <DashboardLayout>

            <div className="dashboard-heading">

                <div>
                    <h2>Manage Complaints</h2>
                    <p>
                        Monitor and resolve resident complaints.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={refreshData}
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


            {/* STATISTICS */}

            <div className="complaint-stats-grid">

                <div className="complaint-stat-card">
                    <div className="complaint-stat-icon blue">
                        <FaClipboardList />
                    </div>
                    <div>
                        <p>Total Complaints</p>
                        <h3>{stats.total}</h3>
                    </div>
                </div>


                <div className="complaint-stat-card">
                    <div className="complaint-stat-icon orange">
                        <FaClock />
                    </div>
                    <div>
                        <p>Pending</p>
                        <h3>{stats.pending}</h3>
                    </div>
                </div>


                <div className="complaint-stat-card">
                    <div className="complaint-stat-icon purple">
                        <FaTools />
                    </div>
                    <div>
                        <p>In Progress</p>
                        <h3>{stats.inProgress}</h3>
                    </div>
                </div>


                <div className="complaint-stat-card">
                    <div className="complaint-stat-icon green">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <p>Resolved</p>
                        <h3>{stats.resolved}</h3>
                    </div>
                </div>


                <div className="complaint-stat-card">
                    <div className="complaint-stat-icon red">
                        <FaExclamationTriangle />
                    </div>
                    <div>
                        <p>Urgent</p>
                        <h3>{stats.urgent}</h3>
                    </div>
                </div>

            </div>


            {/* FILTERS */}

            <div className="complaint-toolbar">

                <div className="resident-search">
                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search complaints..."
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
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                </select>


                <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Categories</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="security">Security</option>
                    <option value="lift">Lift</option>
                    <option value="parking">Parking</option>
                    <option value="water">Water</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                </select>


                <select
                    value={priority}
                    onChange={(e) => {
                        setPriority(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>

            </div>


            {/* COMPLAINT TABLE */}

            <div className="resident-table-card">

                <div className="table-heading">
                    <h3>Complaint Directory</h3>
                    <p>Total complaints: {pagination.total}</p>
                </div>


                {loading ? (

                    <div className="dashboard-loading">
                        Loading complaints...
                    </div>

                ) : complaints.length === 0 ? (

                    <div className="empty-state">
                        <FaClipboardList />
                        <h3>No complaints found</h3>
                        <p>New complaints will appear here.</p>
                    </div>

                ) : (

                    <div className="table-responsive">

                        <table className="resident-table">

                            <thead>
                                <tr>
                                    <th>Complaint</th>
                                    <th>Resident</th>
                                    <th>Flat</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>


                            <tbody>

                                {complaints.map((item) => (

                                    <tr key={item._id}>

                                        <td>
                                            <strong>
                                                {item.title}
                                            </strong>
                                        </td>

                                        <td>
                                            {item.residentId?.fullName || 'Resident'}
                                        </td>

                                        <td>
                                            {item.residentId?.flatNumber || '-'}
                                        </td>

                                        <td>
                                            <span className="category-label">
                                                {item.category}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={priorityClass(item.priority)}>
                                                {item.priority}
                                            </span>
                                        </td>

                                        <td>
                                            {new Date(
                                                item.createdAt
                                            ).toLocaleDateString('en-IN')}
                                        </td>

                                        <td>
                                            <span className={statusClass(item.status)}>
                                                {item.status}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="complaint-view-button"
                                                onClick={() => openDetails(item._id)}
                                            >
                                                <FaEye />
                                                View
                                            </button>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}


                {/* PAGINATION */}

                <div className="pagination">

                    <span>
                        Page {page} of {Math.max(1, pagination.totalPages)}
                    </span>

                    <div>

                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </button>

                        <button
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>


            {/* COMPLAINT DETAILS MODAL */}

            {showDetails && selectedComplaint && (

                <div
                    className="complaint-modal-overlay"
                    onClick={() => setShowDetails(false)}
                >

                    <div
                        className="complaint-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="complaint-modal-header">

                            <div>
                                <h3>Complaint Details</h3>
                                <p>
                                    Complaint ID: {selectedComplaint._id}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowDetails(false)}
                            >
                                <FaTimes />
                            </button>

                        </div>


                        <div className="complaint-modal-body">

                            <h4>{selectedComplaint.title}</h4>

                            <p className="complaint-description">
                                {selectedComplaint.description}
                            </p>


                            <div className="complaint-detail-grid">

                                <div>
                                    <FaUser />
                                    <span>
                                        {selectedComplaint.residentId?.fullName}
                                    </span>
                                </div>

                                <div>
                                    <FaMapMarkerAlt />
                                    <span>
                                        Flat {selectedComplaint.residentId?.flatNumber}
                                    </span>
                                </div>

                                <div>
                                    <FaCalendarAlt />
                                    <span>
                                        {new Date(
                                            selectedComplaint.createdAt
                                        ).toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div>
                                    <FaUserTie />
                                    <span>
                                        {selectedComplaint.assignedTo || 'Not assigned'}
                                    </span>
                                </div>

                            </div>


                            <div className="complaint-info-tags">
                                <span className={statusClass(selectedComplaint.status)}>
                                    {selectedComplaint.status}
                                </span>

                                <span className={priorityClass(selectedComplaint.priority)}>
                                    {selectedComplaint.priority} Priority
                                </span>
                            </div>


                            {/* IMAGE LINKS */}

                            {selectedComplaint.images?.length > 0 && (

                                <div className="complaint-images">
                                    <h5>Attached Images</h5>

                                    {selectedComplaint.images.map((image, index) => (
                                        <a
                                            key={index}
                                            href={image}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View Image {index + 1}
                                        </a>
                                    ))}

                                </div>

                            )}


                            {/* ASSIGNMENT */}

                            <div className="complaint-form-section">

                                <h5>Assign Complaint</h5>

                                <div className="complaint-input-group">

                                    <input
                                        type="text"
                                        placeholder="Staff member or department"
                                        value={assignedTo}
                                        onChange={(e) =>
                                            setAssignedTo(e.target.value)
                                        }
                                    />

                                    <button
                                        onClick={handleAssign}
                                        disabled={saving}
                                    >
                                        Assign
                                    </button>

                                </div>

                            </div>


                            {/* STATUS UPDATE */}

                            <div className="complaint-form-section">

                                <h5>Update Complaint Status</h5>

                                <select
                                    value={newStatus}
                                    onChange={(e) =>
                                        setNewStatus(e.target.value)
                                    }
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="rejected">Rejected</option>
                                </select>

                                <textarea
                                    placeholder="Enter remarks or resolution details..."
                                    value={remarks}
                                    onChange={(e) =>
                                        setRemarks(e.target.value)
                                    }
                                    rows="3"
                                />

                                <button
                                    className="update-complaint-button"
                                    onClick={handleStatusUpdate}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Update Status'}
                                </button>

                            </div>


                            {/* HISTORY */}

                            <div className="complaint-form-section">

                                <h5>Status History</h5>

                                {selectedComplaint.statusHistory?.map(
                                    (history, index) => (

                                        <div
                                            className="complaint-history-item"
                                            key={index}
                                        >

                                            <strong>
                                                {history.status}
                                            </strong>

                                            <p>{history.remarks}</p>

                                            <small>
                                                {new Date(
                                                    history.updatedAt
                                                ).toLocaleString('en-IN')}
                                            </small>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </DashboardLayout>

    );

};

export default ManageComplaints;