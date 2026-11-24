const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
            index: true
        },

        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },

        type: {
            type: String,
            enum: [
                'registration',
                'complaint',
                'notice',
                'voting',
                'expense',
                'system'
            ],
            default: 'system'
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        relatedModel: {
            type: String,
            enum: [
                'User',
                'Complaint',
                'Notice',
                'Voting',
                'Expense',
                null
            ],
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Notification history index
notificationSchema.index({
    recipient: 1,
    societyId: 1,
    createdAt: -1
});

// Prevent duplicate notifications for the same event
notificationSchema.index(
    {
        societyId: 1,
        recipient: 1,
        type: 1,
        relatedModel: 1,
        relatedId: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            relatedId: { $type: 'objectId' }
        },
        name: 'unique_notification_per_event'
    }
);

module.exports = mongoose.model(
    'Notification',
    notificationSchema
);