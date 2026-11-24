const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Society = require('../models/Society');

const {
    createBulkNotifications,
    createNotification
} = require('../utils/notificationHelper');


// ==========================================
// CREATE COMPLAINT - RESIDENT
// ==========================================

exports.createComplaint = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            priority,
            images
        } = req.body;

        if (
            !title ||
            typeof title !== 'string' ||
            !description ||
            typeof description !== 'string' ||
            !category ||
            typeof category !== 'string'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Title, description and category are required'
            });
        }

        if (!req.user.societyId) {
            return res.status(400).json({
                success: false,
                message: 'User is not associated with any society'
            });
        }

        // Get society-specific complaint categories
        const society = await Society.findById(req.user.societyId);

        if (!society) {
            return res.status(404).json({
                success: false,
                message: 'Society not found'
            });
        }

        const allowedCategories = society.complaintCategories || [];

        // Case-insensitive category validation
        const selectedCategory = allowedCategories.find(
            item =>
                item.toLowerCase() === category.trim().toLowerCase()
        );

        if (!selectedCategory) {
            return res.status(400).json({
                success: false,
                message: 'Invalid complaint category. Please select an available category.'
            });
        }

        // Validate priority
        const allowedPriorities = [
            'low',
            'medium',
            'high',
            'urgent'
        ];

        if (
            priority &&
            !allowedPriorities.includes(priority)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid complaint priority'
            });
        }

        // Validate images
        if (
            images !== undefined &&
            (
                !Array.isArray(images) ||
                images.length > 5 ||
                !images.every(image => typeof image === 'string')
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'Images must be an array of up to 5 image URLs'
            });
        }

        // Create complaint
        const complaint = await Complaint.create({
            societyId: req.user.societyId,
            residentId: req.user._id,
            title: title.trim(),
            description: description.trim(),
            category: selectedCategory,
            priority: priority || 'medium',
            images: images || [],
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                remarks: 'Complaint submitted',
                updatedBy: req.user._id
            }]
        });

        // Notify society admins about new complaint
        try {
            const admins = await User.find({
                societyId: req.user.societyId,
                role: 'admin',
                isActive: true
            }).select('_id');

            if (admins.length > 0) {
                await createBulkNotifications({
                    societyId: req.user.societyId,
                    recipients: admins.map(admin => admin._id),
                    title: 'New Complaint Submitted',
                    message: `${req.user.fullName} submitted a complaint: ${complaint.title}`,
                    type: 'complaint',
                    relatedId: complaint._id,
                    relatedModel: 'Complaint'
                });
            }
        } catch (notificationError) {
            console.error(
                'Complaint Notification Error:',
                notificationError
            );
        }

        return res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint
        });

    } catch (error) {
        console.error('Create Complaint Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to submit complaint'
        });
    }
};


// ==========================================
// GET COMPLAINTS
// ADMIN: ALL SOCIETY COMPLAINTS
// RESIDENT: OWN COMPLAINTS
// ==========================================

exports.getComplaints = async (req, res) => {
    try {
        const {
            status,
            category,
            priority,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {
            societyId: req.user.societyId
        };

        // Residents can only see their own complaints
        if (req.user.role === 'resident') {
            filter.residentId = req.user._id;
        }

        // Status filter
        if (
            status &&
            ['pending', 'in-progress', 'resolved', 'rejected'].includes(status)
        ) {
            filter.status = status;
        }

        // Dynamic category filter
        if (category && typeof category === 'string') {
            filter.category = category;
        }

        // Priority filter
        if (
            priority &&
            ['low', 'medium', 'high', 'urgent'].includes(priority)
        ) {
            filter.priority = priority;
        }

        // Search filter
        if (search && typeof search === 'string') {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            );

            filter.$or = [
                {
                    title: {
                        $regex: escapedSearch,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex: escapedSearch,
                        $options: 'i'
                    }
                }
            ];
        }

        // Pagination
        const currentPage = Math.max(
            1,
            Number(page) || 1
        );

        const pageLimit = Math.min(
            100,
            Math.max(1, Number(limit) || 10)
        );

        const skip = (currentPage - 1) * pageLimit;

        const [complaints, total] = await Promise.all([

            Complaint.find(filter)
                .populate(
                    'residentId',
                    'fullName email phone flatNumber'
                )
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit),

            Complaint.countDocuments(filter)

        ]);

        return res.status(200).json({
            success: true,
            complaints,
            pagination: {
                total,
                currentPage,
                totalPages: Math.ceil(total / pageLimit),
                pageLimit
            }
        });

    } catch (error) {
        console.error('Get Complaints Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints'
        });
    }
};


// ==========================================
// GET SINGLE COMPLAINT
// ==========================================

exports.getComplaintById = async (req, res) => {
    try {
        const filter = {
            _id: req.params.id,
            societyId: req.user.societyId
        };

        if (req.user.role === 'resident') {
            filter.residentId = req.user._id;
        }

        const complaint = await Complaint.findOne(filter)
            .populate(
                'residentId',
                'fullName email phone flatNumber'
            )
            .populate(
                'statusHistory.updatedBy',
                'fullName role'
            );

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        return res.status(200).json({
            success: true,
            complaint
        });

    } catch (error) {
        console.error('Get Complaint Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint'
        });
    }
};


// ==========================================
// UPDATE COMPLAINT STATUS - ADMIN
// ==========================================

exports.updateComplaintStatus = async (req, res) => {
    try {
        const {
            status,
            remarks
        } = req.body;

        const allowedStatuses = [
            'pending',
            'in-progress',
            'resolved',
            'rejected'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid complaint status'
            });
        }

        const complaint = await Complaint.findOne({
            _id: req.params.id,
            societyId: req.user.societyId
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        complaint.status = status;

        if (remarks !== undefined) {
            complaint.resolutionNotes = remarks;
        }

        complaint.resolvedAt =
            status === 'resolved' ? new Date() : null;

        complaint.statusHistory.push({
            status,
            remarks: remarks || `Status changed to ${status}`,
            updatedBy: req.user._id
        });

        await complaint.save();

        // Notify resident about complaint status update
        try {
            await createNotification({
                societyId: complaint.societyId,
                recipient: complaint.residentId,
                title: 'Complaint Status Updated',
                message: `Your complaint "${complaint.title}" status has been changed to ${status}.`,
                type: 'complaint',
                relatedId: complaint._id,
                relatedModel: 'Complaint'
            });
        } catch (notificationError) {
            console.error(
                'Complaint Status Notification Error:',
                notificationError
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Complaint status updated successfully',
            complaint
        });

    } catch (error) {
        console.error('Update Complaint Status Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update complaint status'
        });
    }
};


// ==========================================
// ASSIGN COMPLAINT - ADMIN
// ==========================================

exports.assignComplaint = async (req, res) => {
    try {
        const { assignedTo } = req.body;

        if (
            typeof assignedTo !== 'string' ||
            !assignedTo.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Assignee or department name is required'
            });
        }

        const complaint = await Complaint.findOne({
            _id: req.params.id,
            societyId: req.user.societyId
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        complaint.assignedTo = assignedTo.trim();

        await complaint.save();

        return res.status(200).json({
            success: true,
            message: 'Complaint assigned successfully',
            complaint
        });

    } catch (error) {
        console.error('Assign Complaint Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to assign complaint'
        });
    }
};


// ==========================================
// COMPLAINT STATISTICS - ADMIN
// ==========================================

exports.getComplaintStats = async (req, res) => {
    try {
        const societyId = req.user.societyId;

        const [
            total,
            pending,
            inProgress,
            resolved,
            rejected,
            urgent
        ] = await Promise.all([

            Complaint.countDocuments({ societyId }),

            Complaint.countDocuments({
                societyId,
                status: 'pending'
            }),

            Complaint.countDocuments({
                societyId,
                status: 'in-progress'
            }),

            Complaint.countDocuments({
                societyId,
                status: 'resolved'
            }),

            Complaint.countDocuments({
                societyId,
                status: 'rejected'
            }),

            Complaint.countDocuments({
                societyId,
                priority: 'urgent',
                status: {
                    $nin: ['resolved', 'rejected']
                }
            })

        ]);

        return res.status(200).json({
            success: true,
            stats: {
                total,
                pending,
                inProgress,
                resolved,
                rejected,
                urgent
            }
        });

    } catch (error) {
        console.error('Complaint Stats Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint statistics'
        });
    }
};