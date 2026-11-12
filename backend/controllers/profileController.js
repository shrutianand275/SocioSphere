const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get logged-in user's profile
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('societyId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            profile: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to fetch profile',
            error: error.message
        });
    }
};


// Update logged-in user's profile
exports.updateMyProfile = async (req, res) => {
    try {
        const { fullName, phone } = req.body;

        const updates = {};

        if (fullName !== undefined) {
            if (!fullName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Full name cannot be empty'
                });
            }

            updates.fullName = fullName.trim();
        }

        if (phone !== undefined) {
            if (!/^[0-9]{10}$/.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Enter a valid 10-digit phone number'
                });
            }

            updates.phone = phone;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid profile fields provided'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to update profile',
            error: error.message
        });
    }
};


// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must contain at least 8 characters'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully. Please log in again.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to change password',
            error: error.message
        });
    }
};