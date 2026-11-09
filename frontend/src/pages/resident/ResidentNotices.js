import { useEffect, useState } from 'react';

import {
    FaBullhorn,
    FaCalendarAlt,
    FaThumbtack,
    FaSearch,
    FaSyncAlt,
    FaPaperclip
} from 'react-icons/fa';

import ResidentLayout from '../../components/dashboard/ResidentLayout';

import {
    getNotices
} from '../../services/noticeApi';


const ResidentNotices = () => {

    const [notices, setNotices] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');

    const [category, setCategory] = useState('');

    const [error, setError] = useState('');


    const fetchNotices = async () => {

        try {

            setLoading(true);
            setError('');

            const data = await getNotices({
                search,
                category,
                page: 1,
                limit: 100
            });

            setNotices(data.notices || []);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                'Unable to load society notices.'
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        const timer = setTimeout(fetchNotices, 300);

        return () => clearTimeout(timer);

    }, [search, category]);


    return (

        <ResidentLayout>

            <div className="dashboard-heading">

                <div>
                    <h2>Society Notices</h2>
                    <p>Stay updated with important society announcements.</p>
                </div>

                <button
                    className="refresh-button"
                    onClick={fetchNotices}
                >
                    <FaSyncAlt /> Refresh
                </button>

            </div>


            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}


            <div className="notice-toolbar">

                <div className="resident-search">
                    <FaSearch />

                    <input
                        placeholder="Search announcements..."
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

            </div>


            {loading ? (

                <div className="dashboard-loading">
                    Loading society notices...
                </div>

            ) : notices.length === 0 ? (

                <div className="empty-state">
                    <FaBullhorn />
                    <h3>No announcements available</h3>
                    <p>New society notices will appear here.</p>
                </div>

            ) : (

                <div className="resident-notice-list">

                    {notices.map((notice) => (

                        <article
                            className="resident-notice-card"
                            key={notice._id}
                        >

                            <div className="resident-notice-top">

                                <div className="resident-notice-icon">
                                    <FaBullhorn />
                                </div>

                                <div className="resident-notice-title">
                                    <h3>{notice.title}</h3>

                                    <div className="resident-notice-meta">
                                        <span>
                                            <FaCalendarAlt />
                                            {' '}
                                            {new Date(
                                                notice.publishAt
                                            ).toLocaleDateString('en-IN')}
                                        </span>

                                        <span>{notice.category}</span>
                                    </div>
                                </div>

                                {notice.isPinned && (
                                    <FaThumbtack className="notice-pinned-icon" />
                                )}

                            </div>


                            <p className="resident-notice-content">
                                {notice.content}
                            </p>


                            <div className="resident-notice-footer">

                                <span className={`priority-badge ${notice.priority}`}>
                                    {notice.priority}
                                </span>

                                <span className="notice-author">
                                    Published by {notice.createdBy?.fullName || 'Administration'}
                                </span>

                            </div>


                            {notice.attachments?.length > 0 && (

                                <div className="resident-notice-attachments">

                                    <strong>
                                        <FaPaperclip /> Attachments
                                    </strong>

                                    {notice.attachments.map((url, index) => (

                                        <a
                                            key={index}
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View Attachment {index + 1}
                                        </a>

                                    ))}

                                </div>

                            )}

                        </article>

                    ))}

                </div>

            )}

        </ResidentLayout>

    );
};

export default ResidentNotices;