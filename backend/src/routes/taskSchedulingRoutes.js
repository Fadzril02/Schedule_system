const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// 1. GET Route: Fetch schedule AND Class Name (The JOIN Fix)
router.get('/', async (req, res) => {
    try {
        // We link task_schedule (t) with users (u) using the student ID
        // This lets us grab 'u.class_name' even though it's not in the task table
        const sql = `
            SELECT t.*, u.class_name 
            FROM task_schedule t
            JOIN users u ON t.student_id = u.id
            ORDER BY t.task_date, t.start_time
        `;
        const result = await executeQuery(sql);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. POST Route: The "Auto-Assign" Logic (Random Roster)
router.post('/auto-assign', async (req, res) => {
    try {
        // Step A: Clear old pending schedules
        await executeQuery("DELETE FROM task_schedule WHERE status = 'Pending'");

        // Step B: Get all students
        const students = await executeQuery("SELECT id, name, standard FROM users");

        // Step C: Shuffle Function
        const shuffle = (array) => array.sort(() => Math.random() - 0.5);
        
        const juniors = shuffle(students.filter(s => s.standard <= 3));
        const seniors = shuffle(students.filter(s => s.standard >= 4));

        // Step D: Define Tasks
        const juniorTasks = ['Cleaning PSS', 'Counter Duty', 'Tidying Books'];
        const seniorTasks = ['Key in Books', 'Process Books', 'Cleaning PSS', 'System Check'];
        const pickTask = (arr) => arr[Math.floor(Math.random() * arr.length)];

        // Step E: Loop through Mon(0) to Thu(3)
        const today = new Date();
        const currentDay = today.getDay(); 
        const distanceToMon = 1 - currentDay;
        
        let assignments = [];
        let juniorIndex = 0; 
        let seniorIndex = 0; 

        for (let i = 0; i < 4; i++) {
            let dutyDate = new Date(today);
            dutyDate.setDate(today.getDate() + distanceToMon + i);
            let dateString = dutyDate.toISOString().split('T')[0];
            let dayName = dutyDate.toLocaleDateString('en-US', { weekday: 'long' });

            // Assign Junior
            if (juniorIndex < juniors.length) {
                const s = juniors[juniorIndex];
                assignments.push(`(${s.id}, "${s.name}", "${dateString}", "${dayName}", "09:40:00", "10:00:00", "${pickTask(juniorTasks)}", "Light Duty", "Pending")`);
                juniorIndex++;
            }

            // Assign Senior
            if (seniorIndex < seniors.length) {
                const s = seniors[seniorIndex];
                assignments.push(`(${s.id}, "${s.name}", "${dateString}", "${dayName}", "10:00:00", "10:30:00", "${pickTask(seniorTasks)}", "Heavy Duty", "Pending")`);
                seniorIndex++;
            }
        }

        // Step F: Save to Database
        if (assignments.length > 0) {
            const sql = `
                INSERT INTO task_schedule 
                (student_id, student_name, task_date, day_of_week, start_time, end_time, duty_name, task_type, status) 
                VALUES ${assignments.join(', ')}
            `;
            await executeQuery(sql);
        }

        res.json({ success: true, message: "Roster generated successfully!" });

    } catch (error) {
        console.error("Auto-Assign Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate schedule." });
    }
});

module.exports = router;