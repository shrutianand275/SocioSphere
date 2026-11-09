import { Link } from 'react-router-dom';
import {
    FaClock,
    FaBuilding,
    FaCheckCircle
} from 'react-icons/fa';

import '../../styles/Auth.css';

function PendingApproval() {

    return (

        <div className="auth-page">

            <div className="auth-container">

                <div className="auth-card text-center">

                    <div className="approval-icon">
                        <FaClock />
                    </div>

                    <h3>Registration Successful!</h3>

                    <p className="auth-subtitle">
                        Welcome to SocioSphere.
                    </p>

                    <div className="alert alert-warning mt-3">

                        <FaClock className="me-2" />

                        Your account is awaiting administrator approval.

                    </div>

                    <div className="mt-4">

                        <FaCheckCircle className="text-success fs-4" />

                        <p className="mt-2">
                            Your registration details have been
                            submitted successfully.
                        </p>

                    </div>

                    <p className="text-muted small mt-3">
                        Once your society administrator approves
                        your registration, you can log in to access
                        your resident dashboard.
                    </p>

                    <Link
                        to="/login"
                        className="btn auth-btn w-100 mt-3"
                    >
                        Go to Login
                    </Link>

                    <Link to="/" className="back-home">
                        <FaBuilding className="me-2" />
                        Back to Home
                    </Link>

                </div>

            </div>

        </div>

    );

}

export default PendingApproval;