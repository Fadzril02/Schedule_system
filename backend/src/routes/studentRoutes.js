const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// GET: Public Roster (Strictly for Students & Published Tasks Only)
router.get('/all-schedules', async (req, res) => {
    try {
        const sql = `
            SELECT t.*, u.class_name, u.name as student_name
            FROM task_schedule t
            JOIN users u ON t.student_id = u.id
            WHERE t.status = 'Published'   -- <--- ONLY SHOW PUBLISHED
            AND u.role = 'Student'         -- <--- NO STAFF/ADMINS
            ORDER BY t.task_date, t.start_time
        `;
        const tasks = await executeQuery(sql);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;