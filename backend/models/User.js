const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        flatNumber: {
            type: String,
            required: true
        },

        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true
        },

        role: {
            type: String,
            enum: ['resident', 'admin', 'staff'],
            default: 'resident'
        },

        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);