const express = require('express');
const router = express.Router();

const {
    getMyProfile,
    updateMyProfile,
    changePassword
} = require('../controllers/profileController');

const { protect } = require('../middleware/authMiddleware');

// All profile routes require authentication
router.use(protect);

// Get own profile
router.get('/me', getMyProfile);

// Update own profile
router.put('/me', updateMyProfile);

// Change own password
router.put('/change-password', changePassword);

module.exports = router;