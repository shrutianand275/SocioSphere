const mongoose = require('mongoose');

const societySchema = new mongoose.Schema(
    {
        societyName: {
            type: String,
            required: true,
            trim: true
        },

        societyCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        address: {
            type: String,
            required: true
        },

        city: {
            type: String,
            required: true
        },

        state: {
            type: String,
            required: true
        },

        contactEmail: {
            type: String,
            lowercase: true,
            trim: true
        },

        contactPhone: {
            type: String
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

module.exports = mongoose.model('Society', societySchema);