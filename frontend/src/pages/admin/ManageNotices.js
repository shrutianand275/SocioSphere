import { useEffect, useState } from 'react';

import {
    FaPlus,
    FaBullhorn,
    FaEdit,
    FaTrash,
    FaSearch,
    FaSyncAlt,
    FaThumbtack,
    FaTimes
} from 'react-icons/fa';

import DashboardLayout from '../../components/dashboard/dashboardLayout';

import {
    getNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    getNoticeStats
} from '../../services/noticeApi';


const initialForm = {
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    status: 'published',
    isPinned: false,
    publishAt: new Date().toISOString().slice(0, 16),
    expiresAt: ''
};


const ManageNotices = () => {

    const [notices, setNotices] = useState([]);

    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        drafts: 0,
        archived: 0,
        pinned: 0
    });

    const [form, setForm] = useState(initialForm);

    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');


    const fetchNotices = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getNotices({
                search,
                category,
                status,
                page: 1,
                limit: 100
            });

            setNotices(data.notices || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to fetch notices'
            );
        } finally {
            setLoading(false);
        }
    };


    const fetchStats = async () => {
        try {
            const data = await getNoticeStats();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Notice statistics error:', err);
        }
    };


    const refreshData = async () => {
        await Promise.all([
            fetchNotices(),
            fetchStats()
        ]);
    };


    useEffect(() => {
        const timer = setTimeout(fetchNotices, 300);
        return () => clearTimeout(timer);
    }, [search, category, status]);


    useEffect(() => {
        fetchStats();
    }, []);


    const openCreateForm = () => {
        setEditingId(null);
        setForm({
            ...initialForm,
            publishAt: new Date().toISOString().slice(0, 16)
        });
        setShowForm(true);
        setError('');
    };


    const openEditForm = (notice) => {
        setEditingId(notice._id);

        setForm({
            title: notice.title,
            content: notice.content,
            category: notice.category,
            priority: notice.priority,
            status: notice.status,
            isPinned: notice.isPinned,
            publishAt: notice.publishAt
                ? new Date(notice.publishAt).toISOString().slice(0, 16)
                : '',
            expiresAt: notice.expiresAt
                ? new Date(notice.expiresAt).toISOString().slice(0, 16)
                : ''
        });

        setShowForm(true);
        setError('');
    };


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm(previous => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setMessage('');

            const payload = {
    ...form,
    attachments: (form.attachmentsText || '')
        .split('\n')
        .map(url => url.trim())
        .filter(Boolean),
    publishAt: form.publishAt
        ? new Date(form.publishAt).toISOString()
        : null,
    expiresAt: form.expiresAt
        ? new Date(form.expiresAt).toISOString()
        : null
            };

            delete payload.attachmentsText;

            if (editingId) {
                await updateNotice(editingId, payload);
                setMessage('Notice updated successfully.');
            } else {
                await createNotice(payload);
                setMessage('Notice created successfully.');
            }

            setShowForm(false);
            setEditingId(null);

            await refreshData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to save notice.'
            );
        } finally {
            setSaving(false);
        }
    };


    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) {
            return;
        }

        try {
            setError('');
            setMessage('');

            await deleteNotice(id);

            setMessage('Notice deleted successfully.');

            await refreshData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to delete notice.'
            );
        }
    };


    return (
        <DashboardLayout>

            <div className="dashboard-heading">
                <div>
                    <h2>Manage Notices</h2>
                    <p>Create and manage society announcements.</p>
                </div>

                <button
                    className="refresh-button"
                    onClick={refreshData}
                >
                    <FaSyncAlt /> Refresh
                </button>
            </div>


            {message && (
                <div className="success-message">{message}</div>
            )}

            {error && (
                <div className="dashboard-error">{error}</div>
            )}


            <div className="notice-stats-grid">

                {[
                    ['Total Notices', stats.total],
                    ['Published', stats.published],
                    ['Drafts', stats.drafts],
                    ['Archived', stats.archived],
                    ['Pinned', stats.pinned]
                ].map(([label, value]) => (
                    <div className="notice-stat-card" key={label}>
                        <span>{label}</span>
                        <h3>{value}</h3>
                    </div>
                ))}

            </div>


            <div className="notice-toolbar">

                <div className="resident-search">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search notices..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="events">Events</option>
                    <option value="emergency">Emergency</option>
                    <option value="meetings">Meetings</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                </select>

                <button
                    className="notice-create-button"
                    onClick={openCreateForm}
                >
                    <FaPlus /> Create Notice
                </button>

            </div>


            {showForm && (
                <div className="notice-form-card">

                    <div className="notice-form-header">
                        <h3>
                            {editingId ? 'Edit Notice' : 'Create New Notice'}
                        </h3>

                        <button onClick={() => setShowForm(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="notice-form-grid">

                            <div className="notice-field full">
                                <label>Notice Title *</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    maxLength="200"
                                    required
                                />
                            </div>

                            <div className="notice-field">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                >
                                    <option value="general">General</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="events">Events</option>
                                    <option value="emergency">Emergency</option>
                                    <option value="meetings">Meetings</option>
                                    <option value="security">Security</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="notice-field">
                                <label>Priority</label>
                                <select
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="important">Important</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="notice-field">
                                <label>Publication Date</label>
                                <input
                                    type="datetime-local"
                                    name="publishAt"
                                    value={form.publishAt}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="notice-field">
                                <label>Expiry Date (Optional)</label>
                                <input
                                    type="datetime-local"
                                    name="expiresAt"
                                    value={form.expiresAt}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="notice-field">
                                <label>Publication Status</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="draft">Save as Draft</option>
                                    <option value="published">Publish</option>
                                    <option value="archived">Archive</option>
                                </select>
                            </div>

                            <div className="notice-field full">
                                <label>Notice Content *</label>
                                <textarea
                                    name="content"
                                    value={form.content}
                                    onChange={handleChange}
                                    rows="5"
                                    maxLength="5000"
                                    required
                                />
                            </div>

                            <div className="notice-field full">
                                <label>
                                    Attachment URLs (one per line, optional)
                                </label>

                                <textarea
                                    value={form.attachmentsText || ''}
                                    onChange={(e) => {
                                        setForm(previous => ({
                                            ...previous,
                                            attachmentsText: e.target.value
                                        }));
                                    }}
                                    rows="2"
                                    placeholder="Paste document URLs, one per line"
                                />
                            </div>

                            <div className="notice-field full">
                                <label className="notice-checkbox">
                                    <input
                                        type="checkbox"
                                        name="isPinned"
                                        checked={form.isPinned}
                                        onChange={handleChange}
                                    />
                                    Pin this important notice
                                </label>
                            </div>

                        </div>

                        <div className="notice-form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Notice'}
                            </button>

                        </div>

                    </form>

                </div>
            )}


            <div className="resident-table-card">

                <div className="table-heading">
                    <h3>Society Notice Directory</h3>
                    <p>Total notices: {notices.length}</p>
                </div>

                {loading ? (
                    <div className="dashboard-loading">
                        Loading notices...
                    </div>
                ) : notices.length === 0 ? (
                    <div className="empty-state">
                        <FaBullhorn />
                        <h3>No notices found</h3>
                        <p>Create your first society notice.</p>
                    </div>
                ) : (

                    <div className="table-responsive">

                        <table className="resident-table">

                            <thead>
                                <tr>
                                    <th>Notice</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Publication Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {notices.map((notice) => (

                                    <tr key={notice._id}>

                                        <td>
                                            <strong>{notice.title}</strong>
                                            {notice.isPinned && (
                                                <FaThumbtack
                                                    style={{
                                                        color: '#e69b24',
                                                        marginLeft: 8
                                                    }}
                                                />
                                            )}
                                        </td>

                                        <td>{notice.category}</td>

                                        <td>
                                            <span className={`priority-badge ${notice.priority}`}>
                                                {notice.priority}
                                            </span>
                                        </td>

                                        <td>
                                            {new Date(
                                                notice.publishAt
                                            ).toLocaleDateString('en-IN')}
                                        </td>

                                        <td>
                                            <span className={`status-badge ${notice.status}`}>
                                                {notice.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="resident-actions">

                                                <button
                                                    className="action-toggle"
                                                    title="Edit"
                                                    onClick={() => openEditForm(notice)}
                                                >
                                                    <FaEdit />
                                                </button>

                                                <button
                                                    className="action-reject"
                                                    title="Delete"
                                                    onClick={() => handleDelete(notice._id)}
                                                >
                                                    <FaTrash />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </DashboardLayout>
    );
};

export default ManageNotices;