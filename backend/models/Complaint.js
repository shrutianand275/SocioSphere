const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        required: true
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });


const complaintSchema = new mongoose.Schema({

    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true,
        index: true
    },

    residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },

    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },

    category: {
        type: String,
        enum: [
            'plumbing',
            'electrical',
            'cleaning',
            'security',
            'lift',
            'parking',
            'water',
            'maintenance',
            'other'
        ],
        required: true
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },

    images: [{
        type: String
    }],

    assignedTo: {
        type: String,
        trim: true,
        default: ''
    },

    resolutionNotes: {
        type: String,
        trim: true,
        default: ''
    },

    statusHistory: [statusHistorySchema],

    resolvedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

complaintSchema.index({ societyId: 1, status: 1 });
complaintSchema.index({ residentId: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);