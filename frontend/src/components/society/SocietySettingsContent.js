import { useEffect, useState } from 'react';
import {
    FaBuilding,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaEdit,
    FaSave,
    FaTimes,
    FaPlus,
    FaTrash,
    FaUsers,
    FaReceipt
} from 'react-icons/fa';

import {
    getMySociety,
    updateSociety,
    updateComplaintCategories,
    updateExpenseCategories,
    updateEmergencyInformation
} from '../../services/societyApi';

const initialForm = {
    societyName: '',
    societyCode: '',
    registrationNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactEmail: '',
    contactPhone: '',
    description: '',
    establishedYear: ''
};

const initialEmergencyForm = {
    policeNumber: '',
    ambulanceNumber: '',
    fireBrigadeNumber: '',
    nearestHospitalName: '',
    nearestHospitalAddress: '',
    nearestHospitalPhone: '',
    societyEmergencyContact: '',
    maintenanceEmergencyContact: ''
};

function SocietySettingsContent({ readOnly = false }) {
    const [society, setSociety] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [complaintCategories, setComplaintCategories] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);

    const [emergencyForm, setEmergencyForm] = useState(initialEmergencyForm);

    const [newComplaint, setNewComplaint] = useState('');
    const [newExpense, setNewExpense] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingEmergency, setSavingEmergency] = useState(false);

    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Load society information
    const fetchSociety = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getMySociety();
            const data = response.data.society;

            setSociety(data);

            setForm({
                societyName: data.societyName || '',
                societyCode: data.societyCode || '',
                registrationNumber: data.registrationNumber || '',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                pincode: data.pincode || '',
                contactEmail: data.contactEmail || '',
                contactPhone: data.contactPhone || '',
                description: data.description || '',
                establishedYear: data.establishedYear || ''
            });

            setComplaintCategories(data.complaintCategories || []);
            setExpenseCategories(data.expenseCategories || []);

            setEmergencyForm({
                policeNumber: data.emergencyInformation?.policeNumber || '',
                ambulanceNumber: data.emergencyInformation?.ambulanceNumber || '',
                fireBrigadeNumber: data.emergencyInformation?.fireBrigadeNumber || '',
                nearestHospitalName: data.emergencyInformation?.nearestHospitalName || '',
                nearestHospitalAddress: data.emergencyInformation?.nearestHospitalAddress || '',
                nearestHospitalPhone: data.emergencyInformation?.nearestHospitalPhone || '',
                societyEmergencyContact: data.emergencyInformation?.societyEmergencyContact || '',
                maintenanceEmergencyContact: data.emergencyInformation?.maintenanceEmergencyContact || ''
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load society information.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSociety();
    }, []);

    // General society form change
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Emergency form change
    const handleEmergencyChange = (e) => {
        setEmergencyForm({
            ...emergencyForm,
            [e.target.name]: e.target.value
        });
    };

    // Update general society information
    const handleSaveSociety = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setMessage('');

            const payload = {
                ...form,
                establishedYear: form.establishedYear
                    ? Number(form.establishedYear)
                    : null
            };

            delete payload.societyCode;

            const response = await updateSociety(payload);

            setSociety(response.data.society);
            setEditing(false);

            setMessage('Society information updated successfully.');

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to update society information.'
            );
        } finally {
            setSaving(false);
        }
    };

    // Save emergency information
    const handleSaveEmergency = async (e) => {
        e.preventDefault();

        try {
            setSavingEmergency(true);
            setError('');
            setMessage('');

            const response = await updateEmergencyInformation(emergencyForm);

            const updatedEmergency = response.data.emergencyInformation;

            setEmergencyForm({
                policeNumber: updatedEmergency?.policeNumber || '',
                ambulanceNumber: updatedEmergency?.ambulanceNumber || '',
                fireBrigadeNumber: updatedEmergency?.fireBrigadeNumber || '',
                nearestHospitalName: updatedEmergency?.nearestHospitalName || '',
                nearestHospitalAddress: updatedEmergency?.nearestHospitalAddress || '',
                nearestHospitalPhone: updatedEmergency?.nearestHospitalPhone || '',
                societyEmergencyContact: updatedEmergency?.societyEmergencyContact || '',
                maintenanceEmergencyContact: updatedEmergency?.maintenanceEmergencyContact || ''
            });

            setSociety({
                ...society,
                emergencyInformation: updatedEmergency
            });

            setMessage('Emergency information updated successfully.');

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to update emergency information.'
            );
        } finally {
            setSavingEmergency(false);
        }
    };

    // Add complaint or expense category
    const addCategory = async (type) => {
        const isComplaint = type === 'complaint';

        const value = isComplaint
            ? newComplaint.trim()
            : newExpense.trim();

        if (!value) return;

        const current = isComplaint
            ? complaintCategories
            : expenseCategories;

        if (
            current.some(
                item => item.toLowerCase() === value.toLowerCase()
            )
        ) {
            setError('This category already exists.');
            return;
        }

        const updated = [...current, value];

        try {
            setError('');
            setMessage('');
            setSaving(true);

            if (isComplaint) {
                const response = await updateComplaintCategories(updated);

                setComplaintCategories(response.data.categories);
                setNewComplaint('');
            } else {
                const response = await updateExpenseCategories(updated);

                setExpenseCategories(response.data.categories);
                setNewExpense('');
            }

            setMessage('Category added successfully.');

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to add category.'
            );
        } finally {
            setSaving(false);
        }
    };

    // Remove complaint or expense category
    const removeCategory = async (type, category) => {
        const isComplaint = type === 'complaint';

        const current = isComplaint
            ? complaintCategories
            : expenseCategories;

        if (current.length <= 1) {
            setError('At least one category must remain.');
            return;
        }

        if (!window.confirm(`Remove "${category}" category?`)) {
            return;
        }

        const updated = current.filter(item => item !== category);

        try {
            setError('');
            setMessage('');
            setSaving(true);

            if (isComplaint) {
                const response = await updateComplaintCategories(updated);
                setComplaintCategories(response.data.categories);
            } else {
                const response = await updateExpenseCategories(updated);
                setExpenseCategories(response.data.categories);
            }

            setMessage('Category removed successfully.');

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to remove category.'
            );
        } finally {
            setSaving(false);
        }
    };

    // Category badges
    const renderCategories = (type, categories) => (
        <div className="d-flex flex-wrap gap-2">
            {categories.map((category) => (
                <span
                    className="society-category-badge"
                    key={category}
                >
                    {category}

                    {!readOnly && (
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => removeCategory(type, category)}
                            title={`Remove ${category}`}
                        >
                            <FaTimes />
                        </button>
                    )}
                </span>
            ))}
        </div>
    );

    // Loading
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="text-muted mt-2">
                    Loading society settings...
                </p>
            </div>
        );
    }

    // Society not found
    if (!society) {
        return (
            <div className="alert alert-danger">
                {error || 'Society information unavailable.'}

                <button
                    className="btn btn-sm btn-outline-danger ms-3"
                    onClick={fetchSociety}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid py-3 society-settings-page">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        {readOnly
                            ? 'Society Information'
                            : 'Society Settings'}
                    </h2>

                    <p className="text-muted mb-0">
                        {readOnly
                            ? 'View your society information and details.'
                            : 'Manage society information and configuration.'}
                    </p>
                </div>

                {!readOnly && !editing && (
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setError('');
                            setEditing(true);
                        }}
                    >
                        <FaEdit className="me-2" />
                        Edit Information
                    </button>
                )}
            </div>

            {/* Success Message */}
            {message && (
                <div className="alert alert-success alert-dismissible">
                    {message}

                    <button
                        className="btn-close"
                        onClick={() => setMessage('')}
                    />
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger alert-dismissible">
                    {error}

                    <button
                        className="btn-close"
                        onClick={() => setError('')}
                    />
                </div>
            )}

            {/* Society Overview */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <div className="d-flex align-items-center gap-3">
                        <div className="society-main-icon">
                            <FaBuilding />
                        </div>

                        <div>
                            <h4 className="fw-bold mb-1">
                                {society.societyName}
                            </h4>

                            <span className="badge bg-primary-subtle text-primary">
                                Society Code: {society.societyCode}
                            </span>

                            <span
                                className={`badge ms-2 ${
                                    society.isActive
                                        ? 'bg-success'
                                        : 'bg-danger'
                                }`}
                            >
                                {society.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            {/* General Society Information */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <h5 className="fw-bold mb-4">
                        <FaBuilding className="me-2 text-primary" />
                        General Information
                    </h5>

                    {editing ? (
                        <form onSubmit={handleSaveSociety}>

                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Society Name *
                                    </label>

                                    <input
                                        className="form-control"
                                        name="societyName"
                                        value={form.societyName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Society Code
                                    </label>

                                    <input
                                        className="form-control"
                                        value={form.societyCode}
                                        disabled
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Registration Number
                                    </label>

                                    <input
                                        className="form-control"
                                        name="registrationNumber"
                                        value={form.registrationNumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Established Year
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        name="establishedYear"
                                        value={form.establishedYear}
                                        onChange={handleChange}
                                        min="1800"
                                        max={new Date().getFullYear()}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Full Address *
                                    </label>

                                    <textarea
                                        className="form-control"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        rows="2"
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        City *
                                    </label>

                                    <input
                                        className="form-control"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        State *
                                    </label>

                                    <input
                                        className="form-control"
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        PIN Code
                                    </label>

                                    <input
                                        className="form-control"
                                        name="pincode"
                                        value={form.pincode}
                                        onChange={handleChange}
                                        maxLength="6"
                                        pattern="[0-9]{6}"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Contact Email
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        name="contactEmail"
                                        value={form.contactEmail}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Contact Phone
                                    </label>

                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="contactPhone"
                                        value={form.contactPhone}
                                        onChange={handleChange}
                                        maxLength="10"
                                        pattern="[0-9]{10}"
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Society Description
                                    </label>

                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows="3"
                                        maxLength="1000"
                                    />
                                </div>

                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">

                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => setEditing(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    <FaSave className="me-2" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>

                            </div>

                        </form>
                    ) : (
                        <div className="row g-4">

                            <div className="col-md-6">
                                <small className="text-muted">
                                    Registration Number
                                </small>

                                <h6>
                                    {society.registrationNumber || 'Not provided'}
                                </h6>
                            </div>

                            <div className="col-md-6">
                                <small className="text-muted">
                                    Established Year
                                </small>

                                <h6>
                                    {society.establishedYear || 'Not provided'}
                                </h6>
                            </div>

                            <div className="col-md-6">
                                <small className="text-muted">
                                    <FaMapMarkerAlt className="me-2" />
                                    Address
                                </small>

                                <h6>{society.address}</h6>

                                <p className="text-muted small mb-0">
                                    {society.city}, {society.state} {society.pincode}
                                </p>
                            </div>

                            <div className="col-md-6">
                                <small className="text-muted">
                                    <FaEnvelope className="me-2" />
                                    Contact Email
                                </small>

                                <h6>
                                    {society.contactEmail || 'Not provided'}
                                </h6>
                            </div>

                            <div className="col-md-6">
                                <small className="text-muted">
                                    <FaPhone className="me-2" />
                                    Contact Phone
                                </small>

                                <h6>
                                    {society.contactPhone || 'Not provided'}
                                </h6>
                            </div>

                            <div className="col-12">
                                <small className="text-muted">
                                    Description
                                </small>

                                <p className="mb-0">
                                    {society.description || 'No description provided.'}
                                </p>
                            </div>

                        </div>
                    )}

                </div>
            </div>

            {/* Emergency Information */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <h5 className="fw-bold mb-3">
                        <FaPhone className="me-2 text-danger" />
                        Emergency Information
                    </h5>

                    <p className="text-muted small mb-4">
                        Important emergency contacts and nearby hospital details.
                    </p>

                    {readOnly ? (
                        <div className="row g-4">

                            <div className="col-md-6">
                                <small className="text-muted">
                                    Police Emergency Number
                                </small>

                                <h6>
                                    {emergencyForm.policeNumber || 'Not provided'}
                                </h6>
                            </div>

                            <div className="col-md-6">
                                <small className="text-muted">
                                    Ambulance Number
                                </small>

                                <h6>
                                    {emergencyForm.ambulanceNumber || 'Not provided'}
                                </h6>
                            </div>

                            <div className="col-md-6">
                                <small className="text-muted">
                                    Fire Brigade Number
                                </small>

                                <h6>
                                    {emergencyForm.fireBrigadeNumber || 'Not provided'}
                                </h6>
                            </div>

                            <div className="col-md-6">
                                <small className="text-muted">
                                    Nearest Hospital
                                </small>

                                <h6>
                                    {emergencyForm.nearestHospitalName || 'Not provided'}
                                </h6>

                                <p className="text-muted small mb-1">
                                    {emergencyForm.nearestHospitalAddress || ''}
                                </p>

                                <p className="mb-0">
                                    {emergencyForm.nearestHospitalPhone || ''}
                                </p>
                            </div>

                            <div className="col-md-6">
                                <small className="text-muted">
                                    Society Emergency Contact
                                </small>

                                <h6>
                                    {emergencyForm.societyEmergencyContact || 'Not provided'}
                                </h6>
                            </div>

                            <div className="col-md-6">
                                <small className="text-muted">
                                    Maintenance Emergency Contact
                                </small>

                                <h6>
                                    {emergencyForm.maintenanceEmergencyContact || 'Not provided'}
                                </h6>
                            </div>

                        </div>
                    ) : (
                        <form onSubmit={handleSaveEmergency}>

                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Police Emergency Number
                                    </label>

                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="policeNumber"
                                        value={emergencyForm.policeNumber}
                                        onChange={handleEmergencyChange}
                                        
                                        placeholder="Enter police number"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Ambulance Number
                                    </label>

                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="ambulanceNumber"
                                        value={emergencyForm.ambulanceNumber}
                                        onChange={handleEmergencyChange}
                                        placeholder="Enter ambulance number"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Fire Brigade Number
                                    </label>

                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="fireBrigadeNumber"
                                        value={emergencyForm.fireBrigadeNumber}
                                        onChange={handleEmergencyChange}
                                        placeholder="Enter fire brigade number"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Nearest Hospital Name
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nearestHospitalName"
                                        value={emergencyForm.nearestHospitalName}
                                        onChange={handleEmergencyChange}
                                        placeholder="Enter hospital name"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Nearest Hospital Phone
                                    </label>

                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="nearestHospitalPhone"
                                        value={emergencyForm.nearestHospitalPhone}
                                        onChange={handleEmergencyChange}
                                        maxLength="15"
                                        pattern="[0-9]{10,15}"
                                        title="Enter 10 to 15 digits"
                                        placeholder="Enter hospital phone"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Society Emergency Contact
                                    </label>

                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="societyEmergencyContact"
                                        value={emergencyForm.societyEmergencyContact}
                                        onChange={handleEmergencyChange}
                                        maxLength="15"
                                        pattern="[0-9]{10,15}"
                                        title="Enter 10 to 15 digits"
                                        placeholder="Enter society emergency contact"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Maintenance Emergency Contact
                                    </label>

                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="maintenanceEmergencyContact"
                                        value={emergencyForm.maintenanceEmergencyContact}
                                        onChange={handleEmergencyChange}
                                        maxLength="15"
                                        pattern="[0-9]{10,15}"
                                        title="Enter 10 to 15 digits"
                                        placeholder="Enter maintenance emergency contact"
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Nearest Hospital Address
                                    </label>

                                    <textarea
                                        className="form-control"
                                        name="nearestHospitalAddress"
                                        value={emergencyForm.nearestHospitalAddress}
                                        onChange={handleEmergencyChange}
                                        rows="2"
                                        placeholder="Enter hospital address"
                                    />
                                </div>

                            </div>

                            <div className="d-flex justify-content-end mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={savingEmergency}
                                >
                                    <FaSave className="me-2" />

                                    {savingEmergency
                                        ? 'Saving...'
                                        : 'Save Emergency Information'}
                                </button>
                            </div>

                        </form>
                    )}

                </div>
            </div>

            {/* Category Management - Admin Only */}
            {!readOnly && (
                <>

                    {/* Complaint Categories */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">

                            <h5 className="fw-bold mb-3">
                                <FaUsers className="me-2 text-primary" />
                                Complaint Categories
                            </h5>

                            <p className="text-muted small">
                                Configure the categories available when residents submit complaints.
                            </p>

                            <div className="input-group mb-3">

                                <input
                                    className="form-control"
                                    placeholder="Enter new complaint category"
                                    value={newComplaint}
                                    onChange={(e) => setNewComplaint(e.target.value)}
                                    maxLength="50"
                                />

                                <button
                                    className="btn btn-primary"
                                    onClick={() => addCategory('complaint')}
                                    disabled={saving || !newComplaint.trim()}
                                >
                                    <FaPlus className="me-2" />
                                    Add
                                </button>

                            </div>

                            {renderCategories('complaint', complaintCategories)}

                        </div>
                    </div>

                    {/* Expense Categories */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">

                            <h5 className="fw-bold mb-3">
                                <FaReceipt className="me-2 text-primary" />
                                Expense Categories
                            </h5>

                            <p className="text-muted small">
                                Configure categories for society expense records.
                            </p>

                            <div className="input-group mb-3">

                                <input
                                    className="form-control"
                                    placeholder="Enter new expense category"
                                    value={newExpense}
                                    onChange={(e) => setNewExpense(e.target.value)}
                                    maxLength="50"
                                />

                                <button
                                    className="btn btn-primary"
                                    onClick={() => addCategory('expense')}
                                    disabled={saving || !newExpense.trim()}
                                >
                                    <FaPlus className="me-2" />
                                    Add
                                </button>

                            </div>

                            {renderCategories('expense', expenseCategories)}

                        </div>
                    </div>

                </>
            )}

            {/* Resident Read-only Categories */}
            {readOnly && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">

                        <h5 className="fw-bold mb-3">
                            Society Categories
                        </h5>

                        <h6 className="mt-3">
                            Complaint Categories
                        </h6>

                        {renderCategories('complaint', complaintCategories)}

                        <h6 className="mt-4">
                            Expense Categories
                        </h6>

                        {renderCategories('expense', expenseCategories)}

                    </div>
                </div>
            )}

        </div>
    );
}

export default SocietySettingsContent;