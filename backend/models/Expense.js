const mongoose = require('mongoose');
const expenseSchema = new mongoose.Schema(
    {
        societyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Society',
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000
        },

        // Dynamic category - validated through Society Settings
        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        amount: {
            type: Number,
            required: true,
            min: 0.01
        },

        vendor: {
            type: String,
            trim: true
        },

        expenseDate: {
            type: Date,
            required: true
        },

        receiptUrl: {
            type: String,
            trim: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

expenseSchema.index({ societyId: 1, expenseDate: -1 });
expenseSchema.index({ societyId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);