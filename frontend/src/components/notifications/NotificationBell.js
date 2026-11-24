import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';
import './NotificationBell.css';

function NotificationBell() {
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchingRef = useRef(false);

    // Determine current user role from current dashboard
    const isAdmin = location.pathname.startsWith('/admin');

    // Remove duplicate notification IDs
    const removeDuplicates = (items) => {
        const uniqueNotifications = new Map();

        items.forEach((notification) => {
            if (notification?._id) {
                uniqueNotifications.set(
                    notification._id,
                    notification
                );
            }
        });

        return Array.from(uniqueNotifications.values());
    };

    // Fetch notifications
    const fetchNotifications = useCallback(async (showLoader = false) => {

        if (fetchingRef.current) return;

        fetchingRef.current = true;

        if (showLoader) {
            setLoading(true);
        }

        try {
            const response = await API.get('/notifications');

            if (response.data.success) {

                const notificationList = removeDuplicates(
                    response.data.notifications || []
                );

                setNotifications(notificationList);

                setUnreadCount(
                    Number(response.data.unreadCount) || 0
                );

                setError('');
            }

        } catch (err) {

            console.error('Notification Fetch Error:', err);

            setError(
                err.response?.data?.message ||
                'Unable to load notifications. Please try again.'
            );

        } finally {

            fetchingRef.current = false;
            setLoading(false);
        }

    }, []);

    // Initial fetch and automatic refresh
    useEffect(() => {

        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);

    }, [fetchNotifications]);

    // Mark one notification as read
    const markAsRead = async (id) => {

        const previousNotifications = notifications;
        const previousCount = unreadCount;

        const selectedNotification = notifications.find(
            item => item._id === id
        );

        if (!selectedNotification || selectedNotification.isRead) {
            return;
        }

        // Optimistic update
        setNotifications(previous =>
            previous.map(item =>
                item._id === id
                    ? { ...item, isRead: true }
                    : item
            )
        );

        setUnreadCount(previous =>
            Math.max(0, previous - 1)
        );

        try {

            await API.patch(`/notifications/${id}/read`);

            await fetchNotifications();

        } catch (err) {

            console.error('Mark Notification Read Error:', err);

            // Restore previous state
            setNotifications(previousNotifications);
            setUnreadCount(previousCount);

            setError('Unable to mark notification as read.');
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {

        if (unreadCount === 0) return;

        try {

            setLoading(true);

            await API.patch('/notifications/mark-all-read');

            setNotifications(previous =>
                previous.map(item => ({
                    ...item,
                    isRead: true
                }))
            );

            setUnreadCount(0);

            await fetchNotifications();

        } catch (err) {

            console.error('Mark All Read Error:', err);

            setError('Unable to mark all notifications as read.');

            await fetchNotifications();

        } finally {

            setLoading(false);
        }
    };

    // Delete notification
    const deleteNotification = async (id) => {

        const previousNotifications = notifications;
        const previousCount = unreadCount;

        const selectedNotification = notifications.find(
            item => item._id === id
        );

        // Optimistic update
        setNotifications(previous =>
            previous.filter(item => item._id !== id)
        );

        if (selectedNotification && !selectedNotification.isRead) {
            setUnreadCount(previous => Math.max(0, previous - 1));
        }

        try {

            await API.delete(`/notifications/${id}`);

            await fetchNotifications();

        } catch (err) {

            console.error('Delete Notification Error:', err);

            setNotifications(previousNotifications);
            setUnreadCount(previousCount);

            setError('Unable to delete notification.');
        }
    };

    // Navigate according to notification type
    const getNotificationPath = (notification) => {

        const prefix = isAdmin ? '/admin' : '/resident';

        switch (notification.type) {

            case 'complaint':
                return `${prefix}/complaints`;

            case 'notice':
                return isAdmin
                    ? '/admin/notices'
                    : '/resident/notices';

            case 'voting':
                return `${prefix}/voting`;

            case 'registration':
                return '/admin/residents';

            case 'expense':
                return isAdmin
                    ? '/admin/expenses'
                    : '/resident/expenses';

            default:
                return null;
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification) => {

        const targetPath = getNotificationPath(notification);

        if (!targetPath) {
            return;
        }

        // Mark as read before navigation
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }

        setIsOpen(false);

        navigate(targetPath);
    };

    // Format notification date
    const formatDate = (date) => {

        const notificationDate = new Date(date);

        if (Number.isNaN(notificationDate.getTime())) {
            return '';
        }

        const now = new Date();

        const difference = Math.max(
            0,
            Math.floor((now - notificationDate) / 1000)
        );

        if (difference < 60) return 'Just now';

        if (difference < 3600) {
            return `${Math.floor(difference / 60)} min ago`;
        }

        if (difference < 86400) {
            return `${Math.floor(difference / 3600)} hours ago`;
        }

        return notificationDate.toLocaleDateString();
    };

    // Notification icon
    const getNotificationIcon = (type) => {

        switch (type) {

            case 'complaint':
                return 'bi bi-exclamation-circle';

            case 'notice':
                return 'bi bi-megaphone';

            case 'registration':
                return 'bi bi-person-plus';

            case 'voting':
                return 'bi bi-check2-square';

            case 'expense':
                return 'bi bi-wallet2';

            default:
                return 'bi bi-info-circle';
        }
    };

    return (

        <div className="notification-wrapper">

            {/* Notification Bell */}
            <button
                className="notification-bell"
                onClick={() => {
                    setIsOpen(previous => !previous);
                    setError('');
                }}
                aria-label="Notifications"
                aria-expanded={isOpen}
            >

                <i className="bi bi-bell"></i>

                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

            </button>

            {isOpen && (

                <>

                    <div
                        className="notification-overlay"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    <div className="notification-dropdown">

                        {/* Header */}
                        <div className="notification-header">

                            <div>
                                <h5>Notifications</h5>

                                <span>
                                    {unreadCount} unread notifications
                                </span>
                            </div>

                            <button
                                className="notification-close"
                                onClick={() => setIsOpen(false)}
                            >
                                ×
                            </button>

                        </div>

                        {/* Mark All Read */}
                        {unreadCount > 0 && (

                            <button
                                className="mark-all-read"
                                onClick={markAllAsRead}
                                disabled={loading}
                            >
                                {loading
                                    ? 'Please wait...'
                                    : 'Mark all as read'}
                            </button>

                        )}

                        {/* Error Message */}
                        {error && (

                            <div className="notification-error">

                                <span>{error}</span>

                                <button
                                    onClick={() => fetchNotifications(true)}
                                >
                                    Retry
                                </button>

                            </div>

                        )}

                        {/* Notification List */}
                        <div className="notification-list">

                            {loading && notifications.length === 0 ? (

                                <div className="notification-empty">
                                    Loading notifications...
                                </div>

                            ) : notifications.length === 0 ? (

                                <div className="notification-empty">

                                    <i className="bi bi-bell-slash"></i>

                                    <h6>No notifications yet</h6>

                                    <p>You're all caught up!</p>

                                </div>

                            ) : (

                                notifications.map((notification) => (

                                    <div
                                        key={notification._id}
                                        className={`notification-item ${
                                            !notification.isRead ? 'unread' : ''
                                        }`}
                                    >

                                        {/* Icon */}
                                        <div className="notification-icon">

                                            <i className={getNotificationIcon(
                                                notification.type
                                            )}></i>

                                        </div>

                                        {/* Content - Click to Navigate */}
                                        <div
                                            className="notification-content"
                                            onClick={() =>
                                                handleNotificationClick(notification)
                                            }
                                            role="button"
                                            tabIndex={0}
                                            title="Click to open"
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === 'Enter' ||
                                                    event.key === ' '
                                                ) {
                                                    event.preventDefault();
                                                    handleNotificationClick(notification);
                                                }
                                            }}
                                        >

                                            <h6>{notification.title}</h6>

                                            <p>{notification.message}</p>

                                            <span>
                                                {formatDate(notification.createdAt)}
                                            </span>

                                        </div>

                                        {/* Actions */}
                                        <div className="notification-actions">

                                            {!notification.isRead && (

                                                <button
                                                    title="Mark as read"
                                                    onClick={() =>
                                                        markAsRead(notification._id)
                                                    }
                                                >
                                                    <i className="bi bi-check2"></i>
                                                </button>

                                            )}

                                            <button
                                                title="Delete notification"
                                                onClick={() =>
                                                    deleteNotification(notification._id)
                                                }
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>

                                        </div>

                                    </div>

                                ))

                            )}

                        </div>

                        {/* Footer */}
                        <div className="notification-footer">

                            <button
                                onClick={() => fetchNotifications(true)}
                                disabled={loading}
                            >

                                <i className="bi bi-arrow-clockwise"></i>

                                Refresh notifications

                            </button>

                        </div>

                    </div>

                </>

            )}

        </div>

    );
}

export default NotificationBell;