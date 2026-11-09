const express = require('express');

const router = express.Router();

const {
    getDashboardStats,
    getAllResidents,
    approveResident,
    rejectResident,
    toggleResidentStatus
} = require('../controllers/adminController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

// All routes below require admin authentication
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Resident management
router.get('/residents', getAllResidents);

router.patch('/residents/:id/approve', approveResident);

router.patch('/residents/:id/reject', rejectResident);

router.patch('/residents/:id/toggle-status', toggleResidentStatus);

module.exports = router;