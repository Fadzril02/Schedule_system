const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection, executeQuery } = require('./src/config/database');
require('dotenv').config();

// ==========================================
// 1. IMPORT ROUTES (Declare ONCE)
// ==========================================
const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const taskSchedulingRoutes = require('./src/routes/taskSchedulingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 2. SECURITY & MIDDLEWARE
// ==========================================
app.use(helmet({
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: { error: 'Too many requests', message: 'Please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb', strict: true }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging (Development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// ==========================================
// 3. REGISTER ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/task-scheduling', taskSchedulingRoutes);

// ==========================================
// 4. TEST ENDPOINTS
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'System API is running', 
        timestamp: new Date().toISOString() 
    });
});

// Database Connection Test
app.get('/api/test-db', async (req, res) => {
    try {
        const isConnected = await testConnection();
        if (isConnected) {
            // Simple query to count users
            const users = await executeQuery('SELECT COUNT(*) as count FROM users');
            res.json({
                success: true,
                message: 'Database Connected!',
                userCount: users[0].count
            });
        } else {
            throw new Error("Connection failed");
        }
    } catch (error) {
        console.error('DB Test Error:', error);
        res.status(500).json({ error: true, message: 'Database test failed' });
    }
});

// ==========================================
// 5. ERROR HANDLING
// ==========================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        error: true, 
        message: `Route ${req.method} ${req.originalUrl} not found` 
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Internal server error'
    });
});

// ==========================================
// 6. START SERVER
// ==========================================
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log('\n🚀 === LIBRARY DUTY SYSTEM API ===');
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log(`👤 Auth Routes:     http://localhost:${PORT}/api/auth`);
            console.log(`🎓 Student Routes:  http://localhost:${PORT}/api/student`);
            console.log(`📅 Schedule Routes: http://localhost:${PORT}/api/task-scheduling`);
            console.log('================================\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();