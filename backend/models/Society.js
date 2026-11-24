const mongoose = require('mongoose');

const societySchema = new mongoose.Schema(
    {
        societyName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        societyCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        registrationNumber: {
            type: String,
            trim: true,
            default: ''
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        pincode: {
            type: String,
            trim: true,
            default: ''
        },

        contactEmail: {
            type: String,
            lowercase: true,
            trim: true,
            default: ''
        },

        contactPhone: {
            type: String,
            trim: true,
            default: ''
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ''
        },

        establishedYear: {
            type: Number,
            min: 1800,
            max: 2100,
            default: null
        },

        complaintCategories: {
            type: [String],
            default: [
                'Water Supply',
                'Electricity',
                'Cleaning',
                'Security',
                'Lift',
                'Parking',
                'Noise',
                'Maintenance',
                'Other'
            ]
        },

        expenseCategories: {
            type: [String],
            default: [
                'Maintenance',
                'Security',
                'Electricity',
                'Water',
                'Cleaning',
                'Repair',
                'Gardening',
                'Staff Salary',
                'Lift Maintenance',
                'Other'
            ]
        },

        // Emergency Information
        emergencyInformation: {
            policeNumber: {
                type: String,
                trim: true,
                default: ''
            },

            ambulanceNumber: {
                type: String,
                trim: true,
                default: ''
            },

            fireBrigadeNumber: {
                type: String,
                trim: true,
                default: ''
            },

            nearestHospitalName: {
                type: String,
                trim: true,
                default: ''
            },

            nearestHospitalAddress: {
                type: String,
                trim: true,
                default: ''
            },

            nearestHospitalPhone: {
                type: String,
                trim: true,
                default: ''
            },

            societyEmergencyContact: {
                type: String,
                trim: true,
                default: ''
            },

            maintenanceEmergencyContact: {
                type: String,
                trim: true,
                default: ''
            }
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