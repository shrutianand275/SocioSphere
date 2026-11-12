const express = require('express');
const router = express.Router();

const {
    getSocietyOverview,
    getComplaintAnalytics,
    getExpenseAnalytics,
    getVotingAnalytics,
    getResidentAnalytics
} = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

// Society overview
router.get('/overview', getSocietyOverview);

// Complaint reports
router.get('/complaints', getComplaintAnalytics);

// Expense reports
router.get('/expenses', getExpenseAnalytics);

// Voting reports
router.get('/voting', getVotingAnalytics);

// Resident reports
router.get('/residents', getResidentAnalytics);

module.exports = router;