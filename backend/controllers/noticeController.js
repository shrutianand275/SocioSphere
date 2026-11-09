const Notice = require('../models/Notice');

const categories = [
    'general',
    'maintenance',
    'events',
    'emergency',
    'meetings',
    'security',
    'other'
];

const priorities = ['normal', 'important', 'urgent'];

const statuses = ['draft', 'published', 'archived'];


// ==========================================
// CREATE NOTICE - ADMIN
// ==========================================

exports.createNotice = async (req, res) => {
    try {
        const {
            title,
            content,
            category,
            priority,
            attachments,
            isPinned,
            status,
            publishAt,
            expiresAt
        } = req.body;

        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        if (category && !categories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notice category'
            });
        }

        if (priority && !priorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notice priority'
            });
        }

        if (status && !statuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notice status'
            });
        }

        if (
            attachments !== undefined &&
            (!Array.isArray(attachments) ||
                attachments.length > 5 ||
                !attachments.every(item => typeof item === 'string'))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Provide an array of up to 5 attachment URLs'
            });
        }

        const publicationDate = publishAt
            ? new Date(publishAt)
            : new Date();

        const expiryDate = expiresAt
            ? new Date(expiresAt)
            : null;

        if (
            Number.isNaN(publicationDate.getTime()) ||
            (expiryDate && Number.isNaN(expiryDate.getTime()))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid publication or expiry date'
            });
        }

        if (expiryDate && expiryDate <= publicationDate) {
            return res.status(400).json({
                success: false,
                message: 'Expiry date must be after publication date'
            });
        }

        const notice = await Notice.create({
            societyId: req.user.societyId,
            createdBy: req.user._id,
            title: title.trim(),
            content: content.trim(),
            category: category || 'general',
            priority: priority || 'normal',
            attachments: attachments || [],
            isPinned: Boolean(isPinned),
            status: status || 'draft',
            publishAt: publicationDate,
            expiresAt: expiryDate
        });

        res.status(201).json({
            success: true,
            message: 'Notice created successfully',
            notice
        });

    } catch (error) {
        console.error('Create Notice Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to create notice'
        });
    }
};


// ==========================================
// GET NOTICES
// ADMIN: ALL SOCIETY NOTICES
// RESIDENT: PUBLISHED, CURRENT NOTICES
// ==========================================

exports.getNotices = async (req, res) => {
    try {
        const {
            category,
            status,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {
            societyId: req.user.societyId
        };

        if (req.user.role === 'resident') {
            const now = new Date();

            filter.status = 'published';
            filter.publishAt = { $lte: now };

            filter.$or = [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ];

        } else if (status && statuses.includes(status)) {
            filter.status = status;
        }

        if (category && categories.includes(category)) {
            filter.category = category;
        }

        if (search?.trim()) {
            filter.$and = [
                ...(filter.$and || []),
                {
                    $or: [
                        {
                            title: {
                                $regex: search.trim(),
                                $options: 'i'
                            }
                        },
                        {
                            content: {
                                $regex: search.trim(),
                                $options: 'i'
                            }
                        }
                    ]
                }
            ];
        }

        const currentPage = Math.max(1, Number(page) || 1);

        const pageLimit = Math.min(
            100,
            Math.max(1, Number(limit) || 10)
        );

        const skip = (currentPage - 1) * pageLimit;

        const [notices, total] = await Promise.all([
            Notice.find(filter)
                .populate('createdBy', 'fullName')
                .sort({ isPinned: -1, publishAt: -1 })
                .skip(skip)
                .limit(pageLimit),

            Notice.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            notices,
            pagination: {
                total,
                currentPage,
                totalPages: Math.ceil(total / pageLimit),
                pageLimit
            }
        });

    } catch (error) {
        console.error('Get Notices Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch notices'
        });
    }
};


// ==========================================
// GET SINGLE NOTICE
// ==========================================

exports.getNoticeById = async (req, res) => {
    try {
        const filter = {
            _id: req.params.id,
            societyId: req.user.societyId
        };

        if (req.user.role === 'resident') {
            const now = new Date();

            filter.status = 'published';
            filter.publishAt = { $lte: now };

            filter.$or = [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ];
        }

        const notice = await Notice.findOne(filter)
            .populate('createdBy', 'fullName');

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        res.status(200).json({
            success: true,
            notice
        });

    } catch (error) {
        console.error('Get Notice Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch notice'
        });
    }
};


// ==========================================
// UPDATE NOTICE - ADMIN
// ==========================================

exports.updateNotice = async (req, res) => {
    try {
        const allowedFields = [
            'title',
            'content',
            'category',
            'priority',
            'attachments',
            'isPinned',
            'status',
            'publishAt',
            'expiresAt'
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (
            updates.title !== undefined &&
            !updates.title.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Title cannot be empty'
            });
        }

        if (
            updates.content !== undefined &&
            !updates.content.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Content cannot be empty'
            });
        }

        if (
            updates.category &&
            !categories.includes(updates.category)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        if (
            updates.priority &&
            !priorities.includes(updates.priority)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid priority'
            });
        }

        if (
            updates.status &&
            !statuses.includes(updates.status)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const existingNotice = await Notice.findOne({
            _id: req.params.id,
            societyId: req.user.societyId
        });

        if (!existingNotice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        const publicationDate = updates.publishAt !== undefined
            ? new Date(updates.publishAt)
            : existingNotice.publishAt;

        const expiryDate = updates.expiresAt !== undefined
            ? (updates.expiresAt ? new Date(updates.expiresAt) : null)
            : existingNotice.expiresAt;

        if (
            Number.isNaN(publicationDate.getTime()) ||
            (expiryDate && Number.isNaN(expiryDate.getTime()))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid publication or expiry date'
            });
        }

        if (expiryDate && expiryDate <= publicationDate) {
            return res.status(400).json({
                success: false,
                message: 'Expiry date must be after publication date'
            });
        }

        const notice = await Notice.findOneAndUpdate(
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

        res.status(200).json({
            success: true,
            message: 'Notice updated successfully',
            notice
        });

    } catch (error) {
        console.error('Update Notice Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update notice'
        });
    }
};


// ==========================================
// DELETE NOTICE - ADMIN
// ==========================================

exports.deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findOneAndDelete({
            _id: req.params.id,
            societyId: req.user.societyId
        });

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notice deleted successfully'
        });

    } catch (error) {
        console.error('Delete Notice Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to delete notice'
        });
    }
};


// ==========================================
// NOTICE STATISTICS - ADMIN
// ==========================================

exports.getNoticeStats = async (req, res) => {
    try {
        const societyId = req.user.societyId;

        const now = new Date();

        const [
            total,
            published,
            drafts,
            archived,
            pinned
        ] = await Promise.all([
            Notice.countDocuments({ societyId }),

            Notice.countDocuments({
                societyId,
                status: 'published',
                publishAt: { $lte: now },
                $or: [
                    { expiresAt: null },
                    { expiresAt: { $gt: now } }
                ]
            }),

            Notice.countDocuments({
                societyId,
                status: 'draft'
            }),

            Notice.countDocuments({
                societyId,
                status: 'archived'
            }),

            Notice.countDocuments({
                societyId,
                isPinned: true
            })
        ]);

        res.status(200).json({
            success: true,
            stats: {
                total,
                published,
                drafts,
                archived,
                pinned
            }
        });

    } catch (error) {
        console.error('Notice Stats Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch notice statistics'
        });
    }
};