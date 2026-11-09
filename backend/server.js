const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Authentication Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Authentication Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Admin Routes
app.use('/api/admin', require('./routes/adminRoutes'));

// Complaint Routes
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
// Home API
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to SocioSphere API',
        status: 'Backend is running successfully'
    });
});

// Home API
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to SocioSphere API',
        status: 'Backend is running successfully'
    });
});

// Health Check API
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SocioSphere Backend is healthy',
        database: 'Connected'
    });
});

// Start Server after database connection
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`SocioSphere Backend running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();