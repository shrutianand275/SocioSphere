const express = require('express');
const router = express.Router();

const {
    getExpenses,
    getExpenseStats,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense
} = require('../controllers/expenseController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Admin and resident: read-only endpoints
router.get('/', getExpenses);
router.get('/stats', getExpenseStats);
router.get('/:id', getExpenseById);

// Admin only: write endpoints
router.post('/', authorize('admin'), createExpense);
router.put('/:id', authorize('admin'), updateExpense);
router.delete('/:id', authorize('admin'), deleteExpense);

module.exports = router;