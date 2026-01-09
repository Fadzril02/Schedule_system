const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection, executeStoredProcedure, executeQuery, closePool } = require('./src/config/database');
require('dotenv').config();

const authRoutes = require('./src/routes/routes');
const taskSchedulingRoutes = require('./src/routes/taskSchedulingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false // Needed for development
}));

// CORS configuration for frontend
app.use(cors({
    origin: ['http://localhost:5173'|| 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests from this IP',
        message: 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ 
    limit: '10mb',
    strict: true
}));
app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
}));



// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/task-scheduling', taskSchedulingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'Library Duty System API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
    });
});

// Test database endpoint (we'll add this after database setup)
app.get('/api/test-db', async (req, res) => {
    try{
        const isConnected = await testConnection();

        if (isConnected){
             // Test a simple query to get user count
            const users = await executeQuery('SELECT COUNT(*) as user_count FROM schedule_management.user');
            
            res.json({
                success: true,
                message: 'Database connection successful',
                database: process.env.DB_NAME,
                userCount: users[0].user_count,
                timestamp: new Date().toISOString()
            });
        }else{
            res.status(500).json({
                error: true,
                message: 'Database connection failed'
            });
        }
    }catch (error){
        console.error('Database test error:', error);
        res.status(500).json({
            error: true,
            message: 'Database test failed',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
        });
    }
});


// Test stored procedure endpoint
app.get('/api/test-procedures', async (req, res) => {
    try {
        // Test viewing student accounts (this should be safe to test)
        const students = await executeStoredProcedure('p_view_student_acc');
        
        res.json({
            success: true,
            message: 'Stored procedure test successful',
            procedureTested: 'p_view_student_acc',
            studentCount: students.length,
            sampleData: students.slice(0, 2), // Return first 2 records as sample
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stored procedure test error:', error);
        res.status(500).json({
            error: true,
            message: 'Stored procedure test failed',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
        });
    }
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    
    res.status(err.status || 500).json({
        error: true,
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler for undefined routes
app.use( (req, res) => {
    res.status(404).json({ 
        error: true,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /api/health',
            'GET /api/test-db',
            'GET /api/test-procedures',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/profile'
        ]
    });
});


// Start server
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log('\n🚀 === LIBRARY DUTY SYSTEM API ===');
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
            console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL}`);
            console.log('================================\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
    process.exit(0);
});


process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
    process.exit(0);
});




startServer();