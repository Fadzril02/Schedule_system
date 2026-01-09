const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// 1. GET Route: Fetch the schedule to show on screen
router.get('/', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM task_schedule ORDER BY task_date, start_time');
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. POST Route: The "Auto-Assign" Logic (Now in JavaScript!)
// 2. POST Route: The "Auto-Assign" Logic (Fixed: Random Roster)
router.post('/auto-assign', async (req, res) => {
    try {
        // Step A: Clear old pending schedules
        await executeQuery("DELETE FROM task_schedule WHERE status = 'Pending'");

        // Step B: Get all students
        const students = await executeQuery("SELECT id, name, standard FROM users");

        // Step C: Separate Juniors (Std 2-3) and Seniors (Std 4-6)
        // We shuffle them immediately so it's random every time
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
        let juniorIndex = 0; // Track which Junior we are using
        let seniorIndex = 0; // Track which Senior we are using

        for (let i = 0; i < 4; i++) {
            // 1. Calculate Date
            let dutyDate = new Date(today);
            dutyDate.setDate(today.getDate() + distanceToMon + i);
            let dateString = dutyDate.toISOString().split('T')[0];
            let dayName = dutyDate.toLocaleDateString('en-US', { weekday: 'long' });

            // 2. Assign ONE Junior for this day (if available)
            if (juniorIndex < juniors.length) {
                const s = juniors[juniorIndex];
                assignments.push(`(${s.id}, "${s.name}", "${dateString}", "${dayName}", "09:40:00", "10:00:00", "${pickTask(juniorTasks)}", "Light Duty", "Pending")`);
                juniorIndex++; // Move to next student
            }

            // 3. Assign ONE Senior for this day (if available)
            if (seniorIndex < seniors.length) {
                const s = seniors[seniorIndex];
                assignments.push(`(${s.id}, "${s.name}", "${dateString}", "${dayName}", "10:00:00", "10:30:00", "${pickTask(seniorTasks)}", "Heavy Duty", "Pending")`);
                seniorIndex++; // Move to next student
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

        res.json({ 
            success: true, 
            message: "Roster generated! Unique students assigned for each day." 
        });

    } catch (error) {
        console.error("Auto-Assign Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate schedule." });
    }
});

module.exports = router;