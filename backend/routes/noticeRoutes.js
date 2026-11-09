const express = require('express');

const router = express.Router();

const {
    createNotice,
    getNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
    getNoticeStats
} = require('../controllers/noticeController');

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

router.use(protect);

// Resident and admin
router.get('/', getNotices);
router.get('/:id', getNoticeById);

// Admin only
router.use(authorize('admin'));

router.get('/admin/stats', getNoticeStats);

router.post('/', createNotice);

router.patch('/:id', updateNotice);

router.delete('/:id', deleteNotice);

module.exports = router;