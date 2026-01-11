const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ==========================================
// 1. AUTO-ASSIGN (Skip Fridays)
// ==========================================
router.post('/auto-assign', async (req, res) => {
    try {
        console.log("🔄 Starting Auto-Assign (No Fridays)...");

        await executeQuery(`DELETE FROM task_schedule WHERE status = 'Pending'`);

        const allStudents = await executeQuery(`SELECT * FROM users WHERE role = 'Student'`);
        const allDuties = await executeQuery(`SELECT * FROM duties`);

        if (allStudents.length === 0 || allDuties.length === 0) {
            return res.status(400).json({ message: "❌ Error: Missing data." });
        }

        let juniors = allStudents.filter(s => s.standard && s.standard <= 3);
        let seniors = allStudents.filter(s => s.standard && s.standard >= 4);

        if (juniors.length === 0 && seniors.length === 0) {
            const mid = Math.floor(allStudents.length / 2);
            juniors = allStudents.slice(0, mid);
            seniors = allStudents.slice(mid);
        }

        // REMOVED 'Friday' from this list
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday']; 
        
        let jrIndex = 0;
        let srIndex = 0;
        let tasksAssigned = 0;

        juniors.sort(() => Math.random() - 0.5);
        seniors.sort(() => Math.random() - 0.5);

        for (let day of days) {
            // 09:40 - Juniors
            for (let i = 0; i < 2; i++) {
                if (jrIndex >= juniors.length) jrIndex = 0;
                const student = juniors[jrIndex];
                const duty = allDuties[Math.floor(Math.random() * allDuties.length)];

                await executeQuery(`
                    INSERT INTO task_schedule (student_id, day_of_week, start_time, end_time, duty_name, task_type, status, task_date) 
                    VALUES (${student.id}, '${day}', '09:40:00', '10:00:00', '${duty.duty_name}', '${duty.duty_type}', 'Pending', NOW())
                `);
                jrIndex++;
                tasksAssigned++;
            }

            // 10:00 - Seniors
            for (let i = 0; i < 2; i++) {
                if (srIndex >= seniors.length) srIndex = 0;
                const student = seniors[srIndex];
                const duty = allDuties[Math.floor(Math.random() * allDuties.length)];

                await executeQuery(`
                    INSERT INTO task_schedule (student_id, day_of_week, start_time, end_time, duty_name, task_type, status, task_date) 
                    VALUES (${student.id}, '${day}', '10:00:00', '10:30:00', '${duty.duty_name}', '${duty.duty_type}', 'Pending', NOW())
                `);
                srIndex++;
                tasksAssigned++;
            }
        }

        res.json({ success: true, message: `✅ Assigned ${tasksAssigned} tasks (Mon-Thu Only).` });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. MANUAL EDIT ROUTE (New!)
// ==========================================
router.put('/update-task/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { student_id, duty_name } = req.body;

        // Update the specific task with new student or duty
        const sql = `
            UPDATE task_schedule 
            SET student_id = ${student_id}, duty_name = '${duty_name}'
            WHERE id = ${id}
        `;
        await executeQuery(sql);
        res.json({ success: true, message: "Task updated successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. DELETE SINGLE TASK (For Manual Removal)
// ==========================================
router.delete('/delete-task/:id', async (req, res) => {
    try {
        await executeQuery(`DELETE FROM task_schedule WHERE id = ${req.params.id}`);
        res.json({ success: true, message: "Task removed." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// (Keep your existing Publish, Clear-All, and Get routes here...)
router.post('/publish', async (req, res) => {
    try {
        await executeQuery(`DELETE FROM task_schedule WHERE status = 'Published'`);
        await executeQuery(`UPDATE task_schedule SET status = 'Published' WHERE status = 'Pending'`);
        res.json({ success: true, message: "New schedule published!" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/clear-all', async (req, res) => {
    try {
        await executeQuery('DELETE FROM task_schedule');
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT t.*, u.name as student_name, u.class_name 
            FROM task_schedule t
            LEFT JOIN users u ON t.student_id = u.id
            ORDER BY t.start_time ASC
        `;
        const tasks = await executeQuery(sql);
        res.json(tasks);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;