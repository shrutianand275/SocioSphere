import { useEffect, useState } from 'react';
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaHome,
    FaBuilding,
    FaShieldAlt,
    FaEdit,
    FaLock,
    FaTimes,
    FaSave
} from 'react-icons/fa';

import {
    getMyProfile,
    updateMyProfile,
    changePassword
} from '../../services/profileApi';

function ProfileContent() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showEdit, setShowEdit] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [editForm, setEditForm] = useState({
        fullName: '',
        phone: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getMyProfile();
            const data = response.data.profile;

            setProfile(data);

            setEditForm({
                fullName: data.fullName || '',
                phone: data.phone || ''
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load profile.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setMessage('');

            const response = await updateMyProfile(editForm);

            setProfile(response.data.profile);
            setShowEdit(false);
            setMessage('Profile updated successfully.');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to update profile.'
            );
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setMessage('');

            const response = await changePassword(passwordForm);

            setMessage(
                response.data.message ||
                'Password changed successfully.'
            );

            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setShowPassword(false);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to change password.'
            );
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="text-muted mt-2">
                    Loading profile...
                </p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="alert alert-danger">
                {error || 'Profile information unavailable.'}
                <button
                    className="btn btn-sm btn-outline-danger ms-3"
                    onClick={fetchProfile}
                >
                    Retry
                </button>
            </div>
        );
    }

    const societyName =
        typeof profile.societyId === 'object'
            ? profile.societyId?.name || 'Society'
            : 'Society';

    const profileDetails = [
        {
            label: 'Full Name',
            value: profile.fullName,
            icon: <FaUser />
        },
        {
            label: 'Email Address',
            value: profile.email,
            icon: <FaEnvelope />
        },
        {
            label: 'Phone Number',
            value: profile.phone,
            icon: <FaPhone />
        },
        {
            label: 'Flat Number',
            value: profile.flatNumber,
            icon: <FaHome />
        },
        {
            label: 'Society',
            value: societyName,
            icon: <FaBuilding />
        },
        {
            label: 'Account Role',
            value: profile.role,
            icon: <FaShieldAlt />
        }
    ];

    return (
        <div className="container-fluid py-3 profile-page">

            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bold mb-1">My Profile</h2>
                <p className="text-muted mb-0">
                    View and manage your personal account information.
                </p>
            </div>

            {/* Messages */}
            {message && (
                <div className="alert alert-success alert-dismissible">
                    {message}
                    <button
                        className="btn-close"
                        onClick={() => setMessage('')}
                    />
                </div>
            )}

            {error && (
                <div className="alert alert-danger alert-dismissible">
                    {error}
                    <button
                        className="btn-close"
                        onClick={() => setError('')}
                    />
                </div>
            )}

            {/* Profile Header Card */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                        <div className="d-flex align-items-center gap-3">

                            <div className="profile-avatar">
                                {profile.fullName?.charAt(0)?.toUpperCase()}
                            </div>

                            <div>
                                <h4 className="fw-bold mb-1">
                                    {profile.fullName}
                                </h4>

                                <p className="text-muted mb-1">
                                    {profile.email}
                                </p>

                                <span className={`badge ${
                                    profile.approvalStatus === 'approved'
                                        ? 'bg-success'
                                        : profile.approvalStatus === 'pending'
                                            ? 'bg-warning text-dark'
                                            : 'bg-danger'
                                }`}>
                                    {profile.approvalStatus}
                                </span>
                            </div>

                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setError('');
                                setShowEdit(true);
                            }}
                        >
                            <FaEdit className="me-2" />
                            Edit Profile
                        </button>

                    </div>
                </div>
            </div>

            {/* Profile Information */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <h5 className="fw-bold mb-4">
                        Personal Information
                    </h5>

                    <div className="row g-4">

                        {profileDetails.map((item) => (
                            <div className="col-md-6 col-lg-4" key={item.label}>
                                <div className="profile-detail">
                                    <div className="profile-detail-icon">
                                        {item.icon}
                                    </div>

                                    <div>
                                        <small className="text-muted">
                                            {item.label}
                                        </small>

                                        <h6 className="fw-semibold mb-0 text-capitalize">
                                            {item.value || 'Not available'}
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>

                </div>
            </div>

            {/* Security */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                        <div>
                            <h5 className="fw-bold mb-1">
                                Account Security
                            </h5>

                            <p className="text-muted mb-0">
                                Keep your account secure by updating your password.
                            </p>
                        </div>

                        <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                                setError('');
                                setShowPassword(true);
                            }}
                        >
                            <FaLock className="me-2" />
                            Change Password
                        </button>

                    </div>

                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEdit && (
                <div className="profile-modal-overlay">
                    <div className="profile-modal">

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">
                                Edit Profile
                            </h5>

                            <button
                                className="btn btn-light"
                                onClick={() => setShowEdit(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfile}>

                            <div className="mb-3">
                                <label className="form-label">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    name="fullName"
                                    value={editForm.fullName}
                                    onChange={handleEditChange}
                                    required
                                    maxLength="100"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    className="form-control"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    className="form-control"
                                    value={profile.email}
                                    disabled
                                />

                                <small className="text-muted">
                                    Email address cannot be changed here.
                                </small>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">

                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => setShowEdit(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    <FaSave className="me-2" />
                                    Save Changes
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPassword && (
                <div className="profile-modal-overlay">
                    <div className="profile-modal">

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">
                                Change Password
                            </h5>

                            <button
                                className="btn btn-light"
                                onClick={() => setShowPassword(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword}>

                            <div className="mb-3">
                                <label className="form-label">
                                    Current Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    minLength="8"
                                    required
                                />

                                <small className="text-muted">
                                    Minimum 8 characters.
                                </small>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Confirm New Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    minLength="8"
                                    required
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4">

                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => setShowPassword(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Update Password
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ProfileContent;