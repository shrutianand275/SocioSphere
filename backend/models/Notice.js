const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({

    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true,
        index: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },

    category: {
        type: String,
        enum: [
            'general',
            'maintenance',
            'events',
            'emergency',
            'meetings',
            'security',
            'other'
        ],
        default: 'general'
    },

    priority: {
        type: String,
        enum: ['normal', 'important', 'urgent'],
        default: 'normal'
    },

    attachments: [{
        type: String
    }],

    isPinned: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },

    publishAt: {
        type: Date,
        default: Date.now
    },

    expiresAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

noticeSchema.index({
    societyId: 1,
    status: 1,
    publishAt: -1
});

module.exports = mongoose.model('Notice', noticeSchema);