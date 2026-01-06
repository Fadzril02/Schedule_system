const db = require('../config/database');

// 1. GET ALL SCHEDULES (With User Names and Duty Details)
exports.getAllSchedules = async (req, res) => {
    try {
        // We use INNER JOIN to combine the 3 tables
        const query = `
            SELECT 
                ds.id,
                u.username AS student_name,
                d.duty_name,
                d.location,
                DATE_FORMAT(ds.shift_date, '%Y-%m-%d') as date,
                ds.start_time,
                ds.end_time,
                ds.status
            FROM duty_schedule ds
            JOIN users u ON ds.user_id = u.id
            JOIN duties d ON ds.duty_id = d.id
            ORDER BY ds.shift_date ASC;
        `;
        
        const results = await db.executeQuery(query);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching schedules:", error);
        res.status(500).json({ error: "Failed to fetch schedules" });
    }
};

// 2. ASSIGN A NEW DUTY (Create)
exports.assignDuty = async (req, res) => {
    const { user_id, duty_id, shift_date, start_time, end_time } = req.body;

    // Simple Validation
    if (!user_id || !duty_id || !shift_date) {
        return res.status(400).json({ error: "User, Duty, and Date are required" });
    }

    try {
        const query = `
            INSERT INTO duty_schedule (user_id, duty_id, shift_date, start_time, end_time) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await db.executeQuery(query, [user_id, duty_id, shift_date, start_time, end_time]);
        res.status(201).json({ message: "Duty Assigned Successfully!", id: result.insertId });
    } catch (error) {
        console.error("Error assigning duty:", error);
        res.status(500).json({ error: error.message });
    }
};