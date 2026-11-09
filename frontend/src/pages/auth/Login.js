import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaEnvelope,
    FaLock,
    FaBuilding,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

import { useAuth } from '../../context/authContext';
import '../../styles/Auth.css';

function Login() {

    const navigate = useNavigate();

    const { login, loading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

        const result = await login(formData);

        if (result.success) {

            if (result.user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/resident/dashboard', { replace: true });
            }

        } else {

            setError(result.message);

        }

    };

    return (

        <div className="auth-page">

            <div className="auth-container">

                <div className="auth-brand">

                    <div className="brand-icon">
                        <FaBuilding />
                    </div>

                    <h2>SocioSphere</h2>

                    <p>Smart Society. Better Living.</p>

                </div>

                <div className="auth-card">

                    <h3>Welcome Back!</h3>

                    <p className="auth-subtitle">
                        Sign in to access your society account.
                    </p>

                    {error && (

                        <div className="alert alert-danger">
                            {error}
                        </div>

                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="input-group">

                                <span className="input-group-text">
                                    <FaEnvelope />
                                </span>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="username"
                                    required
                                />

                            </div>

                        </div>

                        <div className="mb-4">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="input-group">

                                <span className="input-group-text">
                                    <FaLock />
                                </span>

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="input-group-text"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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

                            {loading ? 'Signing in...' : 'Sign In'}

                        </button>

                    </form>

                    <div className="auth-footer">

                        Don't have an account?

                        <Link to="/register">
                            Register here
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

export default Login;