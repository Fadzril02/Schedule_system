const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// POST: Check email and return User Role + ID
router.post('/login', async (req, res) => {
    const { email } = req.body;
    try {
        const sql = `SELECT * FROM users WHERE email = '${email}'`;
        const users = await executeQuery(sql);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "Email not found." });
        }

        const user = users[0];
        res.json({
            success: true,
            role: user.role, 
            id: user.id,
            name: user.name
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;