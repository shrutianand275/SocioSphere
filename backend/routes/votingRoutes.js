const express = require('express');

const router = express.Router();

const {
    protect,
    authorize
} = require('../middleware/authMiddleware');

const {
    createVoting,
    getVotings,
    getVotingById,
    submitVote,
    updateVoting,
    closeVoting,
    deleteVoting,
    getVotingResults,
    getVotingStats
} = require('../controllers/votingController');

router.use(protect);

// Admin and resident routes
router.get('/', getVotings);

router.get('/admin/stats', authorize('admin'), getVotingStats);

router.get('/:id/results', getVotingResults);

router.get('/:id', getVotingById);

// Resident voting
router.post('/:id/vote', authorize('resident'), submitVote);

// Admin management
router.post('/', authorize('admin'), createVoting);

router.patch('/:id', authorize('admin'), updateVoting);

router.patch('/:id/close', authorize('admin'), closeVoting);

router.delete('/:id', authorize('admin'), deleteVoting);

module.exports = router;