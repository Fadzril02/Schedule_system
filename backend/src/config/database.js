const mysql = require('mysql2/promise'); // We use the promise version for async/await
require('dotenv').config();

// 1. Create the Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    
    // 🚨 ADD THESE 2 LINES TO FIX "ECONNRESET" 🚨
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// 2. Test the Connection on Startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ TiDB Cloud Connected Successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
    }
})();

// 3. Helper Function (Matches your Controller)
// This lets you keep using "db.executeQuery()" in your controllers
async function executeQuery(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error("Database Query Error:", error.message);
        throw error; // Pass error back to controller
    }
}

// Export it so your controllers can use it
module.exports = { executeQuery, pool };