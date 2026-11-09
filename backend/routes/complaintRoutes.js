const express = require('express');

const router = express.Router();

const {
    createComplaint,
    getComplaints,
    getComplaintById,
    updateComplaintStatus,
    assignComplaint,
    getComplaintStats
} = require('../controllers/complaintController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

// All complaint routes require authentication
router.use(protect);

// Resident and admin can view permitted complaints
router.get('/', getComplaints);

router.get('/:id', getComplaintById);

// Resident can submit a complaint
router.post(
    '/',
    authorize('resident'),
    createComplaint
);

// Admin-only operations
router.get(
    '/admin/stats',
    authorize('admin'),
    getComplaintStats
);

router.patch(
    '/:id/status',
    authorize('admin'),
    updateComplaintStatus
);

router.patch(
    '/:id/assign',
    authorize('admin'),
    assignComplaint
);

module.exports = router;