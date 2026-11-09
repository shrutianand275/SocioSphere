const User = require('../models/User');
const Society = require('../models/Society');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            societyId: user.societyId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );

};


// RESIDENT REGISTRATION
exports.register = async (req, res) => {

    try {

        const {
            fullName,
            email,
            phone,
            password,
            flatNumber,
            societyCode
        } = req.body;

        if (
            !fullName ||
            !email ||
            !phone ||
            !password ||
            !flatNumber ||
            !societyCode
        ) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check existing user
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered'
            });
        }

        // Find society
        const society = await Society.findOne({
            societyCode: societyCode.trim().toUpperCase(),
            isActive: true
        });

        if (!society) {
            return res.status(404).json({
                success: false,
                message: 'Invalid society code'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create resident
        const user = await User.create({

            fullName: fullName.trim(),

            email: normalizedEmail,

            phone,

            password: hashedPassword,

            flatNumber: flatNumber.trim(),

            societyId: society._id,

            role: 'resident',

            approvalStatus: 'pending'

        });

        res.status(201).json({

            success: true,

            message: 'Registration successful. Please wait for admin approval.',

            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus
            }

        });

    } catch (error) {

        console.error('Registration Error:', error);

        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });

    }

};


// LOGIN
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        })
        .select('+password')
        .populate('societyId', 'societyName societyCode');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account is inactive'
            });
        }

        if (
            user.role === 'resident' &&
            user.approvalStatus !== 'approved'
        ) {
            return res.status(403).json({
                success: false,
                message: `Your account is ${user.approvalStatus}. Please contact your society administrator.`
            });
        }

        const token = generateToken(user);

        res.status(200).json({

            success: true,

            message: 'Login successful',

            token,

            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                flatNumber: user.flatNumber,
                role: user.role,
                society: user.societyId
            }

        });

    } catch (error) {

        console.error('Login Error:', error);

        res.status(500).json({
            success: false,
            message: 'Login failed'
        });

    }

};