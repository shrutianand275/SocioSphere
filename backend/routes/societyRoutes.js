const express = require('express');
const router = express.Router();

const {
    getMySociety,
    updateSociety,
    updateComplaintCategories,
    updateExpenseCategories,
    updateEmergencyInformation
} = require('../controllers/societyController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

router.use(protect);

// Admin and resident can view their society
router.get('/my-society', getMySociety);

// Admin-only settings
router.put(
    '/update',
    authorize('admin'),
    updateSociety
);

router.put(
    '/complaint-categories',
    authorize('admin'),
    updateComplaintCategories
);

router.put(
    '/expense-categories',
    authorize('admin'),
    updateExpenseCategories
);

// Emergency information - Admin only
router.put(
    '/emergency-information',
    authorize('admin'),
    updateEmergencyInformation
);

module.exports = router;