import { useEffect, useState } from 'react';

import {
    FaPlus,
    FaClipboardList,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaSyncAlt
} from 'react-icons/fa';

import ResidentLayout from '../../components/dashboard/ResidentLayout';

import {
    getComplaints,
    createComplaint
} from '../../services/complaintApi';

import { getMySociety } from '../../services/societyApi';


const MyComplaints = () => {

    const [complaints, setComplaints] = useState([]);

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
    });


    // Fetch complaints
    const fetchComplaints = async () => {

        try {

            setLoading(true);

            const data = await getComplaints({
                page: 1,
                limit: 100
            });

            setComplaints(data.complaints || []);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to load your complaints.'
            );

        } finally {

            setLoading(false);

        }
    };


    // Fetch society complaint categories
    const fetchCategories = async () => {

        try {

            setCategoriesLoading(true);

            const response = await getMySociety();

            const society = response.data.society;

            const availableCategories =
                society.complaintCategories || [];

            setCategories(availableCategories);

            setForm(prev => ({
                ...prev,
                category: availableCategories.includes(prev.category)
                    ? prev.category
                    : availableCategories[0] || ''
            }));

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to load complaint categories.'
            );

        } finally {

            setCategoriesLoading(false);

        }
    };


    // Initial loading
    useEffect(() => {

        fetchComplaints();
        fetchCategories();

    }, []);


    // Handle form changes
    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    // Submit complaint
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSubmitting(true);
            setError('');
            setMessage('');

            await createComplaint(form);

            setMessage(
                'Your complaint has been submitted successfully.'
            );

            setForm({
                title: '',
                description: '',
                category: categories[0] || '',
                priority: 'medium'
            });

            setShowForm(false);

            await fetchComplaints();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Failed to submit complaint.'
            );

        } finally {

            setSubmitting(false);

        }
    };


    // Status icon
    const statusIcon = (status) => {

        if (status === 'resolved') return <FaCheckCircle />;

        if (status === 'rejected') return <FaTimesCircle />;

        if (status === 'in-progress') return <FaClock />;

        return <FaClipboardList />;

    };


    return (

        <ResidentLayout>

            <div className="dashboard-heading">

                <div>
                    <h2>My Complaints</h2>
                    <p>Submit complaints and track their progress.</p>
                </div>

                <button
                    className="refresh-button"
                    onClick={() => {
                        fetchComplaints();
                        fetchCategories();
                    }}
                >
                    <FaSyncAlt />
                    Refresh
                </button>

            </div>


            {/* Success Message */}

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}


            {/* Error Message */}

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}


            {/* Complaint Header */}

            <div className="resident-complaint-header">

                <div>
                    <h3>Your Complaint History</h3>

                    <p>
                        Total complaints: {complaints.length}
                    </p>
                </div>

                <button
                    onClick={() => {
                        setError('');
                        setMessage('');
                        setShowForm(!showForm);
                    }}
                >
                    <FaPlus />
                    Submit Complaint
                </button>

            </div>


            {/* Submit Complaint Form */}

            {showForm && (

                <div className="complaint-submit-card">

                    <h3>Submit New Complaint</h3>

                    <form onSubmit={handleSubmit}>

                        <div className="complaint-form-grid">


                            {/* Complaint Title */}

                            <div className="complaint-field full">

                                <label>Complaint Title *</label>

                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Enter complaint title"
                                    maxLength="150"
                                    required
                                />

                            </div>


                            {/* Dynamic Category */}

                            <div className="complaint-field">

                                <label>Category *</label>

                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    required
                                    disabled={
                                        categoriesLoading ||
                                        categories.length === 0
                                    }
                                >

                                    {categoriesLoading ? (

                                        <option value="">
                                            Loading categories...
                                        </option>

                                    ) : categories.length === 0 ? (

                                        <option value="">
                                            No categories available
                                        </option>

                                    ) : (

                                        categories.map((category) => (

                                            <option
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </option>

                                        ))

                                    )}

                                </select>

                            </div>


                            {/* Priority */}

                            <div className="complaint-field">

                                <label>Priority *</label>

                                <select
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="low">Low</option>

                                    <option value="medium">Medium</option>

                                    <option value="high">High</option>

                                    <option value="urgent">Urgent</option>

                                </select>

                            </div>


                            {/* Description */}

                            <div className="complaint-field full">

                                <label>Description *</label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe your problem in detail..."
                                    rows="5"
                                    maxLength="2000"
                                    required
                                />

                            </div>

                        </div>


                        {/* Form Actions */}

                        <div className="complaint-form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => setShowForm(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    categoriesLoading ||
                                    categories.length === 0
                                }
                            >

                                {submitting
                                    ? 'Submitting...'
                                    : 'Submit Complaint'}

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* Complaint List */}

            {loading ? (

                <div className="dashboard-loading">
                    Loading your complaints...
                </div>

            ) : complaints.length === 0 ? (

                <div className="empty-state">

                    <FaClipboardList />

                    <h3>No complaints yet</h3>

                    <p>
                        You haven't submitted any complaints.
                    </p>

                </div>

            ) : (

                <div className="my-complaints-list">

                    {complaints.map((item) => (

                        <div
                            className="my-complaint-card"
                            key={item._id}
                        >

                            <div className="my-complaint-top">

                                <div className="my-complaint-icon">
                                    {statusIcon(item.status)}
                                </div>

                                <div className="my-complaint-info">

                                    <h4>{item.title}</h4>

                                    <p>
                                        {item.category} • {' '}

                                        {new Date(
                                            item.createdAt
                                        ).toLocaleDateString('en-IN')}
                                    </p>

                                </div>

                                <span
                                    className={`status-badge ${item.status}`}
                                >
                                    {item.status}
                                </span>

                            </div>


                            {/* Description */}

                            <p className="my-complaint-description">
                                {item.description}
                            </p>


                            {/* Bottom Information */}

                            <div className="my-complaint-bottom">

                                <span
                                    className={`priority-badge ${item.priority}`}
                                >
                                    {item.priority} priority
                                </span>

                                <span>
                                    Assigned to: {item.assignedTo || 'Not assigned'}
                                </span>

                            </div>


                            {/* Resolution Notes */}

                            {item.resolutionNotes && (

                                <div className="resolution-note">

                                    <strong>Latest remarks:</strong>

                                    <p>{item.resolutionNotes}</p>

                                </div>

                            )}

                        </div>

                    ))}

                </div>

            )}

        </ResidentLayout>

    );

};


export default MyComplaints;