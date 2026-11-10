const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({

    votingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voting',
        required: true
    },

    residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true
    },

    optionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }

}, {
    timestamps: true
});

// One vote per resident per poll
voteSchema.index(
    {
        votingId: 1,
        residentId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model('Vote', voteSchema);