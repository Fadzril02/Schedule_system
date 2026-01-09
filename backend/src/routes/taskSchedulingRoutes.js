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
router.post('/auto-assign', async (req, res) => {
    try {
        // Step A: Clear old pending schedules to avoid duplicates
        await executeQuery("DELETE FROM schedule_management.task_schedule WHERE status = 'Pending'");
        // Step B: Get all students
        const students = await executeQuery("SELECT id, name, standard FROM users");

        // Step C: Define the Tasks & Time Rules
        const juniorTasks = ['Cleaning/Tidying PSS', 'Counter Duty'];
        const seniorTasks = ['Key in Books', 'Process Books', 'Cleaning PSS'];
        
        // Helper to pick a random item
        const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        // Step D: Calculate dates for this week (Monday to Thursday)
        const today = new Date();
        const currentDay = today.getDay(); // 0=Sun, 1=Mon...
        const distanceToMon = 1 - currentDay; // How far back/forward is Monday?
        
        let assignments = [];

        // Loop through Mon(0) to Thu(3)
        for (let i = 0; i < 4; i++) {
            // Create the date object for this specific day
            let dutyDate = new Date(today);
            dutyDate.setDate(today.getDate() + distanceToMon + i);
            let dateString = dutyDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
            // Get Day Name (Monday, Tuesday...)
            let dayName = dutyDate.toLocaleDateString('en-US', { weekday: 'long' });

            // Assign every student for this day
            students.forEach(student => {
                let startTime, endTime, task, type;

                // === LOGIC RULES ===
                if (student.standard == 2 || student.standard == 3) {
                    // JUNIORS (Std 2-3)
                    startTime = '09:40:00';
                    endTime = '10:00:00';
                    task = pickRandom(juniorTasks);
                    type = 'Light Duty';
                } else if (student.standard >= 4) {
                    // SENIORS (Std 4-6)
                    startTime = '10:00:00';
                    endTime = '10:30:00';
                    task = pickRandom(seniorTasks);
                    type = 'Heavy Duty';
                }

                if (startTime) {
                    // Add query to the list (We use a safe parameterized query style string)
                    assignments.push(`(
                        ${student.id}, 
                        "${student.name}", 
                        "${dateString}", 
                        "${dayName}", 
                        "${startTime}", 
                        "${endTime}", 
                        "${task}", 
                        "${type}", 
                        "Pending"
                    )`);
                }
            });
        }

        // Step E: Save to Database (Bulk Insert)
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
            message: "Auto-Assignment Complete! Junior & Senior schedules generated." 
        });

    } catch (error) {
        console.error("Auto-Assign Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate schedule." });
    }
});

module.exports = router;