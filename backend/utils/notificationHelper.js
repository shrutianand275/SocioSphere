const Notification = require('../models/Notification');

exports.createNotification = async ({
    societyId,
    recipient,
    title,
    message,
    type = 'system',
    relatedId = null,
    relatedModel = null
}) => {
    try {

        if (!societyId || !recipient || !title || !message) {
            throw new Error('Required notification information is missing');
        }

        const notificationData = {
            societyId,
            recipient,
            title,
            message,
            type,
            relatedId,
            relatedModel
        };

        // Notifications without relatedId are not deduplicated
        if (!relatedId) {
            return await Notification.create(notificationData);
        }

        // Create only if this event notification does not exist
        const notification = await Notification.findOneAndUpdate(
            {
                societyId,
                recipient,
                type,
                relatedModel,
                relatedId
            },
            {
                $setOnInsert: notificationData
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return notification;

    } catch (error) {

        // Handle simultaneous duplicate creation
        if (error.code === 11000) {

            return await Notification.findOne({
                societyId,
                recipient,
                type,
                relatedModel,
                relatedId
            });
        }

        console.error(
            'Notification creation failed:',
            error.message
        );

        throw error;
    }
};


// ==========================================
// CREATE BULK NOTIFICATIONS
// ==========================================

exports.createBulkNotifications = async ({
    societyId,
    recipients = [],
    title,
    message,
    type = 'system',
    relatedId = null,
    relatedModel = null
}) => {
    try {

        if (!societyId || !title || !message) {
            throw new Error('Required notification information is missing');
        }

        if (!Array.isArray(recipients)) {
            throw new Error('Recipients must be an array');
        }

        // Remove duplicate recipient IDs
        const uniqueRecipients = [
            ...new Set(
                recipients
                    .filter(Boolean)
                    .map(id => id.toString())
            )
        ];

        if (uniqueRecipients.length === 0) {
            return [];
        }

        const notifications = uniqueRecipients.map(recipient => ({
            societyId,
            recipient,
            title,
            message,
            type,
            relatedId,
            relatedModel
        }));

        // Without relatedId, create independent notifications
        if (!relatedId) {

            return await Notification.insertMany(notifications);
        }

        // Upsert prevents duplicate event notifications
        const operations = notifications.map(notification => ({

            updateOne: {

                filter: {
                    societyId: notification.societyId,
                    recipient: notification.recipient,
                    type: notification.type,
                    relatedModel: notification.relatedModel,
                    relatedId: notification.relatedId
                },

                update: {
                    $setOnInsert: notification
                },

                upsert: true

            }

        }));

        await Notification.bulkWrite(
            operations,
            { ordered: false }
        );

        // Return existing and newly created notifications
        return await Notification.find({
            societyId,
            recipient: { $in: uniqueRecipients },
            type,
            relatedModel,
            relatedId
        });

    } catch (error) {

        console.error(
            'Bulk notification failed:',
            error.message
        );

        throw error;
    }
};