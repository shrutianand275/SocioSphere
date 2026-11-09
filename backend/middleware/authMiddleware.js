const jwt = require('jsonwebtoken');

const User = require('../models/User');

exports.protect = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive account'
            });
        }

        if (
            user.role === 'resident' &&
            user.approvalStatus !== 'approved'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Account approval required'
            });
        }

        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });

    }

};


// ROLE AUTHORIZATION
exports.authorize = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: 'You do not have permission'
            });

        }

        next();

    };

};