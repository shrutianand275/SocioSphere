const Expense = require('../models/Expense');
const Society = require('../models/Society');
const mongoose = require('mongoose');


const validateExpenseCategory = async (societyId, category) => {
    const society = await Society.findById(societyId);

    if (!society) {
        return {
            valid: false,
            message: 'Society not found'
        };
    }

    if (!category || typeof category !== 'string') {
        return {
            valid: false,
            message: 'Valid expense category is required'
        };
    }

    const selectedCategory = (society.expenseCategories || []).find(
        item => item.toLowerCase() === category.trim().toLowerCase()
    );

    if (!selectedCategory) {
        return {
            valid: false,
            message: 'Invalid expense category. Please select a category configured in Society Settings.'
        };
    }

    return {
        valid: true,
        category: selectedCategory
    };
};


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

        if (search && typeof search === 'string') {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            );

            filter.$or = [
                { title: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } },
                { vendor: { $regex: escapedSearch, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            filter.expenseDate = {};

            if (startDate) {
                const start = new Date(startDate);

                if (Number.isNaN(start.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid start date'
                    });
                }

                filter.expenseDate.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                if (Number.isNaN(end.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid end date'
                    });
                }

                end.setHours(23, 59, 59, 999);
                filter.expenseDate.$lte = end;
            }
        }

        const currentPage = Math.max(
            1,
            parseInt(page, 10) || 1
        );

        const perPage = Math.min(
            100,
            Math.max(1, parseInt(limit, 10) || 10)
        );

        const total = await Expense.countDocuments(filter);

        const expenses = await Expense.find(filter)
            .populate('createdBy', 'fullName')
            .sort({
                expenseDate: -1,
                createdAt: -1
            })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        return res.status(200).json({
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
        console.error('Get Expenses Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch expenses',
            error: error.message
        });
    }
};


// ==========================================
// GET EXPENSE SUMMARY
// ==========================================

exports.getExpenseStats = async (req, res) => {
    try {
        const societyId = new mongoose.Types.ObjectId(
            req.user.societyId.toString()
        );

        const summary = await Expense.aggregate([
            {
                $match: { societyId }
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
                $match: { societyId }
            },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);

        const monthlySummary = await Expense.aggregate([
            {
                $match: { societyId }
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
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1
                }
            }
        ]);

        return res.status(200).json({
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
        console.error('Get Expense Stats Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch expense statistics',
            error: error.message
        });
    }
};


// ==========================================
// GET SINGLE EXPENSE
// ==========================================

exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            societyId: req.user.societyId
        }).populate('createdBy', 'fullName');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        return res.status(200).json({
            success: true,
            expense
        });

    } catch (error) {
        console.error('Get Expense Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch expense',
            error: error.message
        });
    }
};


// ==========================================
// CREATE EXPENSE - ADMIN ONLY
// ==========================================

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
            typeof title !== 'string' ||
            !category ||
            amount === undefined ||
            !expenseDate
        ) {
            return res.status(400).json({
                success: false,
                message: 'Title, category, amount and expense date are required'
            });
        }

        if (
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a valid number greater than zero'
            });
        }

        const parsedDate = new Date(expenseDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense date'
            });
        }

        // Validate category using Society Settings
        const categoryResult = await validateExpenseCategory(
            req.user.societyId,
            category
        );

        if (!categoryResult.valid) {
            return res.status(400).json({
                success: false,
                message: categoryResult.message
            });
        }

        const expense = await Expense.create({
            societyId: req.user.societyId,
            title: title.trim(),
            description,
            category: categoryResult.category,
            amount: Number(amount),
            vendor,
            expenseDate: parsedDate,
            receiptUrl,
            createdBy: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: 'Expense added successfully',
            expense
        });

    } catch (error) {
        console.error('Create Expense Error:', error);

        return res.status(400).json({
            success: false,
            message: 'Failed to create expense',
            error: error.message
        });
    }
};


// ==========================================
// UPDATE EXPENSE - ADMIN ONLY
// ==========================================

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

        const expense = await Expense.findOne({
            _id: req.params.id,
            societyId: req.user.societyId
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Validate category only if it is being changed.
        // This allows old expenses to remain editable even if
        // their category was removed from Society Settings.

        if (updates.category !== undefined) {
            if (
                typeof updates.category !== 'string' ||
                !updates.category.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid expense category is required'
                });
            }

            if (
                updates.category.trim().toLowerCase() ===
                expense.category.toLowerCase()
            ) {
                updates.category = expense.category;
            } else {
                const categoryResult = await validateExpenseCategory(
                    req.user.societyId,
                    updates.category
                );

                if (!categoryResult.valid) {
                    return res.status(400).json({
                        success: false,
                        message: categoryResult.message
                    });
                }

                updates.category = categoryResult.category;
            }
        }

        if (
            updates.amount !== undefined &&
            (
                !Number.isFinite(Number(updates.amount)) ||
                Number(updates.amount) <= 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a valid number greater than zero'
            });
        }

        if (updates.amount !== undefined) {
            updates.amount = Number(updates.amount);
        }

        if (updates.expenseDate !== undefined) {
            const parsedDate = new Date(updates.expenseDate);

            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid expense date'
                });
            }

            updates.expenseDate = parsedDate;
        }

        if (updates.title !== undefined) {
            if (
                typeof updates.title !== 'string' ||
                !updates.title.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Expense title is required'
                });
            }

            updates.title = updates.title.trim();
        }

        Object.assign(expense, updates);

        await expense.save();

        return res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            expense
        });

    } catch (error) {
        console.error('Update Expense Error:', error);

        return res.status(400).json({
            success: false,
            message: 'Failed to update expense',
            error: error.message
        });
    }
};


// ==========================================
// DELETE EXPENSE - ADMIN ONLY
// ==========================================

exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            societyId: req.user.societyId
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });

    } catch (error) {
        console.error('Delete Expense Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to delete expense',
            error: error.message
        });
    }
};