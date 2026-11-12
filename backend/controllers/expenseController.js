const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// Get all expenses
exports.getExpenses = async (req, res) => {
    try {
        const {
            search,
            category,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {
            societyId: req.user.societyId
        };

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { vendor: { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            filter.expenseDate = {};

            if (startDate) {
                const start = new Date(startDate);
                if (Number.isNaN(start.getTime())) {
                    return res.status(400).json({
                        message: 'Invalid start date'
                    });
                }
                filter.expenseDate.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);
                if (Number.isNaN(end.getTime())) {
                    return res.status(400).json({
                        message: 'Invalid end date'
                    });
                }
                end.setHours(23, 59, 59, 999);
                filter.expenseDate.$lte = end;
            }
        }

        const currentPage = Math.max(1, parseInt(page, 10) || 1);
        const perPage = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

        const total = await Expense.countDocuments(filter);

        const expenses = await Expense.find(filter)
            .populate('createdBy', 'fullName')
            .sort({ expenseDate: -1, createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            success: true,
            expenses,
            pagination: {
                total,
                page: currentPage,
                limit: perPage,
                totalPages: Math.ceil(total / perPage)
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch expenses',
            error: error.message
        });
    }
};


// Get expense summary
exports.getExpenseStats = async (req, res) => {
    try {
        const societyId = req.user.societyId;

        const summary = await Expense.aggregate([
            {
                $match: {
                    societyId: new mongoose.Types.ObjectId(
                        societyId.toString()
                    )
                }
            },
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: '$amount' },
                    totalRecords: { $sum: 1 },
                    averageExpense: { $avg: '$amount' }
                }
            }
        ]);

        const categorySummary = await Expense.aggregate([
            {
                $match: {
                    societyId: new mongoose.Types.ObjectId(
                        societyId.toString()
                    )
                }
            },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        const monthlySummary = await Expense.aggregate([
            {
                $match: {
                    societyId: new mongoose.Types.ObjectId(
                        societyId.toString()
                    )
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$expenseDate' },
                        month: { $month: '$expenseDate' }
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            overview: summary[0] || {
                totalExpenses: 0,
                totalRecords: 0,
                averageExpense: 0
            },
            categorySummary,
            monthlySummary
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch expense statistics',
            error: error.message
        });
    }
};


// Get single expense
exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            societyId: req.user.societyId
        }).populate('createdBy', 'fullName');

        if (!expense) {
            return res.status(404).json({
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            expense
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch expense',
            error: error.message
        });
    }
};


// Create expense - Admin only
exports.createExpense = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            amount,
            vendor,
            expenseDate,
            receiptUrl
        } = req.body;

        if (
            !title ||
            !category ||
            amount === undefined ||
            !expenseDate
        ) {
            return res.status(400).json({
                message: 'Title, category, amount and expense date are required'
            });
        }

        const expense = await Expense.create({
            societyId: req.user.societyId,
            title,
            description,
            category,
            amount,
            vendor,
            expenseDate,
            receiptUrl,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Expense added successfully',
            expense
        });
    } catch (error) {
        res.status(400).json({
            message: 'Failed to create expense',
            error: error.message
        });
    }
};


// Update expense - Admin only
exports.updateExpense = async (req, res) => {
    try {
        const allowedFields = [
            'title',
            'description',
            'category',
            'amount',
            'vendor',
            'expenseDate',
            'receiptUrl'
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const expense = await Expense.findOneAndUpdate(
            {
                _id: req.params.id,
                societyId: req.user.societyId
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!expense) {
            return res.status(404).json({
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            expense
        });
    } catch (error) {
        res.status(400).json({
            message: 'Failed to update expense',
            error: error.message
        });
    }
};


// Delete expense - Admin only
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            societyId: req.user.societyId
        });

        if (!expense) {
            return res.status(404).json({
                message: 'Expense not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete expense',
            error: error.message
        });
    }
};