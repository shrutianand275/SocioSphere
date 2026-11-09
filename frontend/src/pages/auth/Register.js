import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaBuilding,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaLock,
    FaHome,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

import { useAuth } from '../../context/authContext';
import '../../styles/Auth.css';

function Register() {

    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        flatNumber: '',
        societyCode: ''
    });

    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError('');

        if (formData.password.length < 8) {
            setError('Password must contain at least 8 characters.');
            return;
        }

        const result = await register(formData);

        if (result.success) {
            navigate('/pending-approval');
        } else {
            setError(result.message);
        }

    };

    return (

        <div className="auth-page">

            <div className="auth-container register-container">

                <div className="auth-brand">

                    <div className="brand-icon">
                        <FaBuilding />
                    </div>

                    <h2>SocioSphere</h2>

                    <p>Join Your Community</p>

                </div>

                <div className="auth-card">

                    <h3>Create Account</h3>

                    <p className="auth-subtitle">
                        Register to access your society portal.
                    </p>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">

                            <label>Full Name</label>

                            <div className="input-group">

                                <span className="input-group-text">
                                    <FaUser />
                                </span>

                                <input
                                    type="text"
                                    name="fullName"
                                    className="form-control"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <div className="mb-3">

                            <label>Email Address</label>

                            <div className="input-group">

                                <span className="input-group-text">
                                    <FaEnvelope />
                                </span>

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <div className="mb-3">

                            <label>Phone Number</label>

                            <div className="input-group">

                                <span className="input-group-text">
                                    <FaPhone />
                                </span>

                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    placeholder="10-digit mobile number"
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <div className="mb-3">

                            <label>Flat Number</label>

                            <div className="input-group">

                                <span className="input-group-text">
                                    <FaHome />
                                </span>

                                <input
                                    type="text"
                                    name="flatNumber"
                                    className="form-control"
                                    placeholder="Example: A-101"
                                    value={formData.flatNumber}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <div className="mb-3">

                            <label>Society Registration Code</label>

                            <div className="input-group">

                                <span className="input-group-text">
                                    <FaBuilding />
                                </span>

                                <input
                                    type="text"
                                    name="societyCode"
                                    className="form-control"
                                    placeholder="Example: GVR001"
                                    value={formData.societyCode}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <div className="mb-4">

                            <label>Password</label>

                            <div className="input-group">

                                <span className="input-group-text">
                                    <FaLock />
                                </span>

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="form-control"
                                    placeholder="Minimum 8 characters"
                                    minLength="8"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="input-group-text"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="btn auth-btn w-100"
                            disabled={loading}
                        >

                            {loading ? 'Creating Account...' : 'Create Account'}

                        </button>

                    </form>

                    <div className="auth-footer">

                        Already have an account?

                        <Link to="/login">
                            Login here
                        </Link>

                    </div>

                    <Link to="/" className="back-home">
                        Back to Home
                    </Link>

                </div>

            </div>

        </div>

    );

}

export default Register;