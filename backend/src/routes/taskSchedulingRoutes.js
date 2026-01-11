const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ==========================================
// 1. AUTO-ASSIGN (Database Based + 4 Students)
// ==========================================
router.post('/auto-assign', async (req, res) => {
    try {
        console.log("🔄 Starting DB-Based Auto-Assign...");

        // A. Clear 'Pending' drafts so we don't duplicate
        await executeQuery(`DELETE FROM task_schedule WHERE status = 'Pending'`);

        // B. Fetch Students & Duties from DATABASE
        const allStudents = await executeQuery(`SELECT * FROM users WHERE role = 'Student'`);
        const allDuties = await executeQuery(`SELECT * FROM duties`); // <--- FETCHING FROM DB NOW

        if (allStudents.length === 0 || allDuties.length === 0) {
            return res.status(400).json({ message: "❌ Error: Missing students or duties in database." });
        }

        // C. Split Juniors (Std 1-3) & Seniors (Std 4-6)
        let juniors = allStudents.filter(s => s.standard && s.standard <= 3);
        let seniors = allStudents.filter(s => s.standard && s.standard >= 4);

        // Fallback if standards are null
        if (juniors.length === 0 && seniors.length === 0) {
            const mid = Math.floor(allStudents.length / 2);
            juniors = allStudents.slice(0, mid);
            seniors = allStudents.slice(mid);
        }

        // D. Setup Loop
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        let jrIndex = 0;
        let srIndex = 0;
        let tasksAssigned = 0;

        // Shuffle for fairness
        juniors.sort(() => Math.random() - 0.5);
        seniors.sort(() => Math.random() - 0.5);

        for (let day of days) {
            // --- SLOT 1: 09:40 (2 JUNIORS) ---
            for (let i = 0; i < 2; i++) {
                if (jrIndex >= juniors.length) jrIndex = 0;
                const student = juniors[jrIndex];
                
                // Pick random duty from DB
                const duty = allDuties[Math.floor(Math.random() * allDuties.length)];

                // Insert
                await executeQuery(`
                    INSERT INTO task_schedule 
                    (student_id, day_of_week, start_time, end_time, duty_name, task_type, status, task_date) 
                    VALUES 
                    (${student.id}, '${day}', '09:40:00', '10:00:00', '${duty.duty_name}', '${duty.duty_type}', 'Pending', NOW())
                `);
                jrIndex++;
                tasksAssigned++;
            }

            // --- SLOT 2: 10:00 (2 SENIORS) ---
            for (let i = 0; i < 2; i++) {
                if (srIndex >= seniors.length) srIndex = 0;
                const student = seniors[srIndex];
                
                const duty = allDuties[Math.floor(Math.random() * allDuties.length)];

                await executeQuery(`
                    INSERT INTO task_schedule 
                    (student_id, day_of_week, start_time, end_time, duty_name, task_type, status, task_date) 
                    VALUES 
                    (${student.id}, '${day}', '10:00:00', '10:30:00', '${duty.duty_name}', '${duty.duty_type}', 'Pending', NOW())
                `);
                srIndex++;
                tasksAssigned++;
            }
        }

        res.json({ success: true, message: `✅ Assigned ${tasksAssigned} tasks from Database!` });

    } catch (error) {
        console.error("Auto-Assign Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. SMART PUBLISH (Removes Old Tasks)
// ==========================================
router.post('/publish', async (req, res) => {
    try {
        // Step 1: Delete OLD 'Published' tasks so the view refreshes
        // (In a real app, you might archive them, but deleting is fine for a weekly reset)
        await executeQuery(`DELETE FROM task_schedule WHERE status = 'Published'`);

        // Step 2: Make the new 'Pending' tasks 'Published'
        await executeQuery(`UPDATE task_schedule SET status = 'Published' WHERE status = 'Pending'`);
        
        res.json({ success: true, message: "Old schedule removed. New schedule published!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. GET SCHEDULES
// ==========================================
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 4. RESET / CLEAR WEEK ROUTE
// ==========================================
router.post('/clear-all', async (req, res) => {
    try {
        // Deletes EVERYTHING (Published AND Pending) to start fresh
        await executeQuery('DELETE FROM task_schedule'); 
        res.json({ success: true, message: "⚠️ Entire schedule has been wiped clean." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;