const mongoose = require('mongoose');

const Voting = require('../models/Voting');
const Vote = require('../models/Vote');

const validCategories = [
    'general',
    'maintenance',
    'security',
    'events',
    'facilities',
    'other'
];

const validStatuses = ['draft', 'active', 'closed'];


// ========================================
// CREATE POLL - ADMIN
// ========================================

exports.createVoting = async (req, res) => {

    try {

        const {
            title,
            description,
            category,
            options,
            startDate,
            endDate,
            status,
            showResults
        } = req.body;

        if (!title?.trim() || !description?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        if (
            !Array.isArray(options) ||
            options.length < 2 ||
            options.length > 10
        ) {
            return res.status(400).json({
                success: false,
                message: 'A poll must have between 2 and 10 options'
            });
        }

        const cleanedOptions = options.map(option => ({
            text: typeof option === 'string'
                ? option.trim()
                : option.text?.trim()
        }));

        if (cleanedOptions.some(option => !option.text)) {
            return res.status(400).json({
                success: false,
                message: 'All voting options must have text'
            });
        }

        if (
            category &&
            !validCategories.includes(category)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid poll category'
            });
        }

        if (
            status &&
            !validStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid poll status'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (
            !startDate ||
            !endDate ||
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid poll dates'
            });
        }

        const voting = await Voting.create({

            societyId: req.user.societyId,

            createdBy: req.user._id,

            title: title.trim(),

            description: description.trim(),

            category: category || 'general',

            options: cleanedOptions,

            startDate: start,

            endDate: end,

            status: status || 'draft',

            showResults: showResults !== false

        });

        res.status(201).json({
            success: true,
            message: 'Poll created successfully',
            voting
        });

    } catch (error) {

        console.error('Create Voting Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to create poll'
        });

    }

};


// ========================================
// GET POLLS
// ========================================

exports.getVotings = async (req, res) => {

    try {

        const filter = {
            societyId: req.user.societyId
        };

        if (req.user.role === 'resident') {

            const now = new Date();

            filter.status = 'active';

            filter.startDate = { $lte: now };

            filter.endDate = { $gt: now };

        } else if (
            req.query.status &&
            validStatuses.includes(req.query.status)
        ) {

            filter.status = req.query.status;

        }

        if (
            req.query.category &&
            validCategories.includes(req.query.category)
        ) {
            filter.category = req.query.category;
        }

        if (req.query.search?.trim()) {

            filter.title = {
                $regex: req.query.search.trim(),
                $options: 'i'
            };

        }

        const votings = await Voting.find(filter)
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 });

        const now = new Date();

        const results = await Promise.all(
            votings.map(async voting => {

                const totalVotes = await Vote.countDocuments({
                    votingId: voting._id
                });

                const residentVote = req.user.role === 'resident'
                    ? await Vote.findOne({
                        votingId: voting._id,
                        residentId: req.user._id
                    })
                    : null;

                const data = voting.toObject();

                data.totalVotes = totalVotes;

                data.hasVoted = Boolean(residentVote);

                data.isExpired = voting.endDate <= now;

                // Hide vote counts until permitted
                if (
                    req.user.role === 'resident' &&
                    !voting.showResults
                ) {
                    data.options = data.options.map(option => ({
                        ...option,
                        votesCount: undefined
                    }));
                }

                return data;

            })
        );

        res.status(200).json({
            success: true,
            votings: results
        });

    } catch (error) {

        console.error('Get Votings Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch polls'
        });

    }

};


// ========================================
// GET SINGLE POLL
// ========================================

exports.getVotingById = async (req, res) => {

    try {

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid poll ID'
            });
        }

        const filter = {
            _id: req.params.id,
            societyId: req.user.societyId
        };

        if (req.user.role === 'resident') {

            const now = new Date();

            filter.status = 'active';
            filter.startDate = { $lte: now };
            filter.endDate = { $gt: now };

        }

        const voting = await Voting.findOne(filter);

        if (!voting) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        const hasVoted = req.user.role === 'resident'
            ? Boolean(await Vote.findOne({
                votingId: voting._id,
                residentId: req.user._id
            }))
            : false;

        const data = voting.toObject();

        data.totalVotes = await Vote.countDocuments({
            votingId: voting._id
        });

        data.hasVoted = hasVoted;

        if (
            req.user.role === 'resident' &&
            !voting.showResults
        ) {
            data.options = data.options.map(option => ({
                _id: option._id,
                text: option.text
            }));
        }

        res.status(200).json({
            success: true,
            voting: data
        });

    } catch (error) {

        console.error('Get Voting Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch poll'
        });

    }

};


// ========================================
// SUBMIT VOTE - RESIDENT
// ========================================

exports.submitVote = async (req, res) => {

    try {

        const { optionId } = req.body;

        if (!mongoose.isValidObjectId(req.params.id) ||
            !mongoose.isValidObjectId(optionId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid poll or option ID'
            });
        }

        const now = new Date();

        const voting = await Voting.findOne({
            _id: req.params.id,
            societyId: req.user.societyId,
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gt: now }
        });

        if (!voting) {
            return res.status(400).json({
                success: false,
                message: 'This poll is not currently accepting votes'
            });
        }

        const selectedOption = voting.options.id(optionId);

        if (!selectedOption) {
            return res.status(400).json({
                success: false,
                message: 'Invalid voting option'
            });
        }

        try {

            await Vote.create({

                votingId: voting._id,

                residentId: req.user._id,

                societyId: req.user.societyId,

                optionId

            });

        } catch (error) {

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'You have already voted in this poll'
                });
            }

            throw error;

        }

        await Voting.updateOne(
            {
                _id: voting._id,
                'options._id': optionId
            },
            {
                $inc: {
                    'options.$.votesCount': 1
                }
            }
        );

        res.status(201).json({
            success: true,
            message: 'Your vote has been submitted successfully'
        });

    } catch (error) {

        console.error('Submit Vote Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to submit vote'
        });

    }

};


// ========================================
// UPDATE POLL - ADMIN
// ========================================

exports.updateVoting = async (req, res) => {

    try {

        const voting = await Voting.findOne({
            _id: req.params.id,
            societyId: req.user.societyId
        });

        if (!voting) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        const existingVotes = await Vote.countDocuments({
            votingId: voting._id
        });

        if (existingVotes > 0) {
            return res.status(400).json({
                success: false,
                message: 'A poll with submitted votes cannot be edited'
            });
        }

        const {
            title,
            description,
            category,
            options,
            startDate,
            endDate,
            status,
            showResults
        } = req.body;

        if (title !== undefined) voting.title = title.trim();

        if (description !== undefined) {
            voting.description = description.trim();
        }

        if (
            category !== undefined &&
            !validCategories.includes(category)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        if (category !== undefined) voting.category = category;

        if (options !== undefined) {

            if (
                !Array.isArray(options) ||
                options.length < 2 ||
                options.length > 10
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Provide between 2 and 10 options'
                });
            }

            const cleanedOptions = options.map(option => ({
                text: typeof option === 'string'
                    ? option.trim()
                    : option.text?.trim(),
                votesCount: 0
            }));

            if (cleanedOptions.some(option => !option.text)) {
                return res.status(400).json({
                    success: false,
                    message: 'All options must have text'
                });
            }

            voting.options = cleanedOptions;
        }

        if (startDate !== undefined) voting.startDate = new Date(startDate);

        if (endDate !== undefined) voting.endDate = new Date(endDate);

        if (status !== undefined) {

            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid poll status'
                });
            }

            voting.status = status;
        }

        if (showResults !== undefined) {
            voting.showResults = Boolean(showResults);
        }

        if (
            Number.isNaN(voting.startDate.getTime()) ||
            Number.isNaN(voting.endDate.getTime()) ||
            voting.endDate <= voting.startDate
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid poll dates'
            });
        }

        await voting.save();

        res.status(200).json({
            success: true,
            message: 'Poll updated successfully',
            voting
        });

    } catch (error) {

        console.error('Update Voting Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update poll'
        });

    }

};


// ========================================
// CLOSE POLL - ADMIN
// ========================================

exports.closeVoting = async (req, res) => {

    try {

        const voting = await Voting.findOneAndUpdate(
            {
                _id: req.params.id,
                societyId: req.user.societyId
            },
            {
                status: 'closed'
            },
            {
                new: true
            }
        );

        if (!voting) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Poll closed successfully',
            voting
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to close poll'
        });

    }

};


// ========================================
// DELETE POLL - ADMIN
// ========================================

exports.deleteVoting = async (req, res) => {

    try {

        const voting = await Voting.findOne({
            _id: req.params.id,
            societyId: req.user.societyId
        });

        if (!voting) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        const existingVotes = await Vote.countDocuments({
            votingId: voting._id
        });

        if (existingVotes > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a poll that already has votes'
            });
        }

        await voting.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Poll deleted successfully'
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to delete poll'
        });

    }

};


// ========================================
// POLL RESULTS
// ========================================

exports.getVotingResults = async (req, res) => {

    try {

        const voting = await Voting.findOne({
            _id: req.params.id,
            societyId: req.user.societyId
        });

        if (!voting) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        if (
            req.user.role === 'resident' &&
            !voting.showResults
        ) {
            return res.status(403).json({
                success: false,
                message: 'Results are not available for this poll'
            });
        }

        const totalVotes = await Vote.countDocuments({
            votingId: voting._id
        });

        const results = voting.options.map(option => ({
            optionId: option._id,
            text: option.text,
            votes: option.votesCount,
            percentage: totalVotes
                ? Number((option.votesCount / totalVotes * 100).toFixed(2))
                : 0
        }));

        res.status(200).json({
            success: true,
            title: voting.title,
            totalVotes,
            results
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to fetch voting results'
        });

    }

};


// ========================================
// POLL STATISTICS - ADMIN
// ========================================

exports.getVotingStats = async (req, res) => {

    try {

        const societyId = req.user.societyId;

        const [
            total,
            active,
            drafts,
            closed,
            votes
        ] = await Promise.all([

            Voting.countDocuments({ societyId }),

            Voting.countDocuments({
                societyId,
                status: 'active',
                startDate: { $lte: new Date() },
                endDate: { $gt: new Date() }
            }),

            Voting.countDocuments({
                societyId,
                status: 'draft'
            }),

            Voting.countDocuments({
                societyId,
                status: 'closed'
            }),

            Vote.countDocuments({ societyId })

        ]);

        res.status(200).json({
            success: true,
            stats: {
                total,
                active,
                drafts,
                closed,
                votes
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to fetch voting statistics'
        });

    }

};