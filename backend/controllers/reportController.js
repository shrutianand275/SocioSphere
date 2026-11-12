const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Voting = require('../models/Voting');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// Society overview
exports.getSocietyOverview = async (req, res) => {
    try {
        const societyId = new mongoose.Types.ObjectId(
            req.user.societyId.toString()
        );

        const [
            totalResidents,
            approvedResidents,
            pendingResidents,
            rejectedResidents,
            totalComplaints,
            totalNotices,
            totalPolls,
            activePolls,
            expenseSummary
        ] = await Promise.all([

            User.countDocuments({
                societyId,
                role: 'resident'
            }),

            User.countDocuments({
                societyId,
                role: 'resident',
                approvalStatus: 'approved'
            }),

            User.countDocuments({
                societyId,
                role: 'resident',
                approvalStatus: 'pending'
            }),

            User.countDocuments({
                societyId,
                role: 'resident',
                approvalStatus: 'rejected'
            }),

            Complaint.countDocuments({ societyId }),

            Notice.countDocuments({ societyId }),

            Voting.countDocuments({ societyId }),

            Voting.countDocuments({
                societyId,
                status: 'active'
            }),

            Expense.aggregate([
                { $match: { societyId } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        totalRecords: { $sum: 1 }
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            overview: {
                residents: {
                    total: totalResidents,
                    approved: approvedResidents,
                    pending: pendingResidents,
                    rejected: rejectedResidents
                },
                complaints: {
                    total: totalComplaints
                },
                notices: {
                    total: totalNotices
                },
                voting: {
                    total: totalPolls,
                    active: activePolls
                },
                expenses: {
                    totalAmount: expenseSummary[0]?.totalAmount || 0,
                    totalRecords: expenseSummary[0]?.totalRecords || 0
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch society overview',
            error: error.message
        });
    }
};


// Complaint analytics
exports.getComplaintAnalytics = async (req, res) => {
    try {
        const societyId = new mongoose.Types.ObjectId(
            req.user.societyId.toString()
        );

        const complaints = await Complaint.aggregate([
            { $match: { societyId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const monthlyComplaints = await Complaint.aggregate([
            { $match: { societyId } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            statusSummary: complaints,
            monthlySummary: monthlyComplaints
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch complaint analytics',
            error: error.message
        });
    }
};


// Expense analytics
exports.getExpenseAnalytics = async (req, res) => {
    try {
        const societyId = new mongoose.Types.ObjectId(
            req.user.societyId.toString()
        );

        const categorySummary = await Expense.aggregate([
            { $match: { societyId } },
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
            { $match: { societyId } },
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

        const total = await Expense.aggregate([
            { $match: { societyId } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    totalRecords: { $sum: 1 },
                    averageAmount: { $avg: '$amount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            overview: total[0] || {
                totalAmount: 0,
                totalRecords: 0,
                averageAmount: 0
            },
            categorySummary,
            monthlySummary
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch expense analytics',
            error: error.message
        });
    }
};


// Voting analytics
exports.getVotingAnalytics = async (req, res) => {
    try {
        const societyId = new mongoose.Types.ObjectId(
            req.user.societyId.toString()
        );

        const polls = await Voting.find({ societyId })
            .select('title status options startDate endDate createdAt');

        const totalPolls = polls.length;

        const activePolls = polls.filter(
            poll => poll.status === 'active'
        ).length;

        const closedPolls = polls.filter(
            poll => poll.status === 'closed'
        ).length;

        const draftPolls = polls.filter(
            poll => poll.status === 'draft'
        ).length;

        const totalVotes = polls.reduce((total, poll) => {
            const pollVotes = poll.options.reduce(
                (sum, option) => sum + (option.votesCount || 0),
                0
            );

            return total + pollVotes;
        }, 0);

        res.status(200).json({
            success: true,
            overview: {
                totalPolls,
                activePolls,
                closedPolls,
                draftPolls,
                totalVotes
            },
            polls
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch voting analytics',
            error: error.message
        });
    }
};


// Resident analytics
exports.getResidentAnalytics = async (req, res) => {
    try {
        const societyId = new mongoose.Types.ObjectId(
            req.user.societyId.toString()
        );

        const residents = await User.aggregate([
            {
                $match: {
                    societyId,
                    role: 'resident'
                }
            },
            {
                $group: {
                    _id: '$approvalStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            residents
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch resident analytics',
            error: error.message
        });
    }
};