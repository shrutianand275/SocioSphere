import { Link } from 'react-router-dom';
import {
    FaBuilding,
    FaShieldAlt,
    FaWallet,
    FaClipboardList,
    FaVoteYea,
    FaBell
} from 'react-icons/fa';

import '../styles/Home.css';

function Home() {

    const features = [

        {
            icon: <FaClipboardList />,
            title: 'Smart Complaints',
            description: 'Raise complaints and track their resolution.'
        },

        {
            icon: <FaWallet />,
            title: 'Digital Payments',
            description: 'Manage maintenance bills and payment history.'
        },

        {
            icon: <FaVoteYea />,
            title: 'Online Voting',
            description: 'Participate in important society decisions.'
        },

        {
            icon: <FaBell />,
            title: 'Instant Notices',
            description: 'Stay informed with society announcements.'
        },

        {
            icon: <FaShieldAlt />,
            title: 'Secure Platform',
            description: 'Secure access with role-based permissions.'
        },

        {
            icon: <FaBuilding />,
            title: 'Community Management',
            description: 'Bring all society operations together.'
        }

    ];


    return (

        <div className="home-page">

            <nav className="navbar navbar-expand-lg home-navbar">

                <div className="container">

                    <Link to="/" className="navbar-brand">

                        <FaBuilding /> SocioSphere

                    </Link>

                    <div className="ms-auto d-flex gap-2">

                        <Link to="/login" className="btn login-nav">
                            Login
                        </Link>

                        <Link to="/register" className="btn register-nav">
                            Get Started
                        </Link>

                    </div>

                </div>

            </nav>


            <section className="hero-section">

                <div className="container">

                    <div className="row align-items-center">

                        <div className="col-lg-7">

                            <span className="hero-badge">
                                SMART SOCIETY MANAGEMENT
                            </span>

                            <h1>
                                Better Living Starts With
                                <span> Better Community Management.</span>
                            </h1>

                            <p>
                                A centralized digital platform to manage
                                society complaints, maintenance payments,
                                online voting and community announcements.
                            </p>

                            <div className="hero-actions">

                                <Link to="/register" className="btn hero-btn">
                                    Join Your Society
                                </Link>

                                <Link to="/login" className="btn hero-login">
                                    Sign In
                                </Link>

                            </div>

                        </div>


                        <div className="col-lg-5">

                            <div className="hero-visual">

                                <FaBuilding className="hero-building" />

                                <h3>One Platform.</h3>

                                <h3>Every Community Need.</h3>

                                <p>
                                    Simplifying residential society
                                    governance through technology.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            <section className="features-section">

                <div className="container">

                    <div className="section-heading">

                        <span>OUR FEATURES</span>

                        <h2>Everything Your Society Needs</h2>

                        <p>
                            Manage your residential community
                            from one centralized platform.
                        </p>

                    </div>


                    <div className="row g-4">

                        {features.map((feature, index) => (

                            <div className="col-md-6 col-lg-4" key={index}>

                                <div className="feature-card">

                                    <div className="feature-icon">
                                        {feature.icon}
                                    </div>

                                    <h5>{feature.title}</h5>

                                    <p>{feature.description}</p>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </section>


            <footer className="home-footer">

                <div className="container">

                    <h5>SocioSphere</h5>

                    <p>
                        Smart Society. Better Living.
                    </p>

                    <small>
                        © 2026 SocioSphere. All Rights Reserved.
                    </small>

                </div>

            </footer>

        </div>

    );

}

export default Home;