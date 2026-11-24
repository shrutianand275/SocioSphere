const Society = require('../models/Society');

// Get logged-in user's society
exports.getMySociety = async (req, res) => {
    try {
        const society = await Society.findById(req.user.societyId);

        if (!society) {
            return res.status(404).json({
                success: false,
                message: 'Society not found'
            });
        }

        res.status(200).json({
            success: true,
            society
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to fetch society information',
            error: error.message
        });
    }
};


// Update society information - Admin only
exports.updateSociety = async (req, res) => {
    try {
        const allowedFields = [
            'societyName',
            'registrationNumber',
            'address',
            'city',
            'state',
            'pincode',
            'contactEmail',
            'contactPhone',
            'description',
            'establishedYear'
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided'
            });
        }

        if (
            updates.societyName !== undefined &&
            (typeof updates.societyName !== 'string' ||
                !updates.societyName.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Society name cannot be empty'
            });
        }

        if (
            updates.contactEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.contactEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contact email'
            });
        }

        if (
            updates.contactPhone &&
            !/^[0-9]{10}$/.test(updates.contactPhone)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Contact phone must contain 10 digits'
            });
        }

        if (
            updates.pincode &&
            !/^[0-9]{6}$/.test(updates.pincode)
        ) {
            return res.status(400).json({
                success: false,
                message: 'PIN code must contain 6 digits'
            });
        }

        const society = await Society.findByIdAndUpdate(
            req.user.societyId,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!society) {
            return res.status(404).json({
                success: false,
                message: 'Society not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Society information updated successfully',
            society
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Unable to update society information',
            error: error.message
        });
    }
};


// Update complaint categories - Admin only
exports.updateComplaintCategories = async (req, res) => {
    try {
        const { categories } = req.body;

        if (
            !Array.isArray(categories) ||
            categories.length === 0 ||
            categories.some(
                item => typeof item !== 'string' || !item.trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'Provide at least one valid complaint category'
            });
        }

        const uniqueCategories = [
            ...new Map(
                categories.map(item => [
                    item.trim().toLowerCase(),
                    item.trim()
                ])
            ).values()
        ];

        const society = await Society.findByIdAndUpdate(
            req.user.societyId,
            {
                $set: {
                    complaintCategories: uniqueCategories
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!society) {
            return res.status(404).json({
                success: false,
                message: 'Society not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Complaint categories updated successfully',
            categories: society.complaintCategories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to update complaint categories',
            error: error.message
        });
    }
};


// Update expense categories - Admin only
exports.updateExpenseCategories = async (req, res) => {
    try {
        const { categories } = req.body;

        if (
            !Array.isArray(categories) ||
            categories.length === 0 ||
            categories.some(
                item => typeof item !== 'string' || !item.trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'Provide at least one valid expense category'
            });
        }

        const uniqueCategories = [
            ...new Map(
                categories.map(item => [
                    item.trim().toLowerCase(),
                    item.trim()
                ])
            ).values()
        ];

        const society = await Society.findByIdAndUpdate(
            req.user.societyId,
            {
                $set: {
                    expenseCategories: uniqueCategories
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!society) {
            return res.status(404).json({
                success: false,
                message: 'Society not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense categories updated successfully',
            categories: society.expenseCategories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to update expense categories',
            error: error.message
        });
    }
};


// Update emergency information - Admin only
exports.updateEmergencyInformation = async (req, res) => {
    try {
        const allowedFields = [
            'policeNumber',
            'ambulanceNumber',
            'fireBrigadeNumber',
            'nearestHospitalName',
            'nearestHospitalAddress',
            'nearestHospitalPhone',
            'societyEmergencyContact',
            'maintenanceEmergencyContact'
        ];

        const emergencyInformation = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                emergencyInformation[field] =
                    typeof req.body[field] === 'string'
                        ? req.body[field].trim()
                        : req.body[field];
            }
        });

        if (Object.keys(emergencyInformation).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Provide emergency information'
            });
        }

        // Only hospital, society and maintenance contacts
        // retain the 10-15 digit validation.
        const phoneFields = [
            'nearestHospitalPhone',
            'societyEmergencyContact',
            'maintenanceEmergencyContact'
        ];

        for (const field of phoneFields) {
            const value = emergencyInformation[field];

            if (
                value !== undefined &&
                value !== '' &&
                (
                    typeof value !== 'string' ||
                    !/^[0-9]{10,15}$/.test(value)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} must contain 10 to 15 digits`
                });
            }
        }

        const updates = {};

        Object.entries(emergencyInformation).forEach(([key, value]) => {
            updates[`emergencyInformation.${key}`] = value;
        });

        const society = await Society.findByIdAndUpdate(
            req.user.societyId,
            {
                $set: updates
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!society) {
            return res.status(404).json({
                success: false,
                message: 'Society not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Emergency information updated successfully',
            emergencyInformation: society.emergencyInformation
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Unable to update emergency information',
            error: error.message
        });
    }
};