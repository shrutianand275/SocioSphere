const mongoose = require('mongoose');

const votingSchema = new mongoose.Schema({

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

    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000
    },

    category: {
        type: String,
        enum: [
            'general',
            'maintenance',
            'security',
            'events',
            'facilities',
            'other'
        ],
        default: 'general'
    },

    options: [{
        text: {
            type: String,
            required: true,
            trim: true
        },

        votesCount: {
            type: Number,
            default: 0,
            min: 0
        }
    }],

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ['draft', 'active', 'closed'],
        default: 'draft'
    },

    showResults: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

votingSchema.index({
    societyId: 1,
    status: 1,
    startDate: 1
});

module.exports = mongoose.model('Voting', votingSchema);