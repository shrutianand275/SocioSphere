import { useEffect, useState } from 'react';

import {
    FaVoteYea,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSearch,
    FaSyncAlt,
    FaTimes,
    FaChartBar,
    FaUsers,
    FaClock,
    FaCheckCircle,
    FaLock
} from 'react-icons/fa';

import DashboardLayout from '../../components/dashboard/dashboardLayout';

import {
    getVotings,
    createVoting,
    updateVoting,
    closeVoting,
    deleteVoting,
    getVotingResults,
    getVotingStats
} from '../../services/votingApi';


const getInitialForm = () => ({
    title: '',
    description: '',
    category: 'general',
    options: ['', ''],
    startDate: new Date().toISOString().slice(0, 16),
    endDate: '',
    status: 'draft',
    showResults: true
});


const ManageVoting = () => {

    const [votings, setVotings] = useState([]);

    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        drafts: 0,
        closed: 0,
        votes: 0
    });

    const [form, setForm] = useState(getInitialForm());

    const [editingId, setEditingId] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [selectedResults, setSelectedResults] = useState(null);

    const [search, setSearch] = useState('');

    const [statusFilter, setStatusFilter] = useState('');

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState('');

    const [error, setError] = useState('');


    // FETCH POLLS

    const fetchVotings = async () => {

        try {

            setLoading(true);

            const data = await getVotings({
                search,
                status: statusFilter
            });

            setVotings(data.votings || []);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to load polls.'
            );

        } finally {

            setLoading(false);

        }
    };


    // FETCH STATISTICS

    const fetchStats = async () => {

        try {

            const data = await getVotingStats();

            if (data.success) {
                setStats(data.stats);
            }

        } catch (err) {

            console.error(err);

        }
    };


    const refreshData = async () => {

        await Promise.all([
            fetchVotings(),
            fetchStats()
        ]);

    };


    useEffect(() => {

        const timer = setTimeout(fetchVotings, 300);

        return () => clearTimeout(timer);

    }, [search, statusFilter]);


    useEffect(() => {
        fetchStats();
    }, []);


    // FORM HANDLING

    const handleChange = (e) => {

        const { name, value, checked, type } = e.target;

        setForm(previous => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value
        }));

    };


    const updateOption = (index, value) => {

        const updated = [...form.options];

        updated[index] = value;

        setForm(previous => ({
            ...previous,
            options: updated
        }));

    };


    const addOption = () => {

        if (form.options.length >= 10) return;

        setForm(previous => ({
            ...previous,
            options: [...previous.options, '']
        }));

    };


    const removeOption = (index) => {

        if (form.options.length <= 2) return;

        setForm(previous => ({
            ...previous,
            options: previous.options.filter(
                (_, i) => i !== index
            )
        }));

    };


    const openCreateForm = () => {

        setEditingId(null);

        setForm(getInitialForm());

        setShowForm(true);

        setError('');

    };


    const openEditForm = (voting) => {

        setEditingId(voting._id);

        setForm({

            title: voting.title,

            description: voting.description,

            category: voting.category,

            options: voting.options.map(option => option.text),

            startDate: new Date(
                voting.startDate
            ).toISOString().slice(0, 16),

            endDate: new Date(
                voting.endDate
            ).toISOString().slice(0, 16),

            status: voting.status,

            showResults: voting.showResults

        });

        setShowForm(true);

        setError('');

    };


    // CREATE / UPDATE POLL

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            setError('');

            setMessage('');

            const payload = {

                title: form.title.trim(),

                description: form.description.trim(),

                category: form.category,

                options: form.options.map(option => ({
                    text: option.trim()
                })),

                startDate: new Date(
                    form.startDate
                ).toISOString(),

                endDate: new Date(
                    form.endDate
                ).toISOString(),

                status: form.status,

                showResults: form.showResults

            };


            if (editingId) {

                await updateVoting(editingId, payload);

                setMessage('Poll updated successfully.');

            } else {

                await createVoting(payload);

                setMessage('Poll created successfully.');

            }

            setShowForm(false);

            setEditingId(null);

            setForm(getInitialForm());

            await refreshData();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to save poll.'
            );

        } finally {

            setSaving(false);

        }

    };


    // CLOSE POLL

    const handleClose = async (id) => {

        if (!window.confirm('Are you sure you want to close this poll?')) {
            return;
        }

        try {

            await closeVoting(id);

            setMessage('Poll closed successfully.');

            await refreshData();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to close poll.'
            );

        }

    };


    // DELETE POLL

    const handleDelete = async (id) => {

        if (!window.confirm('Delete this poll permanently?')) {
            return;
        }

        try {

            await deleteVoting(id);

            setMessage('Poll deleted successfully.');

            await refreshData();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to delete poll.'
            );

        }

    };


    // RESULTS

    const handleResults = async (id) => {

        try {

            const data = await getVotingResults(id);

            setSelectedResults(data);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to load results.'
            );

        }

    };


    return (

        <DashboardLayout>

            <div className="dashboard-heading">

                <div>
                    <h2>Voting & Poll Management</h2>

                    <p>
                        Create polls and manage society voting activities.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={refreshData}
                >
                    <FaSyncAlt /> Refresh
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

            <div className="voting-stats-grid">

                <div className="voting-stat-card">
                    <FaVoteYea />
                    <div>
                        <span>Total Polls</span>
                        <h3>{stats.total}</h3>
                    </div>
                </div>

                <div className="voting-stat-card">
                    <FaClock />
                    <div>
                        <span>Active Polls</span>
                        <h3>{stats.active}</h3>
                    </div>
                </div>

                <div className="voting-stat-card">
                    <FaEdit />
                    <div>
                        <span>Drafts</span>
                        <h3>{stats.drafts}</h3>
                    </div>
                </div>

                <div className="voting-stat-card">
                    <FaCheckCircle />
                    <div>
                        <span>Closed Polls</span>
                        <h3>{stats.closed}</h3>
                    </div>
                </div>

                <div className="voting-stat-card">
                    <FaUsers />
                    <div>
                        <span>Total Votes</span>
                        <h3>{stats.votes}</h3>
                    </div>
                </div>

            </div>


            {/* TOOLBAR */}

            <div className="voting-toolbar">

                <div className="resident-search">
                    <FaSearch />

                    <input
                        placeholder="Search polls..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>


                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Polls</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                </select>


                <button
                    className="voting-create-button"
                    onClick={openCreateForm}
                >
                    <FaPlus /> Create Poll
                </button>

            </div>


            {/* CREATE / EDIT FORM */}

            {showForm && (

                <div className="voting-form-card">

                    <div className="voting-form-heading">

                        <h3>
                            {editingId ? 'Edit Poll' : 'Create New Poll'}
                        </h3>

                        <button
                            onClick={() => setShowForm(false)}
                        >
                            <FaTimes />
                        </button>

                    </div>


                    <form onSubmit={handleSubmit}>

                        <div className="voting-form-grid">

                            <div className="voting-field full">
                                <label>Poll Title *</label>

                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    maxLength="200"
                                    required
                                />
                            </div>


                            <div className="voting-field">
                                <label>Category</label>

                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                >
                                    <option value="general">General</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="security">Security</option>
                                    <option value="events">Events</option>
                                    <option value="facilities">Facilities</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>


                            <div className="voting-field">
                                <label>Publication Status</label>

                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>


                            <div className="voting-field">
                                <label>Start Date & Time *</label>

                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <div className="voting-field">
                                <label>End Date & Time *</label>

                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <div className="voting-field full">
                                <label>Description *</label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="4"
                                    required
                                />
                            </div>

                        </div>


                        {/* OPTIONS */}

                        <div className="voting-options-section">

                            <div className="voting-options-heading">
                                <h4>Voting Options</h4>

                                <button
                                    type="button"
                                    onClick={addOption}
                                    disabled={form.options.length >= 10}
                                >
                                    <FaPlus /> Add Option
                                </button>
                            </div>


                            {form.options.map((option, index) => (

                                <div
                                    className="voting-option-input"
                                    key={index}
                                >

                                    <span>{index + 1}</span>

                                    <input
                                        value={option}
                                        placeholder={`Option ${index + 1}`}
                                        onChange={(e) =>
                                            updateOption(index, e.target.value)
                                        }
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        disabled={form.options.length <= 2}
                                    >
                                        <FaTrash />
                                    </button>

                                </div>

                            ))}

                        </div>


                        <label className="voting-checkbox">

                            <input
                                type="checkbox"
                                name="showResults"
                                checked={form.showResults}
                                onChange={handleChange}
                            />

                            Allow residents to view poll results.

                        </label>


                        <div className="voting-form-actions">

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
                                {saving ? 'Saving...' : 'Save Poll'}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* POLL DIRECTORY */}

            <div className="resident-table-card">

                <div className="table-heading">
                    <h3>Society Polls</h3>
                    <p>Total: {votings.length}</p>
                </div>


                {loading ? (

                    <div className="dashboard-loading">
                        Loading polls...
                    </div>

                ) : votings.length === 0 ? (

                    <div className="empty-state">
                        <FaVoteYea />
                        <h3>No polls available</h3>
                        <p>Create your first society poll.</p>
                    </div>

                ) : (

                    <div className="table-responsive">

                        <table className="resident-table">

                            <thead>
                                <tr>
                                    <th>Poll</th>
                                    <th>Category</th>
                                    <th>Options</th>
                                    <th>Total Votes</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>


                            <tbody>

                                {votings.map((voting) => (

                                    <tr key={voting._id}>

                                        <td>
                                            <strong>{voting.title}</strong>
                                        </td>

                                        <td>{voting.category}</td>

                                        <td>{voting.options.length}</td>

                                        <td>{voting.totalVotes || 0}</td>

                                        <td>
                                            {new Date(
                                                voting.endDate
                                            ).toLocaleDateString('en-IN')}
                                        </td>

                                        <td>
                                            <span className={`status-badge ${voting.status}`}>
                                                {voting.status}
                                            </span>
                                        </td>

                                        <td>

                                            <div className="voting-actions">

                                                <button
                                                    title="Results"
                                                    onClick={() =>
                                                        handleResults(voting._id)
                                                    }
                                                >
                                                    <FaChartBar />
                                                </button>

                                                {voting.status !== 'closed' &&
                                                    voting.totalVotes === 0 && (

                                                        <button
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEditForm(voting)
                                                            }
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                    )
                                                }

                                                {voting.status === 'active' && (

                                                    <button
                                                        title="Close"
                                                        onClick={() =>
                                                            handleClose(voting._id)
                                                        }
                                                    >
                                                        <FaLock />
                                                    </button>

                                                )}

                                                {voting.totalVotes === 0 && (

                                                    <button
                                                        title="Delete"
                                                        onClick={() =>
                                                            handleDelete(voting._id)
                                                        }
                                                    >
                                                        <FaTrash />
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

            </div>


            {/* RESULTS MODAL */}

            {selectedResults && (

                <div
                    className="voting-modal-overlay"
                    onClick={() => setSelectedResults(null)}
                >

                    <div
                        className="voting-results-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="voting-form-heading">

                            <h3>{selectedResults.title}</h3>

                            <button
                                onClick={() => setSelectedResults(null)}
                            >
                                <FaTimes />
                            </button>

                        </div>


                        <h4>
                            Total Votes: {selectedResults.totalVotes}
                        </h4>


                        {selectedResults.results.map((result) => (

                            <div
                                className="voting-result-item"
                                key={result.optionId}
                            >

                                <div className="voting-result-label">
                                    <strong>{result.text}</strong>
                                    <span>
                                        {result.votes} votes
                                        ({result.percentage}%)
                                    </span>
                                </div>

                                <div className="voting-progress">
                                    <div
                                        style={{
                                            width: `${result.percentage}%`
                                        }}
                                    />
                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            )}

        </DashboardLayout>

    );

};

export default ManageVoting;