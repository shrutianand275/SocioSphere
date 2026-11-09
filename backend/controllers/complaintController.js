const Complaint = require('../models/Complaint');


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

        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, description and category are required'
            });
        }

        const allowedCategories = [
            'plumbing',
            'electrical',
            'cleaning',
            'security',
            'lift',
            'parking',
            'water',
            'maintenance',
            'other'
        ];

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid complaint category'
            });
        }

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

        if (
            images !== undefined &&
            (!Array.isArray(images) ||
                images.length > 5 ||
                !images.every(image => typeof image === 'string'))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Images must be an array of up to 5 image URLs'
            });
        }

        const complaint = await Complaint.create({

            societyId: req.user.societyId,

            residentId: req.user._id,

            title: title.trim(),

            description: description.trim(),

            category,

            priority: priority || 'medium',

            images: images || [],

            status: 'pending',

            statusHistory: [{
                status: 'pending',
                remarks: 'Complaint submitted',
                updatedBy: req.user._id
            }]

        });

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint
        });

    } catch (error) {
        console.error('Create Complaint Error:', error);

        res.status(500).json({
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

        if (req.user.role === 'resident') {
            filter.residentId = req.user._id;
        }

        if (
            status &&
            ['pending', 'in-progress', 'resolved', 'rejected'].includes(status)
        ) {
            filter.status = status;
        }

        if (
            category &&
            [
                'plumbing',
                'electrical',
                'cleaning',
                'security',
                'lift',
                'parking',
                'water',
                'maintenance',
                'other'
            ].includes(category)
        ) {
            filter.category = category;
        }

        if (
            priority &&
            ['low', 'medium', 'high', 'urgent'].includes(priority)
        ) {
            filter.priority = priority;
        }

        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    description: {
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

        const [complaints, total] = await Promise.all([

            Complaint.find(filter)
                .populate('residentId', 'fullName email phone flatNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit),

            Complaint.countDocuments(filter)

        ]);

        res.status(200).json({
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

        res.status(500).json({
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
            .populate('residentId', 'fullName email phone flatNumber')
            .populate('statusHistory.updatedBy', 'fullName role');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        res.status(200).json({
            success: true,
            complaint
        });

    } catch (error) {
        console.error('Get Complaint Error:', error);

        res.status(500).json({
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

        res.status(200).json({
            success: true,
            message: 'Complaint status updated successfully',
            complaint
        });

    } catch (error) {
        console.error('Update Complaint Status Error:', error);

        res.status(500).json({
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

        res.status(200).json({
            success: true,
            message: 'Complaint assigned successfully',
            complaint
        });

    } catch (error) {
        console.error('Assign Complaint Error:', error);

        res.status(500).json({
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
                status: { $nin: ['resolved', 'rejected'] }
            })

        ]);

        res.status(200).json({
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

        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint statistics'
        });
    }
};