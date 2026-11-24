const Notification = require('../models/Notification');

// Get notifications of logged-in user
exports.getNotifications = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit, 10) || 20)
        );

        const filter = {
            recipient: req.user._id,
            societyId: req.user.societyId
        };

        if (req.query.read === 'true') {
            filter.isRead = true;
        } else if (req.query.read === 'false') {
            filter.isRead = false;
        }

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),

            Notification.countDocuments(filter),

            Notification.countDocuments({
                recipient: req.user._id,
                societyId: req.user.societyId,
                isRead: false
            })
        ]);

        res.status(200).json({
            success: true,
            notifications,
            unreadCount,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to fetch notifications',
            error: error.message
        });
    }
};


// Get unread notification count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            societyId: req.user.societyId,
            isRead: false
        });

        res.status(200).json({
            success: true,
            unreadCount: count
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to fetch unread count',
            error: error.message
        });
    }
};


// Mark one notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                recipient: req.user._id,
                societyId: req.user.societyId
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            },
            {
                new: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to update notification',
            error: error.message
        });
    }
};


// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                recipient: req.user._id,
                societyId: req.user.societyId,
                isRead: false
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to update notifications',
            error: error.message
        });
    }
};


// Delete one notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user._id,
            societyId: req.user.societyId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to delete notification',
            error: error.message
        });
    }
};