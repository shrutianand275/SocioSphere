const User = require('../models/User');

// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================

exports.getDashboardStats = async (req, res) => {
    try {
        const societyId = req.user.societyId;

        const [
            totalResidents,
            approvedResidents,
            pendingResidents,
            rejectedResidents,
            activeResidents
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

            User.countDocuments({
                societyId,
                role: 'resident',
                isActive: true,
                approvalStatus: 'approved'
            })
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalResidents,
                approvedResidents,
                pendingResidents,
                rejectedResidents,
                activeResidents
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
};


// ==========================================
// GET ALL RESIDENTS
// ==========================================

exports.getAllResidents = async (req, res) => {
    try {
        const societyId = req.user.societyId;

        const {
            status,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {
            societyId,
            role: 'resident'
        };

        // Filter by approval status
        if (
            status &&
            ['pending', 'approved', 'rejected'].includes(status)
        ) {
            filter.approvalStatus = status;
        }

        // Search residents
        if (search) {
            filter.$or = [
                {
                    fullName: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    flatNumber: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    phone: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ];
        }

        const currentPage = Math.max(1, Number(page) || 1);
        const pageLimit = Math.min(
            100,
            Math.max(1, Number(limit) || 10)
        );

        const skip = (currentPage - 1) * pageLimit;

        const [residents, totalResidents] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit),

            User.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            residents,
            pagination: {
                totalResidents,
                currentPage,
                totalPages: Math.ceil(totalResidents / pageLimit),
                pageLimit
            }
        });

    } catch (error) {
        console.error('Get Residents Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch residents'
        });
    }
};


// ==========================================
// APPROVE RESIDENT
// ==========================================

exports.approveResident = async (req, res) => {
    try {
        const resident = await User.findOne({
            _id: req.params.id,
            societyId: req.user.societyId,
            role: 'resident'
        });

        if (!resident) {
            return res.status(404).json({
                success: false,
                message: 'Resident not found'
            });
        }

        if (resident.approvalStatus === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Resident is already approved'
            });
        }

        resident.approvalStatus = 'approved';
        resident.isActive = true;

        await resident.save();

        res.status(200).json({
            success: true,
            message: 'Resident approved successfully',
            resident
        });

    } catch (error) {
        console.error('Approve Resident Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to approve resident'
        });
    }
};


// ==========================================
// REJECT RESIDENT
// ==========================================

exports.rejectResident = async (req, res) => {
    try {
        const resident = await User.findOne({
            _id: req.params.id,
            societyId: req.user.societyId,
            role: 'resident'
        });

        if (!resident) {
            return res.status(404).json({
                success: false,
                message: 'Resident not found'
            });
        }

        resident.approvalStatus = 'rejected';

        await resident.save();

        res.status(200).json({
            success: true,
            message: 'Resident rejected successfully',
            resident
        });

    } catch (error) {
        console.error('Reject Resident Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to reject resident'
        });
    }
};


// ==========================================
// ACTIVATE / DEACTIVATE RESIDENT
// ==========================================

exports.toggleResidentStatus = async (req, res) => {
    try {
        const resident = await User.findOne({
            _id: req.params.id,
            societyId: req.user.societyId,
            role: 'resident'
        });

        if (!resident) {
            return res.status(404).json({
                success: false,
                message: 'Resident not found'
            });
        }

        resident.isActive = !resident.isActive;

        await resident.save();

        res.status(200).json({
            success: true,
            message: resident.isActive
                ? 'Resident activated successfully'
                : 'Resident deactivated successfully',
            resident
        });

    } catch (error) {
        console.error('Toggle Resident Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update resident status'
        });
    }
};